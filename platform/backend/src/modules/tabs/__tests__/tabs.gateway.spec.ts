import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TabsGateway } from '../tabs.gateway';

describe('TabsGateway', () => {
  let gateway: TabsGateway;
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
        TabsGateway,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    gateway = module.get<TabsGateway>(TabsGateway);
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

      // Should not throw
      expect(() => gateway.handleDisconnect(mockSocket)).not.toThrow();
    });

    it('should log disconnect for unauthenticated client', () => {
      const mockSocket = createMockSocket();

      expect(() => gateway.handleDisconnect(mockSocket)).not.toThrow();
    });
  });

  describe('joinTab', () => {
    it('should join tab room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['CUSTOMER'] },
      });

      const result = gateway.handleJoinTab(mockSocket, 'tab-456');

      expect(mockSocket.join).toHaveBeenCalledWith('tab:tab-456');
      expect(result).toEqual({ event: 'joined', tabId: 'tab-456' });
    });

    it('should return error when client is not authenticated', () => {
      const mockSocket = createMockSocket();

      const result = gateway.handleJoinTab(mockSocket, 'tab-456');

      expect(result).toEqual({ event: 'error', data: { message: 'Unauthorized' } });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });
  });

  describe('leaveTab', () => {
    it('should leave tab room when client is authenticated', () => {
      const mockSocket = createMockSocket({
        user: { id: 'user-123', email: 'test@example.com', roles: ['CUSTOMER'] },
      });

      const result = gateway.handleLeaveTab(mockSocket, 'tab-456');

      expect(mockSocket.leave).toHaveBeenCalledWith('tab:tab-456');
      expect(result).toEqual({ event: 'left', tabId: 'tab-456' });
    });

    it('should return error when client is not authenticated', () => {
      const mockSocket = createMockSocket();

      const result = gateway.handleLeaveTab(mockSocket, 'tab-456');

      expect(result).toEqual({ event: 'error', data: { message: 'Unauthorized' } });
      expect(mockSocket.leave).not.toHaveBeenCalled();
    });
  });

  describe('notify methods', () => {
    it('should emit tabUpdate to tab room via notifyTabUpdate', () => {
      const dateSpy = jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-01-01T00:00:00.000Z');

      gateway.notifyTabUpdate('tab-1', 'item_added', { item: 'burger' });

      expect(mockServer.to).toHaveBeenCalledWith('tab:tab-1');
      expect(mockServer.emit).toHaveBeenCalledWith('tabUpdate', {
        type: 'item_added',
        data: { item: 'burger' },
        timestamp: '2026-01-01T00:00:00.000Z',
      });

      dateSpy.mockRestore();
    });

    it('should emit item_added via notifyItemAdded', () => {
      gateway.notifyItemAdded('tab-1', { name: 'pizza' });

      expect(mockServer.to).toHaveBeenCalledWith('tab:tab-1');
      expect(mockServer.emit).toHaveBeenCalledWith('tabUpdate', expect.objectContaining({
        type: 'item_added',
        data: { name: 'pizza' },
      }));
    });

    it('should emit member_joined via notifyMemberJoined', () => {
      gateway.notifyMemberJoined('tab-1', { userId: 'u1' });

      expect(mockServer.to).toHaveBeenCalledWith('tab:tab-1');
      expect(mockServer.emit).toHaveBeenCalledWith('tabUpdate', expect.objectContaining({
        type: 'member_joined',
      }));
    });

    it('should emit member_left via notifyMemberLeft', () => {
      gateway.notifyMemberLeft('tab-1', 'user-1');

      expect(mockServer.to).toHaveBeenCalledWith('tab:tab-1');
      expect(mockServer.emit).toHaveBeenCalledWith('tabUpdate', expect.objectContaining({
        type: 'member_left',
        data: { userId: 'user-1' },
      }));
    });

    it('should emit payment_made via notifyPaymentMade', () => {
      gateway.notifyPaymentMade('tab-1', { amount: 50 });

      expect(mockServer.to).toHaveBeenCalledWith('tab:tab-1');
      expect(mockServer.emit).toHaveBeenCalledWith('tabUpdate', expect.objectContaining({
        type: 'payment_made',
      }));
    });

    it('should emit tab_closed via notifyTabClosed', () => {
      gateway.notifyTabClosed('tab-1');

      expect(mockServer.to).toHaveBeenCalledWith('tab:tab-1');
      expect(mockServer.emit).toHaveBeenCalledWith('tabUpdate', expect.objectContaining({
        type: 'tab_closed',
      }));
    });
  });
});
