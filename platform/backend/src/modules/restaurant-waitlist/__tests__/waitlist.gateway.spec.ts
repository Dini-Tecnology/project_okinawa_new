import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { WaitlistGateway } from '../waitlist.gateway';

describe('WaitlistGateway', () => {
  let gateway: WaitlistGateway;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const validPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    roles: ['CUSTOMER'],
    restaurant_id: undefined,
  };

  const createMockSocket = (overrides: any = {}) => ({
    id: 'test-socket-id',
    handshake: { auth: { token: 'valid-jwt-token' } },
    disconnect: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    user: undefined,
    ...overrides,
  } as any);

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistGateway,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<WaitlistGateway>(WaitlistGateway);
    jwtService = module.get<JwtService>(JwtService);
    gateway.server = mockServer;
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should authenticate client with valid token and set client.user', async () => {
      const mockSocket = createMockSocket();
      mockJwtService.verifyAsync.mockResolvedValue(validPayload);

      await gateway.handleConnection(mockSocket);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-jwt-token');
      expect(mockSocket.user).toEqual({
        id: validPayload.sub,
        email: validPayload.email,
        roles: validPayload.roles,
        restaurant_id: validPayload.restaurant_id,
      });
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client when no token is provided', async () => {
      const mockSocket = createMockSocket({
        handshake: { auth: {} },
      });

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(mockSocket.user).toBeUndefined();
    });

    it('should disconnect client when handshake.auth is undefined', async () => {
      const mockSocket = createMockSocket({
        handshake: { auth: undefined },
      });

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client when token verification fails', async () => {
      const mockSocket = createMockSocket();
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(mockSocket);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-jwt-token');
      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(mockSocket.user).toBeUndefined();
    });

    it('should disconnect client when token is expired', async () => {
      const mockSocket = createMockSocket();
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should log disconnect for authenticated client', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com' },
      });

      expect(() => gateway.handleDisconnect(mockSocket)).not.toThrow();
    });

    it('should log disconnect for unauthenticated client', () => {
      const mockSocket = createMockSocket();

      expect(() => gateway.handleDisconnect(mockSocket)).not.toThrow();
    });
  });

  describe('subscribe:waitlist', () => {
    it('should join waitlist room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['CUSTOMER'] },
      });

      const result = gateway.handleSubscribeWaitlist(mockSocket, {
        restaurantId: 'restaurant-1',
      });

      expect(mockSocket.join).toHaveBeenCalledWith('waitlist:restaurant-1');
      expect(result).toEqual({
        event: 'subscribed',
        restaurantId: 'restaurant-1',
      });
    });

    it('should return Unauthorized error when client.user is missing', () => {
      const mockSocket = createMockSocket();

      const result = gateway.handleSubscribeWaitlist(mockSocket, {
        restaurantId: 'restaurant-1',
      });

      expect(result).toEqual({
        event: 'error',
        data: { message: 'Unauthorized' },
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe:waitlist', () => {
    it('should leave waitlist room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['CUSTOMER'] },
      });

      const result = gateway.handleUnsubscribeWaitlist(mockSocket, {
        restaurantId: 'restaurant-1',
      });

      expect(mockSocket.leave).toHaveBeenCalledWith('waitlist:restaurant-1');
      expect(result).toEqual({
        event: 'unsubscribed',
        restaurantId: 'restaurant-1',
      });
    });

    it('should return Unauthorized error when client.user is missing', () => {
      const mockSocket = createMockSocket();

      const result = gateway.handleUnsubscribeWaitlist(mockSocket, {
        restaurantId: 'restaurant-1',
      });

      expect(result).toEqual({
        event: 'error',
        data: { message: 'Unauthorized' },
      });
      expect(mockSocket.leave).not.toHaveBeenCalled();
    });
  });

  describe('subscribe:myPosition', () => {
    it('should join user-specific position room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['CUSTOMER'] },
      });

      const result = gateway.handleSubscribePosition(mockSocket, {
        restaurantId: 'restaurant-1',
        userId: 'user-123',
      });

      expect(mockSocket.join).toHaveBeenCalledWith(
        'waitlist:restaurant-1:user:user-123',
      );
      expect(result).toEqual({
        event: 'subscribed_position',
        restaurantId: 'restaurant-1',
        userId: 'user-123',
      });
    });

    it('should return Unauthorized error when client.user is missing', () => {
      const mockSocket = createMockSocket();

      const result = gateway.handleSubscribePosition(mockSocket, {
        restaurantId: 'restaurant-1',
        userId: 'user-123',
      });

      expect(result).toEqual({
        event: 'error',
        data: { message: 'Unauthorized' },
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });
  });

  describe('notify methods', () => {
    it('should emit waitlist:update to restaurant room via notifyWaitlistUpdate', () => {
      const payload = {
        type: 'new_entry' as const,
        entryId: 'entry-1',
        queueStats: {
          totalWaiting: 5,
          tablesAvailable: 2,
          avgWaitMinutes: 15,
        },
      };

      gateway.notifyWaitlistUpdate('restaurant-1', payload);

      expect(mockServer.to).toHaveBeenCalledWith('waitlist:restaurant-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'waitlist:update',
        expect.objectContaining({
          type: 'new_entry',
          entryId: 'entry-1',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should emit waitlist:called to specific user room via notifyUserCalled', () => {
      gateway.notifyUserCalled('restaurant-1', 'user-1', {
        entryId: 'entry-1',
        tableNumber: 'T5',
        message: 'Your table is ready!',
      });

      expect(mockServer.to).toHaveBeenCalledWith(
        'waitlist:restaurant-1:user:user-1',
      );
      expect(mockServer.emit).toHaveBeenCalledWith(
        'waitlist:called',
        expect.objectContaining({
          type: 'called',
          entryId: 'entry-1',
          tableNumber: 'T5',
          message: 'Your table is ready!',
        }),
      );
    });

    it('should emit default message when no message provided in notifyUserCalled', () => {
      gateway.notifyUserCalled('restaurant-1', 'user-1', {
        entryId: 'entry-1',
      });

      expect(mockServer.emit).toHaveBeenCalledWith(
        'waitlist:called',
        expect.objectContaining({
          message: 'Sua mesa esta pronta! Dirija-se a recepcao.',
        }),
      );
    });

    it('should emit waitlist:positionUpdate to specific user room via notifyPositionUpdate', () => {
      gateway.notifyPositionUpdate('restaurant-1', 'user-1', {
        position: 3,
        estimatedWaitMinutes: 10,
      });

      expect(mockServer.to).toHaveBeenCalledWith(
        'waitlist:restaurant-1:user:user-1',
      );
      expect(mockServer.emit).toHaveBeenCalledWith(
        'waitlist:positionUpdate',
        expect.objectContaining({
          type: 'position_change',
          position: 3,
          estimatedWaitMinutes: 10,
        }),
      );
    });

    it('should emit waitlist:queueRefresh to restaurant room via notifyQueueRefresh', () => {
      const queue = [
        { id: 'entry-1', position: 1 },
        { id: 'entry-2', position: 2 },
      ] as any;

      gateway.notifyQueueRefresh('restaurant-1', queue);

      expect(mockServer.to).toHaveBeenCalledWith('waitlist:restaurant-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'waitlist:queueRefresh',
        expect.objectContaining({
          type: 'queue_refresh',
          queue,
        }),
      );
    });
  });
});
