import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Public } from '@/common/decorators/public.decorator';
import { FiscalDocument } from '../entities/fiscal-document.entity';
import { FiscalConfig } from '../entities/fiscal-config.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsGateway } from '../../events/events.realtime';

/**
 * FiscalWebhookController -- receives callbacks from Focus NFe.
 *
 * POST /fiscal/webhooks/focus-nfe
 *
 * Focus NFe sends webhook when:
 * - NFC-e is authorized (can take up to 30s in peak hours)
 * - NFC-e is cancelled
 * - Emission error
 *
 * Flow:
 * 1. Validate webhook authenticity (compare token with FiscalConfig)
 * 2. Find FiscalDocument by external_ref
 * 3. Update status, access_key, protocol, xml
 * 4. Emit internal event via EventEmitter2
 * 5. Notify restaurant via WebSocket on errors
 */
@ApiTags('fiscal-webhooks')
@Controller('fiscal/webhooks')
export class FiscalWebhookController {
  private readonly logger = new Logger(FiscalWebhookController.name);

  constructor(
    @InjectRepository(FiscalDocument)
    private readonly fiscalDocRepo: Repository<FiscalDocument>,
    @InjectRepository(FiscalConfig)
    private readonly fiscalConfigRepo: Repository<FiscalConfig>,
    private readonly eventEmitter: EventEmitter2,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Post('focus-nfe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook endpoint for Focus NFe callbacks' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleFocusNfeWebhook(
    @Body() body: any,
    @Headers() headers: any,
  ) {
    this.logger.log(
      `[Focus NFe Webhook] Received callback: ${JSON.stringify(body).substring(0, 500)}`,
    );

    // 1. Validate webhook token against FiscalConfig
    const webhookToken = headers['x-webhook-token'] || headers['authorization'];
    if (!webhookToken) {
      this.logger.warn('[Focus NFe Webhook] Missing authentication token');
      throw new UnauthorizedException('Missing webhook authentication token');
    }

    // 2. Extract data from Focus NFe callback
    const ref = body.ref || body.external_ref;

    // Validate token against stored focus_nfe_token in FiscalConfig
    // The ref contains the document reference which links to a restaurant
    if (ref) {
      const doc = await this.fiscalDocRepo.findOne({
        where: { external_ref: ref },
        select: ['restaurant_id'],
      });
      if (doc?.restaurant_id) {
        const config = await this.fiscalConfigRepo.findOne({
          where: { restaurant_id: doc.restaurant_id, is_active: true },
        });
        if (config?.focus_nfe_token) {
          const tokenStr = webhookToken.replace(/^Bearer\s+/i, '');
          try {
            const receivedBuf = Buffer.from(tokenStr);
            const expectedBuf = Buffer.from(config.focus_nfe_token);
            const isValid =
              receivedBuf.length === expectedBuf.length &&
              crypto.timingSafeEqual(receivedBuf, expectedBuf);
            if (!isValid) {
              this.logger.warn(
                `[Focus NFe Webhook] Token mismatch for restaurant ${doc.restaurant_id}`,
              );
              throw new UnauthorizedException('Invalid webhook token');
            }
          } catch (err) {
            if (err instanceof UnauthorizedException) throw err;
            this.logger.warn(
              `[Focus NFe Webhook] Token validation error: ${err instanceof Error ? err.message : 'unknown'}`,
            );
            throw new UnauthorizedException('Invalid webhook token');
          }
        }
      }
    }
    const status = body.status; // 'autorizado', 'cancelado', 'erro_autorizacao'
    const accessKey = body.chave_nfe || body.access_key;
    const protocol = body.protocolo || body.protocol;
    const xml = body.xml;
    const qrCodeUrl = body.url_qrcode || body.qr_code_url;
    const danfeUrl = body.url_danfe || body.danfe_url;
    const errorMessage = body.mensagem_sefaz || body.error_message;

    if (!ref) {
      this.logger.warn('[Focus NFe Webhook] Missing ref in webhook payload');
      return { received: true, processed: false, reason: 'missing_ref' };
    }

    // 3. Find FiscalDocument by external_ref
    const doc = await this.fiscalDocRepo.findOne({
      where: { external_ref: ref },
    });

    if (!doc) {
      this.logger.warn(`[Focus NFe Webhook] Document not found for ref: ${ref}`);
      return { received: true, processed: false, reason: 'document_not_found' };
    }

    // 4. Update document based on status
    switch (status) {
      case 'autorizado':
      case 'authorized':
        doc.status = 'authorized';
        doc.access_key = accessKey || doc.access_key;
        doc.protocol = protocol || doc.protocol;
        doc.xml = xml || doc.xml;
        doc.qr_code_url = qrCodeUrl || doc.qr_code_url;
        doc.danfe_url = danfeUrl || doc.danfe_url;
        break;

      case 'cancelado':
      case 'cancelled':
        doc.status = 'cancelled';
        doc.protocol = protocol || doc.protocol;
        break;

      case 'erro_autorizacao':
      case 'denied':
        doc.status = 'denied';
        doc.error_message = errorMessage;
        break;

      default:
        this.logger.warn(`[Focus NFe Webhook] Unknown status: ${status}`);
        doc.error_message = `Unknown webhook status: ${status}`;
        break;
    }

    await this.fiscalDocRepo.save(doc);

    // 5. Emit internal event via EventEmitter2
    if (doc.status === 'authorized') {
      this.eventEmitter.emit('fiscal.nfce.authorized', {
        documentId: doc.id,
        orderId: doc.order_id,
        accessKey: doc.access_key,
        restaurantId: doc.restaurant_id,
      });
    } else if (doc.status === 'denied' || doc.status === 'failed') {
      this.eventEmitter.emit('fiscal.nfce.failed', {
        documentId: doc.id,
        orderId: doc.order_id,
        errorMessage: doc.error_message,
        restaurantId: doc.restaurant_id,
      });

      // Notify restaurant owner via WebSocket about fiscal error
      try {
        this.eventsGateway.server
          .to(`restaurant:${doc.restaurant_id}`)
          .emit('fiscal:error', {
            orderId: doc.order_id,
            status: doc.status,
            message: doc.error_message,
          });
      } catch {
        // Non-critical
      }
    }

    this.logger.log(
      `[Focus NFe Webhook] Processed | Ref: ${ref} | Status: ${doc.status}`,
    );

    return { received: true, processed: true, status: doc.status };
  }
}
