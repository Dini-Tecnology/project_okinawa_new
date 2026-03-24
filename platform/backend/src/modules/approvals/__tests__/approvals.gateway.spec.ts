import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ApprovalsGateway } from '../approvals.gateway';
import { Approval } from '../entities/approval.entity';

describe('ApprovalsGateway', () => {
  let gateway: ApprovalsGateway;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const validPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    roles: ['MANAGER'],
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
        ApprovalsGateway,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<ApprovalsGateway>(ApprovalsGateway);
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
    it('should join both restaurant and managers rooms when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['MANAGER'] },
      });

      const result = gateway.handleJoinRestaurant(
        { restaurantId: 'restaurant-1' },
        mockSocket,
      );

      expect(mockSocket.join).toHaveBeenCalledWith('restaurant:restaurant-1');
      expect(mockSocket.join).toHaveBeenCalledWith(
        'restaurant:restaurant-1:managers',
      );
      expect(mockSocket.join).toHaveBeenCalledTimes(2);
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
    it('should leave both restaurant and managers rooms when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['MANAGER'] },
      });

      const result = gateway.handleLeaveRestaurant(
        { restaurantId: 'restaurant-1' },
        mockSocket,
      );

      expect(mockSocket.leave).toHaveBeenCalledWith('restaurant:restaurant-1');
      expect(mockSocket.leave).toHaveBeenCalledWith(
        'restaurant:restaurant-1:managers',
      );
      expect(mockSocket.leave).toHaveBeenCalledTimes(2);
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

  describe('emit methods', () => {
    it('should emit approval:new to managers room via emitNewApproval', () => {
      const mockApproval = {
        id: 'approval-1',
        type: 'discount',
        item_name: '20% discount',
        amount: 50,
        reason: 'Customer birthday',
        requester_id: 'waiter-1',
        created_at: new Date('2026-01-01'),
      } as any;

      gateway.emitNewApproval('restaurant-1', mockApproval);

      expect(mockServer.to).toHaveBeenCalledWith(
        'restaurant:restaurant-1:managers',
      );
      expect(mockServer.emit).toHaveBeenCalledWith('approval:new', {
        id: 'approval-1',
        type: 'discount',
        itemName: '20% discount',
        amount: 50,
        reason: 'Customer birthday',
        requester_id: 'waiter-1',
        createdAt: mockApproval.created_at,
      });
    });

    it('should emit approval:resolved to requester user room via emitResolved', () => {
      const result = {
        id: 'approval-1',
        decision: 'approved',
        note: 'Approved for birthday',
        resolvedBy: 'manager-1',
        resolvedAt: new Date('2026-01-01T01:00:00'),
      };

      gateway.emitResolved('waiter-1', result);

      expect(mockServer.to).toHaveBeenCalledWith('user:waiter-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'approval:resolved',
        result,
      );
    });

    it('should emit approval:resolved without optional note field', () => {
      const result = {
        id: 'approval-2',
        decision: 'rejected',
        resolvedBy: 'manager-1',
        resolvedAt: new Date('2026-01-01T02:00:00'),
      };

      gateway.emitResolved('waiter-1', result);

      expect(mockServer.to).toHaveBeenCalledWith('user:waiter-1');
      expect(mockServer.emit).toHaveBeenCalledWith(
        'approval:resolved',
        result,
      );
    });
  });
});
