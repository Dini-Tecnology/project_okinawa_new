import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { OrdersGateway } from './orders.gateway';
import { OrdersService } from './orders.service';

describe('OrdersGateway', () => {
  let gateway: OrdersGateway;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockOrdersService = {};

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
        OrdersGateway,
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<OrdersGateway>(OrdersGateway);
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

  describe('joinRestaurant', () => {
    it('should join restaurant room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['WAITER'] },
      });

      const result = gateway.handleJoinRestaurant(
        { restaurantId: 'restaurant-1' },
        mockSocket,
      );

      expect(mockSocket.join).toHaveBeenCalledWith('restaurant:restaurant-1');
      expect(result).toEqual({
        event: 'joined',
        data: { restaurantId: 'restaurant-1' },
      });
    });

    it('should return Unauthorized error when client.user is missing', () => {
      const mockSocket = createMockSocket();

      const result = gateway.handleJoinRestaurant(
        { restaurantId: 'restaurant-1' },
        mockSocket,
      );

      expect(result).toEqual({
        event: 'error',
        data: { message: 'Unauthorized' },
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });
  });

  describe('leaveRestaurant', () => {
    it('should leave restaurant room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['WAITER'] },
      });

      const result = gateway.handleLeaveRestaurant(
        { restaurantId: 'restaurant-1' },
        mockSocket,
      );

      expect(mockSocket.leave).toHaveBeenCalledWith('restaurant:restaurant-1');
      expect(result).toEqual({
        event: 'left',
        data: { restaurantId: 'restaurant-1' },
      });
    });

    it('should return Unauthorized error when client.user is missing', () => {
      const mockSocket = createMockSocket();

      const result = gateway.handleLeaveRestaurant(
        { restaurantId: 'restaurant-1' },
        mockSocket,
      );

      expect(result).toEqual({
        event: 'error',
        data: { message: 'Unauthorized' },
      });
      expect(mockSocket.leave).not.toHaveBeenCalled();
    });
  });

  describe('notify methods', () => {
    it('should emit order:created to restaurant room via notifyOrderCreated', () => {
      const order = { id: 'order-1', restaurant_id: 'restaurant-1' };

      gateway.notifyOrderCreated(order);

      expect(mockServer.to).toHaveBeenCalledWith('restaurant:restaurant-1');
      expect(mockServer.emit).toHaveBeenCalledWith('order:created', order);
    });

    it('should emit order:updated to both restaurant and user rooms via notifyOrderUpdated', () => {
      const order = {
        id: 'order-1',
        restaurant_id: 'restaurant-1',
        user_id: 'user-1',
      };

      gateway.notifyOrderUpdated(order);

      expect(mockServer.to).toHaveBeenCalledWith('restaurant:restaurant-1');
      expect(mockServer.to).toHaveBeenCalledWith('user:user-1');
      expect(mockServer.emit).toHaveBeenCalledWith('order:updated', order);
    });
  });
});
