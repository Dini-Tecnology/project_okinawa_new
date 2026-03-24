import { configureRedisAdapter, RedisIoAdapter } from '../socket-redis-adapter.config';

// Mock redis
const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockDuplicate = jest.fn().mockReturnValue({
  connect: mockConnect,
  on: jest.fn(),
});
const mockCreateClient = jest.fn().mockReturnValue({
  connect: mockConnect,
  duplicate: mockDuplicate,
  on: jest.fn(),
});

jest.mock('redis', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

jest.mock('@socket.io/redis-adapter', () => ({
  createAdapter: jest.fn().mockReturnValue('mock-adapter-constructor'),
}));

describe('RedisIoAdapter', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('connectToRedis', () => {
    it('should connect with default host and port', async () => {
      const adapter = new RedisIoAdapter({} as any);
      await adapter.connectToRedis();

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.objectContaining({
          socket: expect.objectContaining({
            host: 'localhost',
            port: 6379,
          }),
        }),
      );
    });

    it('should use REDIS_HOST and REDIS_PORT from env', async () => {
      process.env.REDIS_HOST = 'redis.example.com';
      process.env.REDIS_PORT = '6380';
      process.env.REDIS_PASSWORD = 'secret';

      const adapter = new RedisIoAdapter({} as any);
      await adapter.connectToRedis();

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.objectContaining({
          socket: expect.objectContaining({
            host: 'redis.example.com',
            port: 6380,
          }),
          password: 'secret',
        }),
      );
    });

    it('should enable TLS when REDIS_TLS is true', async () => {
      process.env.REDIS_TLS = 'true';

      const adapter = new RedisIoAdapter({} as any);
      await adapter.connectToRedis();

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.objectContaining({
          socket: expect.objectContaining({
            tls: true,
            rejectUnauthorized: true,
          }),
        }),
      );
    });

    it('should create pub and sub clients', async () => {
      const adapter = new RedisIoAdapter({} as any);
      await adapter.connectToRedis();

      expect(mockDuplicate).toHaveBeenCalled();
      // Both pub and sub clients should connect
      expect(mockConnect).toHaveBeenCalledTimes(2);
    });
  });

  describe('configureRedisAdapter', () => {
    it('should skip when REDIS_HOST not set in development', async () => {
      delete process.env.REDIS_HOST;
      process.env.NODE_ENV = 'development';

      const mockApp = {
        useWebSocketAdapter: jest.fn(),
      } as any;

      await configureRedisAdapter(mockApp);

      expect(mockApp.useWebSocketAdapter).not.toHaveBeenCalled();
    });

    it('should configure adapter when REDIS_HOST is set', async () => {
      process.env.REDIS_HOST = 'localhost';

      const mockApp = {
        useWebSocketAdapter: jest.fn(),
      } as any;

      await configureRedisAdapter(mockApp);

      expect(mockApp.useWebSocketAdapter).toHaveBeenCalled();
    });

    it('should fall back gracefully on connection error', async () => {
      process.env.REDIS_HOST = 'invalid-host';

      // Make connect fail
      mockConnect.mockRejectedValueOnce(new Error('Connection refused'));

      const mockApp = {
        useWebSocketAdapter: jest.fn(),
      } as any;

      await configureRedisAdapter(mockApp);

      // Should NOT throw, just log error
      expect(mockApp.useWebSocketAdapter).not.toHaveBeenCalled();
    });
  });
});
