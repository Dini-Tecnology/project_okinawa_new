import { Controller, Get, Post, Query, Body, Param, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { QrCodeService, QRCodeData } from './qr-code.service';
import { QrCodeSecurityService } from './qr-code-security.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';
import { TableQrCode, QRCodeStyle } from '../tables/entities/table-qr-code.entity';
import { TableSession, SessionStatus } from '../tables/entities/table-session.entity';
import { QrScanLog, ScanResult } from '../tables/entities/qr-scan-log.entity';
import { BatchGenerateQRDto } from './dto/batch-generate-qr.dto';
import { StartSessionDto, EndSessionDto } from './dto/table-session.dto';
import { AuthenticatedRequest } from '@common/interfaces/authenticated-user.interface';

@ApiTags('qr-code')
@Controller('qr-code')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QrCodeController {
  constructor(
    private readonly qrCodeService: QrCodeService,
    private readonly securityService: QrCodeSecurityService,
    @InjectRepository(TableQrCode)
    private readonly qrCodeRepository: Repository<TableQrCode>,
    @InjectRepository(TableSession)
    private readonly sessionRepository: Repository<TableSession>,
    @InjectRepository(QrScanLog)
    private readonly scanLogRepository: Repository<QrScanLog>,
  ) {}

  // ============ LEGACY ENDPOINTS ============

  @Get('table')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Generate QR code for table (legacy)' })
  @ApiQuery({ name: 'restaurantId', required: true })
  @ApiQuery({ name: 'tableId', required: true })
  async generateTableQR(
    @Query('restaurantId') restaurantId: string,
    @Query('tableId') tableId: string,
  ) {
    const qrCode = await this.qrCodeService.generateTableQR(restaurantId, tableId);
    return { qr_code: qrCode };
  }

  @Get('menu')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Generate QR code for restaurant menu' })
  @ApiQuery({ name: 'restaurantId', required: true })
  async generateMenuQR(@Query('restaurantId') restaurantId: string) {
    const qrCode = await this.qrCodeService.generateMenuQR(restaurantId);
    return { qr_code: qrCode };
  }

  @Get('payment')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Generate QR code for payment' })
  @ApiQuery({ name: 'restaurantId', required: true })
  @ApiQuery({ name: 'orderId', required: true })
  @ApiQuery({ name: 'amount', required: true, type: Number })
  async generatePaymentQR(
    @Query('restaurantId') restaurantId: string,
    @Query('orderId') orderId: string,
    @Query('amount') amount: string,
  ) {
    const qrCode = await this.qrCodeService.generatePaymentQR(
      restaurantId,
      orderId,
      parseFloat(amount),
    );
    return { qr_code: qrCode };
  }

  @Post('validate')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Validate QR code data (legacy)' })
  validateQRCode(@Body('data') dataString: string) {
    const data = this.qrCodeService.parseQRData(dataString);
    const isValid = this.qrCodeService.validateQRData(data);

    return {
      valid: isValid,
      data: isValid ? data : null,
    };
  }

  // ============ SECURE QR CODE ENDPOINTS ============

  @Post('generate-secure')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Generate secure QR code with HMAC signature' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tableId: { type: 'string' },
        restaurantId: { type: 'string' },
        style: { type: 'string', enum: Object.values(QRCodeStyle) },
        color_primary: { type: 'string' },
        color_secondary: { type: 'string' },
        include_logo: { type: 'boolean' },
      },
      required: ['tableId', 'restaurantId'],
    },
  })
  async generateSecureQR(
    @Body() body: {
      tableId: string;
      restaurantId: string;
      style?: QRCodeStyle;
      color_primary?: string;
      color_secondary?: string;
      include_logo?: boolean;
    },
    @Req() req: AuthenticatedRequest,
  ) {
    const { tableId, restaurantId, style, color_primary, color_secondary, include_logo } = body;

    // Get current version or start at 1
    const existingQR = await this.qrCodeRepository.findOne({
      where: { table_id: tableId, is_active: true },
      order: { version: 'DESC' },
    });
    const version = existingQR ? existingQR.version + 1 : 1;

    // Deactivate old QR codes
    if (existingQR) {
      await this.qrCodeRepository.update(
        { table_id: tableId, is_active: true },
        { is_active: false },
      );
    }

    // Generate new secure QR
    const { qrCodeImage, qrCodeData, signature } = await this.qrCodeService.generateSecureTableQR(
      restaurantId,
      tableId,
      version,
      {
        style: style || QRCodeStyle.MINIMAL,
        colorPrimary: color_primary,
        colorSecondary: color_secondary,
      },
    );

    // Store in database
    const qrCode = this.qrCodeRepository.create({
      restaurant_id: restaurantId,
      table_id: tableId,
      qr_code_data: qrCodeData,
      qr_code_image: qrCodeImage,
      signature,
      style: style || QRCodeStyle.MINIMAL,
      color_primary: color_primary || '#000000',
      color_secondary: color_secondary,
      logo_included: include_logo || false,
      version,
      is_active: true,
      generated_by: req.user?.id,
    });

    await this.qrCodeRepository.save(qrCode);

    return {
      id: qrCode.id,
      qr_code_image: qrCodeImage,
      qr_code_data: qrCodeData,
      signature,
      version,
      style: qrCode.style,
    };
  }

  @Post('batch-generate')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Batch generate QR codes for multiple tables' })
  async batchGenerateQR(@Body() dto: BatchGenerateQRDto, @Req() req: AuthenticatedRequest) {
    const results = await this.qrCodeService.batchGenerateTableQR(
      dto.restaurant_id,
      dto.tables.map((t) => ({ tableId: t.table_id, tableNumber: t.table_number || '' })),
      {
        style: dto.style,
        colorPrimary: dto.color_primary,
        colorSecondary: dto.color_secondary,
      },
    );

    // Store all QR codes
    const qrCodes = results.map((result) =>
      this.qrCodeRepository.create({
        restaurant_id: dto.restaurant_id,
        table_id: result.tableId,
        qr_code_data: result.qrCodeData,
        qr_code_image: result.qrCodeImage,
        signature: result.signature,
        style: dto.style || QRCodeStyle.MINIMAL,
        color_primary: dto.color_primary || '#000000',
        color_secondary: dto.color_secondary,
        logo_included: dto.include_logo || false,
        version: result.version,
        is_active: true,
        generated_by: req.user?.id,
      }),
    );

    await this.qrCodeRepository.save(qrCodes);

    return {
      success: true,
      count: results.length,
      qr_codes: results.map((r) => ({
        table_id: r.tableId,
        table_number: r.tableNumber,
        qr_code_image: r.qrCodeImage,
        signature: r.signature,
      })),
    };
  }

  @Get('table/:tableId')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Get active QR code for a table' })
  async getTableQRCode(@Param('tableId') tableId: string) {
    const qrCode = await this.qrCodeRepository.findOne({
      where: { table_id: tableId, is_active: true },
      order: { version: 'DESC' },
    });

    if (!qrCode) {
      throw new HttpException('QR code not found for this table', HttpStatus.NOT_FOUND);
    }

    return {
      id: qrCode.id,
      qr_code_image: qrCode.qr_code_image,
      qr_code_data: qrCode.qr_code_data,
      style: qrCode.style,
      version: qrCode.version,
      created_at: qrCode.created_at,
    };
  }

  // ============ SCAN & SESSION ENDPOINTS ============

  @Post('validate-scan')
  @Roles(UserRole.CUSTOMER, UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER)
  @ApiOperation({ summary: 'Validate scanned QR code URL with HMAC verification' })
  async validateScan(
    @Body() body: { url: string; device_info?: Record<string, string> },
    @Req() req: AuthenticatedRequest,
  ) {
    const validation = this.qrCodeService.validateSecureQRCode(body.url);

    // Log the scan attempt
    if (validation.restaurantId && validation.tableId) {
      const scanLog = this.scanLogRepository.create({
        restaurant_id: validation.restaurantId,
        table_id: validation.tableId,
        scanned_by: req.user?.id,
        scan_result: validation.valid ? ScanResult.SUCCESS : ScanResult.INVALID,
        device_info: body.device_info,
        ip_address: req.ip,
      } as DeepPartial<QrScanLog>);
      await this.scanLogRepository.save(scanLog);
    }

    if (!validation.valid) {
      return {
        valid: false,
        error: validation.error,
      };
    }

    // Get table and restaurant info
    const qrCode = await this.qrCodeRepository.findOne({
      where: {
        restaurant_id: validation.restaurantId,
        table_id: validation.tableId,
        is_active: true,
      },
      relations: ['restaurant', 'table'],
    });

    return {
      valid: true,
      restaurant_id: validation.restaurantId,
      table_id: validation.tableId,
      restaurant: qrCode?.restaurant
        ? {
            id: qrCode.restaurant.id,
            name: qrCode.restaurant.name,
            logo_url: qrCode.restaurant.logo_url,
          }
        : null,
      table: qrCode?.table
        ? {
            id: qrCode.table.id,
            table_number: qrCode.table.table_number,
            seats: qrCode.table.seats,
          }
        : null,
    };
  }

  @Post('session/start')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Start a table session after scanning QR code' })
  async startSession(@Body() dto: StartSessionDto, @Req() req: AuthenticatedRequest) {
    // Check for existing active session
    const existingSession = await this.sessionRepository.findOne({
      where: {
        table_id: dto.table_id,
        status: SessionStatus.ACTIVE,
      } as FindOptionsWhere<TableSession>,
    });

    if (existingSession) {
      // Check if user can join existing session
      if ((dto as StartSessionDto & { join_existing?: boolean }).join_existing) {
        // Add user to existing session
        const guests = existingSession.guest_user_ids || [];
        if (!guests.includes(req.user.id) && existingSession.primary_user_id !== req.user.id) {
          guests.push(req.user.id);
          existingSession.guest_user_ids = guests;
          existingSession.guest_count = guests.length + 1;
          await this.sessionRepository.save(existingSession);
        }

        return {
          session_id: existingSession.id,
          is_new: false,
          is_host: existingSession.primary_user_id === req.user.id,
          guest_count: existingSession.guest_count,
        };
      } else {
        throw new HttpException(
          'A session is already active at this table. Set join_existing=true to join.',
          HttpStatus.CONFLICT,
        );
      }
    }

    // Create new session
    const session = this.sessionRepository.create({
      restaurant_id: dto.restaurant_id,
      table_id: dto.table_id,
      primary_user_id: req.user.id,
      guest_count: dto.guest_count || 1,
      status: SessionStatus.ACTIVE,
      started_at: new Date(),
    } as DeepPartial<TableSession>);

    await this.sessionRepository.save(session as TableSession);

    return {
      session_id: session.id,
      is_new: true,
      is_host: true,
      started_at: session.started_at,
    };
  }

  @Post('session/end')
  @Roles(UserRole.CUSTOMER, UserRole.WAITER, UserRole.MANAGER)
  @ApiOperation({ summary: 'End a table session' })
  async endSession(@Body() dto: EndSessionDto, @Req() req: AuthenticatedRequest) {
    const session = await this.sessionRepository.findOne({
      where: { id: dto.session_id },
    });

    if (!session) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }

    // Verify user can end session
    const canEnd =
      session.primary_user_id === req.user.id ||
      req.user.roles?.some((r: string) => [UserRole.WAITER, UserRole.MANAGER, UserRole.OWNER].includes(r as UserRole));

    if (!canEnd) {
      throw new HttpException('You cannot end this session', HttpStatus.FORBIDDEN);
    }

    session.status = SessionStatus.COMPLETED;
    session.ended_at = new Date();
    session.total_amount = (dto as EndSessionDto & { total_amount?: number; notes?: string }).total_amount ?? 0;
    session.notes = (dto as EndSessionDto & { total_amount?: number; notes?: string }).notes ?? '';

    await this.sessionRepository.save(session);

    return {
      success: true,
      session_id: session.id,
      duration_minutes: Math.round(
        (session.ended_at.getTime() - session.started_at.getTime()) / 60000,
      ),
    };
  }

  @Get('session/active/:tableId')
  @Roles(UserRole.CUSTOMER, UserRole.WAITER, UserRole.MANAGER, UserRole.OWNER)
  @ApiOperation({ summary: 'Get active session for a table' })
  async getActiveSession(@Param('tableId') tableId: string) {
    const session = await this.sessionRepository.findOne({
      where: { table_id: tableId, status: SessionStatus.ACTIVE } as FindOptionsWhere<TableSession>,
      relations: ['primary_user', 'table'],
    });

    if (!session) {
      return { active: false };
    }

    return {
      active: true,
      session_id: session.id,
      started_at: session.started_at,
      guest_count: session.guest_count,
      host_name: session.primary_user?.full_name,
      table_number: session.table?.table_number,
    };
  }

  @Get('analytics/:restaurantId')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get QR scan analytics for restaurant' })
  async getScanAnalytics(
    @Param('restaurantId') restaurantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const query = this.scanLogRepository
      .createQueryBuilder('scan')
      .where('scan.restaurant_id = :restaurantId', { restaurantId });

    if (startDate) {
      query.andWhere('scan.scanned_at >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      query.andWhere('scan.scanned_at <= :endDate', { endDate: new Date(endDate) });
    }

    const [scans, total] = await query.getManyAndCount();

    const validScans = scans.filter((s) => s.scan_result === ScanResult.SUCCESS).length;
    const tableStats = scans.reduce((acc, scan) => {
      acc[scan.table_id] = (acc[scan.table_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_scans: total,
      valid_scans: validScans,
      invalid_scans: total - validScans,
      conversion_rate: total > 0 ? (validScans / total) * 100 : 0,
      scans_by_table: tableStats,
    };
  }
}
