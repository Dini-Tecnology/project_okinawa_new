import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Paths excluded from maintenance mode checks.
 * Health endpoints must always be accessible for monitoring.
 */
const EXCLUDED_PATHS = [
  '/health',
  '/api/health',
  '/api/v1/health',
];

/**
 * MaintenanceMiddleware — returns 503 when maintenance mode is active.
 *
 * Activation: Set the MAINTENANCE_MODE environment variable to "true".
 * Optionally set MAINTENANCE_MESSAGE and MAINTENANCE_ESTIMATED_END.
 *
 * All requests except health-check endpoints receive a 503 response
 * with a JSON body that mobile clients can use to render a
 * dedicated maintenance screen.
 */
@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';

    if (!isMaintenanceMode) {
      return next();
    }

    // Allow health-check endpoints through even during maintenance
    const isExcluded = EXCLUDED_PATHS.some(
      (p) => req.path === p || req.path.startsWith(`${p}/`),
    );

    if (isExcluded) {
      return next();
    }

    const message =
      process.env.MAINTENANCE_MESSAGE ||
      'We are currently performing scheduled maintenance. Please try again later.';
    const estimatedEnd = process.env.MAINTENANCE_ESTIMATED_END || undefined;

    res.status(503).json({
      maintenance: true,
      message,
      estimatedEnd,
    });
  }
}

export { EXCLUDED_PATHS as MAINTENANCE_EXCLUDED_PATHS };
