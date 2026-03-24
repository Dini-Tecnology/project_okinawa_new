import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    getUnreadCount: jest.fn(),
    getStatistics: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    markAsRead: jest.fn(),
    markMultipleAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    remove: jest.fn(),
    deleteAllRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should create a notification', async () => {
    const dto = { user_id: 'user-1', message: 'Test' };
    mockService.create.mockResolvedValue({ id: 'notif-1', ...dto });

    const result = await controller.create(dto as any);

    expect(result).toBeDefined();
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('should find all notifications for user', async () => {
    const user = mockAuthenticatedUser({ id: 'user-1' });
    mockService.findAllByUser.mockResolvedValue([{ id: 'notif-1' }]);

    const result = await controller.findAll(user);

    expect(result).toBeDefined();
    expect(mockService.findAllByUser).toHaveBeenCalled();
  });

  it('should get unread count', async () => {
    const user = mockAuthenticatedUser({ id: 'user-1' });
    mockService.getUnreadCount.mockResolvedValue(5);

    const result = await controller.getUnreadCount(user);

    expect(result.unread_count).toBe(5);
    expect(mockService.getUnreadCount).toHaveBeenCalledWith('user-1');
  });

  it('should mark as read', async () => {
    const user = mockAuthenticatedUser({ id: 'user-1' });
    mockService.markAsRead.mockResolvedValue({ id: 'notif-1', is_read: true });

    const result = await controller.markAsRead('notif-1', user);

    expect(result).toBeDefined();
    expect(mockService.markAsRead).toHaveBeenCalledWith('notif-1', 'user-1');
  });

  it('should mark all as read', async () => {
    const user = mockAuthenticatedUser({ id: 'user-1' });
    mockService.markAllAsRead.mockResolvedValue({ marked_count: 3 });

    const result = await controller.markAllAsRead(user);

    expect(result.marked_count).toBe(3);
    expect(mockService.markAllAsRead).toHaveBeenCalledWith('user-1');
  });
});
