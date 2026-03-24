import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { QueueGateway } from '../queue.gateway';

describe('QueueGateway', () => {
  let gateway: QueueGateway;
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
        QueueGateway,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<QueueGateway>(QueueGateway);
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

  describe('joinQueueRoom', () => {
    it('should join queue room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['CUSTOMER'] },
      });

      const result = gateway.handleJoinRoom(mockSocket, 'restaurant-1');

      expect(mockSocket.join).toHaveBeenCalledWith('queue:restaurant-1');
      expect(result).toEqual({ event: 'joined', restaurantId: 'restaurant-1' });
    });

    it('should return Unauthorized error when client.user is missing', () => {
      const mockSocket = createMockSocket();

      const result = gateway.handleJoinRoom(mockSocket, 'restaurant-1');

      expect(result).toEqual({
        event: 'error',
        data: { message: 'Unauthorized' },
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });
  });

  describe('leaveQueueRoom', () => {
    it('should leave queue room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['CUSTOMER'] },
      });

      const result = gateway.handleLeaveRoom(mockSocket, 'restaurant-1');

      expect(mockSocket.leave).toHaveBeenCalledWith('queue:restaurant-1');
      expect(result).toEqual({ event: 'left', restaurantId: 'restaurant-1' });
    });

    it('should return Unauthorized error when client.user is missing', () => {
      const mockSocket = createMockSocket();

      const result = gateway.handleLeaveRoom(mockSocket, 'restaurant-1');

      expect(result).toEqual({
        event: 'error',
        data: { message: 'Unauthorized' },
      });
      expect(mockSocket.leave).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToMyPosition', () => {
    it('should join user-specific position room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['CUSTOMER'] },
      });

      const result = gateway.handleSubscribePosition(mockSocket, {
        restaurantId: 'restaurant-1',
        userId: 'user-123',
      });

      expect(mockSocket.join).toHaveBeenCalledWith(
        'queue:restaurant-1:user:user-123',
      );
      expect(result).toEqual({
        event: 'subscribed',
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
    it('should emit queueUpdate to queue room via notifyQueueUpdate', () => {
      const queue = [
        { id: 'entry-1', position: 1 },
        { id: 'entry-2', position: 2 },
      ];

      gateway.notifyQueueUpdate('restaurant-1', queue);

      expect(mockServer.to).toHaveBeenCalledWith('queue:restaurant-1');
      expect(mockServer.emit).toHaveBeenCalledWith('queueUpdate', {
        type: 'queue_updated',
        queue,
        timestamp: expect.any(String),
      });
    });

    it('should emit positionUpdate to specific user room via notifyPositionUpdate', () => {
      const data = { position: 3, estimatedWait: 10 };

      gateway.notifyPositionUpdate('restaurant-1', 'user-1', data);

      expect(mockServer.to).toHaveBeenCalledWith(
        'queue:restaurant-1:user:user-1',
      );
      expect(mockServer.emit).toHaveBeenCalledWith('positionUpdate', {
        type: 'position_changed',
        data,
        timestamp: expect.any(String),
      });
    });

    it('should emit called to specific user room via notifyUserCalled', () => {
      gateway.notifyUserCalled('restaurant-1', 'user-1');

      expect(mockServer.to).toHaveBeenCalledWith(
        'queue:restaurant-1:user:user-1',
      );
      expect(mockServer.emit).toHaveBeenCalledWith('called', {
        type: 'your_turn',
        message: 'Sua vez! Apresente-se na entrada em 5 minutos.',
        timestamp: expect.any(String),
      });
    });

    it('should emit statsUpdate to queue room via notifyStatsUpdate', () => {
      const stats = { totalInQueue: 10, avgWait: 15 };

      gateway.notifyStatsUpdate('restaurant-1', stats);

      expect(mockServer.to).toHaveBeenCalledWith('queue:restaurant-1');
      expect(mockServer.emit).toHaveBeenCalledWith('statsUpdate', {
        type: 'stats_updated',
        stats,
        timestamp: expect.any(String),
      });
    });
  });
});
