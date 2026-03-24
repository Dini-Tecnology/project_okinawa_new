import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ServiceConfigGateway } from '../service-config.gateway';

describe('ServiceConfigGateway', () => {
  let gateway: ServiceConfigGateway;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const validPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    roles: ['OWNER'],
    restaurant_id: 'restaurant-1',
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
        ServiceConfigGateway,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<ServiceConfigGateway>(ServiceConfigGateway);
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
        user: { id: 'user-123', email: 'test@example.com', roles: ['OWNER'] },
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
        user: { id: 'user-123', email: 'test@example.com', roles: ['OWNER'] },
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

  describe('emitConfigUpdated', () => {
    it('should emit config:updated to restaurant room with domain and timestamp', () => {
      gateway.emitConfigUpdated('restaurant-1', 'payment_config');

      expect(mockServer.to).toHaveBeenCalledWith('restaurant:restaurant-1');
      expect(mockServer.emit).toHaveBeenCalledWith('config:updated', {
        domain: 'payment_config',
        restaurantId: 'restaurant-1',
        updatedAt: expect.any(Date),
      });
    });

    it('should emit config:updated for different config domains', () => {
      const domains = ['profile', 'floor_layout', 'operating_hours', 'menu'];

      domains.forEach((domain) => {
        jest.clearAllMocks();
        gateway.emitConfigUpdated('restaurant-1', domain);

        expect(mockServer.to).toHaveBeenCalledWith('restaurant:restaurant-1');
        expect(mockServer.emit).toHaveBeenCalledWith('config:updated', {
          domain,
          restaurantId: 'restaurant-1',
          updatedAt: expect.any(Date),
        });
      });
    });
  });
});
