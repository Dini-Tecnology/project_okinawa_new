import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { StructuredLoggerService } from './common/logging';
import { CsrfMiddleware, CSRF_EXCLUDED_ROUTES } from './common/middleware/csrf.middleware';
import { MaintenanceMiddleware, MAINTENANCE_EXCLUDED_PATHS } from './common/middleware/maintenance.middleware';
import { TermsVersionMiddleware } from './common/middleware/terms-version.middleware';
import { ConsentService } from './modules/identity/services/consent.service';
import { LegalService } from './modules/legal/legal.service';
import { initializeSentry } from './config/sentry.config';
import { swaggerConfig } from './config/swagger.config';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  // Initialize Sentry BEFORE creating the app
  initializeSentry();

  // Create app with structured logger
  const logger = new StructuredLoggerService();
  logger.setContext('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger,
    bufferLogs: true,
  });

  // Use structured logger
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api';
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
  const isProduction = nodeEnv === 'production';
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED') === 'true';

  // Security middleware
  // CSP: In production, remove unsafe-inline; in dev, allow it for Swagger UI
  const cspDirectives: Record<string, string[]> = {
    defaultSrc: ["'self'"],
    scriptSrc: isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'"],
    styleSrc: isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  };

  app.use(helmet({
    contentSecurityPolicy: { directives: cspDirectives },
    crossOriginEmbedderPolicy: isProduction, // Only enforce in production
    strictTransportSecurity: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
  }));
  app.use(compression());
  app.use(cookieParser()); // Required for CSRF tokens

  // Maintenance mode middleware (returns 503 when active)
  const maintenanceMiddleware = new MaintenanceMiddleware();
  app.use((req: Request, res: Response, next: NextFunction) => {
    return maintenanceMiddleware.use(req, res, next);
  });

  // CSRF Protection middleware (applied globally)
  const csrfMiddleware = new CsrfMiddleware();
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for excluded routes
    const isExcluded = CSRF_EXCLUDED_ROUTES.some(route =>
      req.path.startsWith(route) || req.path.startsWith(`/${apiPrefix}${route.replace('/api', '')}`)
    );
    if (isExcluded) {
      return next();
    }
    return csrfMiddleware.use(req, res, next);
  });

  // Terms/Privacy re-consent middleware (LGPD Sprint 2)
  // Returns HTTP 451 when authenticated users haven't accepted the current legal document versions.
  const consentService = app.get(ConsentService);
  const legalService = app.get(LegalService);
  const termsVersionMiddleware = new TermsVersionMiddleware(consentService, legalService);
  app.use((req: Request, res: Response, next: NextFunction) => {
    return termsVersionMiddleware.use(req, res, next);
  });

  // CORS configuration - SECURITY: Never use '*' in production
  // If CORS_ORIGIN is not set, use safe defaults based on environment
  const defaultOrigins = isProduction
    ? [] // In production, CORS_ORIGIN must be explicitly set
    : ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:19006']; // Dev defaults

  // Validate and filter CORS origins
  const validateOrigin = (origin: string): boolean => {
    try {
      const url = new URL(origin);
      // Only allow http/https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        logger.warn(`Invalid CORS origin protocol rejected: ${origin}`);
        return false;
      }
      // In production, only allow https (except localhost for testing)
      if (nodeEnv === 'production' && url.protocol === 'http:' && !url.hostname.includes('localhost')) {
        logger.warn(`HTTP origin rejected in production: ${origin}`);
        return false;
      }
      return true;
    } catch {
      logger.warn(`Malformed CORS origin rejected: ${origin}`);
      return false;
    }
  };

  const corsOrigins = corsOrigin
    ? corsOrigin.split(',').map((origin) => origin.trim()).filter(validateOrigin)
    : defaultOrigins;

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false, // false = reject all cross-origin
    credentials: configService.get<boolean>('CORS_CREDENTIALS') ?? false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-Idempotency-Key',
      'X-Request-ID',
      'X-Trace-ID',
    ],
    exposedHeaders: ['X-CSRF-Token', 'X-Request-ID'],
  });

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global exception filter for Sentry
  app.useGlobalFilters(new SentryExceptionFilter());

  // Global response interceptor for consistent API responses
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformResponseInterceptor(reflector));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation — uses centralized config from swagger.config.ts
  if (swaggerEnabled) {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    const swaggerPath = configService.get<string>('SWAGGER_PATH') || 'docs';
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log(`Swagger documentation available at: http://localhost:${port}/${swaggerPath}`);
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');

  logger.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV')}`);
}

bootstrap();
