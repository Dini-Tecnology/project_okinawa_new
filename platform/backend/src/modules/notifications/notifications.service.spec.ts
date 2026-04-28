import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService, NotificationType } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { EventsGateway } from '@/modules/events/events.realtime';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: Repository<Notification>;
  let eventsGateway: EventsGateway;

  const mockNotification = {
    id: 'notification-1',
    user_id: 'user-1',
    title: 'Test Notification',
    message: 'Test message',
    notification_type: NotificationType.SYSTEM,
    metadata: {},
    is_read: false,
    read_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
  };

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockEventsGateway = {
    notifyUser: jest.fn(),
    notifyRestaurant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get(getRepositoryToken(Notification));
    eventsGateway = module.get(EventsGateway);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification and send via WebSocket', async () => {
      const createDto = {
        user_id: 'user-1',
        title: 'Test',
        message: 'Test message',
        type: NotificationType.SYSTEM,
        data: { key: 'value' },
      };

      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockNotificationRepository.create).toHaveBeenCalled();
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      expect(mockEventsGateway.notifyUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          id: mockNotification.id,
          type: mockNotification.notification_type,
        }),
      );
    });
  });

  describe('createBulk', () => {
    it('should create multiple notifications', async () => {
      const notifications = [
        {
          user_id: 'user-1',
          title: 'Test 1',
          message: 'Message 1',
          notification_type: NotificationType.SYSTEM,
          metadata: {},
        },
        {
          user_id: 'user-2',
          title: 'Test 2',
          message: 'Message 2',
          notification_type: NotificationType.ORDER_PLACED,
          metadata: {},
        },
      ];

      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createBulk(notifications);

      expect(result).toHaveLength(2);
      expect(mockNotificationRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('notifyRestaurantStaff', () => {
    it('should notify restaurant staff via WebSocket', async () => {
      const result = await service.notifyRestaurantStaff(
        'restaurant-1',
        'Test Title',
        'Test Message',
        NotificationType.ORDER_PLACED,
        { key: 'value' },
      );

      expect(result).toEqual({ message: 'Notification sent to restaurant staff' });
      expect(mockEventsGateway.notifyRestaurant).toHaveBeenCalledWith(
        'restaurant-1',
        expect.objectContaining({
          type: 'notification',
          title: 'Test Title',
        }),
      );
    });
  });

  describe('findAllByUser', () => {
    it('should return all notifications for a user', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockNotification]);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockNotificationRepository.count.mockResolvedValue(0);

      const result = await service.findAllByUser('user-1');

      expect(result).toBeDefined();
      expect(result.notifications).toEqual([mockNotification]);
      expect(result.total).toBe(1);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });

    it('should filter by unread only', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockNotification]);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockNotificationRepository.count.mockResolvedValue(1);

      const result = await service.findAllByUser('user-1', { unreadOnly: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('notification.is_read = false');
      expect(result.notifications).toBeDefined();
    });

    it('should filter by type', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([mockNotification]);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockNotificationRepository.count.mockResolvedValue(0);

      await service.findAllByUser('user-1', { type: NotificationType.ORDER_PLACED });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.notification_type = :type',
        { type: NotificationType.ORDER_PLACED },
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockNotificationRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(result).toBe(5);
      expect(mockNotificationRepository.count).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          is_read: false,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single notification', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);

      const result = await service.findOne('notification-1', 'user-1');

      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException if not found', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('notification-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue({
        ...mockNotification,
        is_read: true,
        read_at: new Date(),
      });
      mockNotificationRepository.count.mockResolvedValue(0);

      const result = await service.markAsRead('notification-1', 'user-1');

      expect(result.is_read).toBe(true);
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      expect(mockEventsGateway.notifyUser).toHaveBeenCalled();
    });

    it('should not save if already read', async () => {
      const readNotification = { ...mockNotification, is_read: true, read_at: new Date() };
      mockNotificationRepository.findOne.mockResolvedValue(readNotification);

      const result = await service.markAsRead('notification-1', 'user-1');

      expect(mockNotificationRepository.save).not.toHaveBeenCalled();
      expect(result.is_read).toBe(true);
    });
  });

  describe('markMultipleAsRead', () => {
    it('should mark multiple notifications as read', async () => {
      const markAsReadDto = { notification_ids: ['notif-1', 'notif-2'] };
      const notifications = [mockNotification, { ...mockNotification, id: 'notif-2' }];

      mockNotificationRepository.find.mockResolvedValue(notifications);
      mockNotificationRepository.save.mockResolvedValue(notifications);
      mockNotificationRepository.count.mockResolvedValue(0);

      const result = await service.markMultipleAsRead(markAsReadDto, 'user-1');

      expect(result.marked_count).toBe(2);
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      expect(mockEventsGateway.notifyUser).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 5 });

      const result = await service.markAllAsRead('user-1');

      expect(result.marked_count).toBe(5);
      expect(result.unread_count).toBe(0);
      expect(mockEventsGateway.notifyUser).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a notification', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.remove.mockResolvedValue(mockNotification);
      mockNotificationRepository.count.mockResolvedValue(0);

      const result = await service.remove('notification-1', 'user-1');

      expect(result).toEqual({ message: 'Notification deleted' });
      expect(mockNotificationRepository.remove).toHaveBeenCalled();
      expect(mockEventsGateway.notifyUser).toHaveBeenCalled();
    });
  });

  describe('deleteAllRead', () => {
    it('should delete all read notifications', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 3 });

      const result = await service.deleteAllRead('user-1');

      expect(result.deleted_count).toBe(3);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('should return notification statistics', async () => {
      mockNotificationRepository.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // unread
        .mockResolvedValueOnce(2); // last 24h

      mockQueryBuilder.getRawMany.mockResolvedValue([
        { type: 'order:created', count: '5' },
        { type: 'system', count: '5' },
      ]);

      const result = await service.getStatistics('user-1');

      expect(result.total).toBe(10);
      expect(result.unread).toBe(3);
      expect(result.last_24_hours).toBe(2);
      expect(result.by_type).toEqual({
        'order:created': 5,
        system: 5,
      });
    });
  });

  describe('helper methods', () => {
    beforeEach(() => {
      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);
    });

    it('should notify order created', async () => {
      const result = await service.notifyOrderCreated('user-1', 'order-1', 'Restaurant A');

      expect(result).toBeDefined();
      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          notification_type: NotificationType.ORDER_PLACED,
        }),
      );
    });

    it('should notify order updated', async () => {
      const result = await service.notifyOrderUpdated(
        'user-1',
        'order-1',
        'preparing',
        'Your order is being prepared',
      );

      expect(result).toBeDefined();
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });

    it('should notify order ready', async () => {
      const result = await service.notifyOrderReady('user-1', 'order-1', 'Restaurant A');

      expect(result).toBeDefined();
    });

    it('should notify reservation confirmed', async () => {
      const dateTime = new Date();
      const result = await service.notifyReservationConfirmed(
        'user-1',
        'reservation-1',
        'Restaurant A',
        dateTime,
      );

      expect(result).toBeDefined();
    });

    it('should send reservation reminder', async () => {
      const dateTime = new Date();
      const result = await service.sendReservationReminder(
        'user-1',
        'reservation-1',
        'Restaurant A',
        dateTime,
      );

      expect(result).toBeDefined();
    });

    it('should notify tip received', async () => {
      const result = await service.notifyTipReceived('staff-1', 50, 'John Doe');

      expect(result).toBeDefined();
    });

    it('should notify loyalty points earned', async () => {
      const result = await service.notifyLoyaltyPointsEarned('user-1', 100, 'Restaurant A');

      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a notification', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue({
        ...mockNotification,
        is_read: true,
        read_at: new Date(),
      });

      const result = await service.update('notification-1', { is_read: true }, 'user-1');

      expect(result.is_read).toBe(true);
      expect(result.read_at).toBeDefined();
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(service.update('notification-1', { is_read: true }, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
