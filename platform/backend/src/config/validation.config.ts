import * as Joi from 'joi';

/**
 * Environment variables validation schema
 * All required variables must be defined in .env file
 * The application will fail to start if required variables are missing
 */
export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  // Database - REQUIRED
  DATABASE_HOST: Joi.string().required().description('Database host address'),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_USER: Joi.string().required().description('Database username'),
  DATABASE_PASSWORD: Joi.string().required().description('Database password'),
  DATABASE_NAME: Joi.string().required().description('Database name'),
  DATABASE_SSL: Joi.string()
    .valid('true', 'false')
    .default('false')
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.string().valid(Joi.override, 'true').required().messages({
        'any.only': 'DATABASE_SSL must be "true" in production',
      }),
    }),
  DATABASE_SSL_REJECT_UNAUTHORIZED: Joi.string().valid('true', 'false').default('true'),
  DATABASE_LOGGING: Joi.string().valid('true', 'false').default('false'),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().optional().allow(''),
  REDIS_DB: Joi.number().min(0).max(15).default(0),
  REDIS_CACHE_DB: Joi.number().min(0).max(15).default(1),

  // JWT - REQUIRED
  JWT_SECRET: Joi.string().min(32).required().description('JWT signing secret (min 32 chars)'),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required().description('JWT refresh secret (min 32 chars)'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  CSRF_SECRET: Joi.string().min(32).optional().description('CSRF signing secret (falls back to JWT_SECRET)'),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().min(1000).default(60000),
  THROTTLE_LIMIT: Joi.number().min(1).default(100),

  // CORS
  CORS_ORIGIN: Joi.string()
    .default('http://localhost:3000')
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.string().required().messages({
        'any.required': 'CORS_ORIGIN must be set explicitly in production',
      }),
    }),
  CORS_CREDENTIALS: Joi.string().valid('true', 'false').default('true'),

  // Sentry (Optional)
  SENTRY_DSN: Joi.string().uri().optional().allow(''),
  SENTRY_ENVIRONMENT: Joi.string().optional(),

  // Swagger
  SWAGGER_ENABLED: Joi.string().valid('true', 'false').default('false'),
  SWAGGER_TITLE: Joi.string().default('Okinawa API'),
  SWAGGER_DESCRIPTION: Joi.string().default('Restaurant Technology Platform API'),
  SWAGGER_VERSION: Joi.string().default('1.0'),
  SWAGGER_PATH: Joi.string().default('docs'),

  // Email (Optional)
  SENDGRID_API_KEY: Joi.string().optional().allow(''),
  SENDGRID_FROM_EMAIL: Joi.string().email().optional(),
  SENDGRID_FROM_NAME: Joi.string().optional(),

  // AWS S3 (Optional)
  AWS_ACCESS_KEY_ID: Joi.string().optional().allow(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional().allow(''),
  AWS_REGION: Joi.string().optional().default('us-east-1'),
  AWS_S3_BUCKET: Joi.string().optional(),

  // Payment Gateway (Optional)
  ASAAS_API_KEY: Joi.string().optional().allow(''),
  ASAAS_ENVIRONMENT: Joi.string().valid('sandbox', 'production').default('sandbox'),

  // AI Services (Optional)
  OPENAI_API_KEY: Joi.string().optional().allow(''),
  OPENAI_MODEL: Joi.string().default('gpt-4-turbo-preview'),

  // Firebase (Optional)
  FCM_SERVER_KEY: Joi.string().optional().allow(''),
  FCM_PROJECT_ID: Joi.string().optional().allow(''),

  // Twilio (Required for OTP in production)
  TWILIO_ACCOUNT_SID: Joi.string().optional().allow(''),
  TWILIO_AUTH_TOKEN: Joi.string().optional().allow(''),
  TWILIO_SERVICE_SID: Joi.string().optional().allow('').description('Twilio Verify Service SID'),
  TWILIO_PHONE_NUMBER: Joi.string().optional().allow(''),

  // OAuth Providers (Required for Social Auth in production)
  GOOGLE_CLIENT_ID: Joi.string().optional().allow(''),
  GOOGLE_CLIENT_SECRET: Joi.string().optional().allow(''),
  APPLE_CLIENT_ID: Joi.string().optional().allow('').description('Apple Services ID'),
  APPLE_TEAM_ID: Joi.string().optional().allow(''),
  APPLE_KEY_ID: Joi.string().optional().allow(''),
  APPLE_PRIVATE_KEY: Joi.string().optional().allow('').description('Apple Sign In private key (PEM)'),
});

/**
 * Validation options for ConfigModule
 */
export const validationOptions = {
  allowUnknown: true,
  abortEarly: false,
};
