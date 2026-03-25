/**
 * Worker Entrypoint — Dedicated Bull Queue Processor
 *
 * This file bootstraps a standalone NestJS application that only processes
 * background jobs (notifications, reports, exports, emails).
 * It does NOT expose HTTP endpoints — that's the API server's job.
 *
 * Architecture:
 *   API Server (main.ts) → Enqueues jobs
 *   Worker (worker.ts)   → Processes jobs
 *
 * Both connect to the same Redis instance for Bull queues.
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';
import { StructuredLoggerService } from './common/logging';
import { initializeSentry } from './config/sentry.config';

async function bootstrapWorker() {
  initializeSentry();

  const logger = new StructuredLoggerService();
  logger.setContext('Worker');

  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger,
    bufferLogs: true,
  });

  app.useLogger(logger);
  app.enableShutdownHooks();

  // Health check via file (for Docker healthcheck)
  const fs = await import('fs');
  const healthFile = '/tmp/worker-healthy';
  fs.writeFileSync(healthFile, new Date().toISOString());

  // Periodic health heartbeat
  setInterval(() => {
    fs.writeFileSync(healthFile, new Date().toISOString());
  }, 15_000);

  logger.log('🔄 Worker process started — listening for Bull queue jobs');
  logger.log(`PID: ${process.pid} | Node: ${process.version}`);

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Graceful shutdown...`);
    try {
      fs.unlinkSync(healthFile);
    } catch {}
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrapWorker().catch((err) => {
  const fallbackLogger = new Logger('WorkerBootstrap');
  fallbackLogger.error('Worker failed to start:', err);
  process.exit(1);
});
