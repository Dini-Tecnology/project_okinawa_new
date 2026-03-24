import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { HrService } from './hr.service';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { LeaveRequestStatus } from './entities/leave-request.entity';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { UserRole } from '@/common/enums';

@ApiTags('hr')
@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('attendance')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get attendance records' })
  @ApiQuery({ name: 'restaurant_id', required: true })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiResponse({ status: 200, description: 'Returns attendance records' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  getAttendance(
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.hrService.getAttendance(restaurantId, startDate, endDate);
  }

  @Patch('attendance/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update attendance record' })
  @ApiResponse({ status: 200, description: 'Attendance updated successfully' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  updateAttendance(
    @Param('id') id: string,
    @Body() updateDto: UpdateAttendanceDto,
  ) {
    return this.hrService.updateAttendance(id, updateDto);
  }

  @Post('attendance/check-in')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF, UserRole.BARMAN, UserRole.MAITRE)
  @ApiOperation({ summary: 'Check in for work' })
  @ApiQuery({ name: 'restaurant_id', required: true })
  @ApiResponse({ status: 201, description: 'Check-in successful' })
  @ApiResponse({ status: 400, description: 'Already checked in' })
  checkIn(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.hrService.checkIn(user.sub, restaurantId);
  }

  @Post('attendance/check-out')
  @Roles(UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER, UserRole.CHEF, UserRole.BARMAN, UserRole.MAITRE)
  @ApiOperation({ summary: 'Check out from work' })
  @ApiQuery({ name: 'restaurant_id', required: true })
  @ApiResponse({ status: 200, description: 'Check-out successful' })
  @ApiResponse({ status: 400, description: 'Not checked in' })
  checkOut(
    @CurrentUser() user: AuthenticatedUser,
    @Query('restaurant_id') restaurantId: string,
  ) {
    return this.hrService.checkOut(user.sub, restaurantId);
  }

  @Get('leave-requests')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get leave requests' })
  @ApiQuery({ name: 'restaurant_id', required: true })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiResponse({ status: 200, description: 'Returns paginated leave requests' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  getLeaveRequests(
    @Query('restaurant_id') restaurantId: string,
    @Query('status') status?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.hrService.getLeaveRequests(restaurantId, status, page, limit);
  }

  @Post('leave-requests')
  @ApiOperation({ summary: 'Create leave request' })
  @ApiResponse({ status: 201, description: 'Leave request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid leave request data' })
  createLeaveRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: any,
  ) {
    return this.hrService.createLeaveRequest(user.sub, data);
  }

  @Patch('leave-requests/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update leave request status' })
  @ApiResponse({ status: 200, description: 'Leave request updated successfully' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  updateLeaveRequest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() data: { status: LeaveRequestStatus; rejection_reason?: string },
  ) {
    return this.hrService.updateLeaveRequest(id, data.status, user.sub, data.rejection_reason);
  }

  @Get('shifts')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get shifts for a restaurant' })
  @ApiQuery({ name: 'restaurant_id', required: true })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiResponse({ status: 200, description: 'Returns paginated shifts' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  getShifts(
    @Query('restaurant_id') restaurantId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.hrService.getShifts(restaurantId, startDate, endDate, page, limit);
  }

  @Post('shifts')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new shift' })
  @ApiResponse({ status: 201, description: 'Shift created successfully' })
  createShift(@Body() data: any) {
    return this.hrService.createShift(data);
  }

  @Patch('shifts/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update shift' })
  @ApiResponse({ status: 200, description: 'Shift updated successfully' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  updateShift(
    @Param('id') id: string,
    @Body() updateDto: UpdateShiftDto,
  ) {
    return this.hrService.updateShift(id, updateDto);
  }

  @Delete('shifts/:id')
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a shift' })
  @ApiResponse({ status: 200, description: 'Shift deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shift not found' })
  deleteShift(@Param('id') id: string) {
    return this.hrService.deleteShift(id);
  }
}
