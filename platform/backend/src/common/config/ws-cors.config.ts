/**
 * Centralized WebSocket CORS configuration.
 * Reads from CORS_ORIGIN env or falls back to development defaults.
 */
export function getWsCorsConfig(): { origin: string[] | boolean; credentials: boolean } {
  const corsOrigin = process.env.CORS_ORIGIN;
  const isProduction = process.env.NODE_ENV === 'production';

  if (corsOrigin) {
    return {
      origin: corsOrigin.split(',').map((o) => o.trim()),
      credentials: true,
    };
  }

  if (isProduction) {
    return { origin: false, credentials: true };
  }

  return {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'http://localhost:19006',
    ],
    credentials: true,
  };
}
