import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { CallsGateway } from '../calls.gateway';

describe('CallsGateway', () => {
  let gateway: CallsGateway;
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
        CallsGateway,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<CallsGateway>(CallsGateway);
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
    it('should join restaurant staff room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['WAITER'] },
      });

      const result = gateway.handleJoinRestaurant(
        { restaurantId: 'restaurant-1' },
        mockSocket,
      );

      expect(mockSocket.join).toHaveBeenCalledWith('restaurant:restaurant-1:staff');
      expect(result).toEqual({
        event: 'joined',
        data: { restaurantId: 'restaurant-1' },
      });
    });

    it('should return error when client is not authenticated', () => {
      const mockSocket = createMockSocket();

      const result = gateway.handleJoinRestaurant(
        { restaurantId: 'restaurant-1' },
        mockSocket,
      );

      expect(result).toEqual({ event: 'error', data: { message: 'Unauthorized' } });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });
  });

  describe('leaveRestaurant', () => {
    it('should leave restaurant staff room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['WAITER'] },
      });

      const result = gateway.handleLeaveRestaurant(
        { restaurantId: 'restaurant-1' },
        mockSocket,
      );

      expect(mockSocket.leave).toHaveBeenCalledWith('restaurant:restaurant-1:staff');
      expect(result).toEqual({
        event: 'left',
        data: { restaurantId: 'restaurant-1' },
      });
    });

    it('should return error when client is not authenticated', () => {
      const mockSocket = createMockSocket();

      const result = gateway.handleLeaveRestaurant(
        { restaurantId: 'restaurant-1' },
        mockSocket,
      );

      expect(result).toEqual({ event: 'error', data: { message: 'Unauthorized' } });
      expect(mockSocket.leave).not.toHaveBeenCalled();
    });
  });

  describe('emit methods', () => {
    it('should emit call:new to restaurant staff room', () => {
      const mockCall = {
        id: 'call-1',
        restaurant_id: 'restaurant-1',
        table_id: 'table-5',
        user_id: 'user-1',
        call_type: 'waiter',
        status: 'pending',
        message: 'Need help',
        called_at: new Date('2026-01-01'),
        created_at: new Date('2026-01-01'),
      } as any;

      gateway.emitNewCall('restaurant-1', mockCall);

      expect(mockServer.to).toHaveBeenCalledWith('restaurant:restaurant-1:staff');
      expect(mockServer.emit).toHaveBeenCalledWith('call:new', {
        id: 'call-1',
        restaurant_id: 'restaurant-1',
        table_id: 'table-5',
        user_id: 'user-1',
        call_type: 'waiter',
        status: 'pending',
        message: 'Need help',
        called_at: mockCall.called_at,
        created_at: mockCall.created_at,
      });
    });

    it('should emit call:updated to restaurant staff room', () => {
      const mockCall = {
        id: 'call-1',
        restaurant_id: 'restaurant-1',
        table_id: 'table-5',
        user_id: 'user-1',
        call_type: 'waiter',
        status: 'acknowledged',
        message: 'Need help',
        called_at: new Date('2026-01-01'),
        acknowledged_at: new Date('2026-01-01T00:05:00'),
        acknowledged_by: 'waiter-1',
        resolved_at: null,
        resolved_by: null,
      } as any;

      gateway.emitCallUpdated('restaurant-1', mockCall);

      expect(mockServer.to).toHaveBeenCalledWith('restaurant:restaurant-1:staff');
      expect(mockServer.emit).toHaveBeenCalledWith('call:updated', {
        id: 'call-1',
        restaurant_id: 'restaurant-1',
        table_id: 'table-5',
        user_id: 'user-1',
        call_type: 'waiter',
        status: 'acknowledged',
        message: 'Need help',
        called_at: mockCall.called_at,
        acknowledged_at: mockCall.acknowledged_at,
        acknowledged_by: 'waiter-1',
        resolved_at: null,
        resolved_by: null,
      });
    });
  });
});
