import { INestApplication, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';

/**
 * Custom Socket.IO adapter that uses Redis pub/sub for multi-instance support.
 * Enables horizontal scaling — events emitted on one server reach clients on all servers.
 */
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | undefined;
  private readonly logger = new Logger(RedisIoAdapter.name);

  async connectToRedis(): Promise<void> {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const password = process.env.REDIS_PASSWORD;
    const useTls =
      process.env.REDIS_TLS === 'true' ||
      process.env.REDIS_URL?.startsWith('rediss://');

    const redisOptions: Parameters<typeof createClient>[0] = {
      socket: {
        host,
        port,
        ...(useTls && {
          tls: true,
          rejectUnauthorized:
            process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
        }),
      },
      ...(password && { password }),
    };

    const pubClient = createClient(redisOptions);
    const subClient = pubClient.duplicate();

    pubClient.on('error', (err) =>
      this.logger.error(`Redis pub client error: ${err.message}`),
    );
    subClient.on('error', (err) =>
      this.logger.error(`Redis sub client error: ${err.message}`),
    );

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
    this.logger.log(`Redis adapter connected to ${host}:${port}`);
  }

  createIOServer(port: number, options?: Partial<ServerOptions>) {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}

/**
 * Configure the Redis IO adapter on the NestJS app.
 * Gracefully falls back to the default in-memory adapter if Redis is unavailable.
 */
export async function configureRedisAdapter(
  app: INestApplication,
): Promise<void> {
  const logger = new Logger('RedisIoAdapter');

  // Only enable if REDIS_HOST is configured (skip in local dev without Redis)
  if (!process.env.REDIS_HOST && process.env.NODE_ENV !== 'production') {
    logger.warn(
      'REDIS_HOST not set — using default in-memory Socket.IO adapter (not suitable for multi-instance)',
    );
    return;
  }

  try {
    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    logger.log('Socket.IO Redis adapter configured successfully');
  } catch (error: any) {
    logger.error(
      `Failed to connect Redis adapter: ${error.message}. Falling back to in-memory adapter.`,
    );
  }
}
