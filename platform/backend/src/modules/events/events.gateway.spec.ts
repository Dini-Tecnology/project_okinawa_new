import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './events.gateway';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockSocket = {
    id: 'socket-1',
    handshake: { auth: { token: 'valid-token' } },
    user: { id: 'user-1', email: 'test@example.com', roles: [], restaurant_id: 'restaurant-1' },
    join: jest.fn(),
    leave: jest.fn(),
    disconnect: jest.fn(),
  } as any;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsGateway, { provide: JwtService, useValue: mockJwtService }],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    jwtService = module.get<JwtService>(JwtService);
    gateway.server = mockServer;
    jest.clearAllMocks();
  });

  it('should handle connection', async () => {
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      email: 'test@example.com',
      roles: [],
      restaurant_id: 'restaurant-1',
    });

    await gateway.handleConnection(mockSocket);

    expect(mockSocket.user).toBeDefined();
    expect(mockSocket.join).toHaveBeenCalled();
  });

  it('should handle order join', () => {
    const result = gateway.handleOrderJoin(mockSocket, { order_id: 'order-1' });
    expect(mockSocket.join).toHaveBeenCalledWith('order:order-1');
  });

  it('should notify new order', () => {
    gateway.notifyNewOrder('restaurant-1', { order_id: 'order-1', id: 'order-1' });
    expect(mockServer.to).toHaveBeenCalledWith('restaurant:restaurant-1');
    expect(mockServer.emit).toHaveBeenCalledWith('order:new', { order_id: 'order-1', id: 'order-1' });
  });

  it('should notify user', async () => {
    // First connect user to populate userSockets
    mockJwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      email: 'test@example.com',
      roles: [],
    });
    await gateway.handleConnection(mockSocket);

    gateway.notifyUser('user-1', { type: 'test', message: 'test' });
    expect(mockServer.to).toHaveBeenCalled();
  });

  it('should handle disconnect', () => {
    gateway.handleDisconnect(mockSocket);
    expect(mockSocket.user).toBeDefined();
  });
});
