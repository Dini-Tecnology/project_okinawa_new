import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AuthenticatedUser } from '@common/interfaces/authenticated-user.interface';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a notification (Admin only)' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiQuery({ name: 'unread_only', required: false, type: Boolean })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns user notifications with pagination',
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('unread_only') unreadOnly?: string | boolean,
    @Query('type') type?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.notificationsService.findAllByUser(user.id, {
      unreadOnly: unreadOnly === true || unreadOnly === 'true',
      type,
      limit,
      offset,
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Returns unread count' })
  async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { unread_count: count };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns notification statistics for the user',
  })
  getStatistics(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.getStatistics(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific notification' })
  @ApiResponse({ status: 200, description: 'Returns the notification' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateNotificationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationsService.update(id, updateDto, user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  markAsRead(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Post('mark-as-read')
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'Notifications marked as read',
  })
  markMultipleAsRead(
    @Body() markAsReadDto: MarkAsReadDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.notificationsService.markMultipleAsRead(markAsReadDto, user.id);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.remove(id, user.id);
  }

  @Delete('read/all')
  @ApiOperation({ summary: 'Delete all read notifications' })
  @ApiResponse({
    status: 200,
    description: 'All read notifications deleted',
  })
  deleteAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.deleteAllRead(user.id);
  }
}
