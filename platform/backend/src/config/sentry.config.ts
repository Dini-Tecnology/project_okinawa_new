import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Logger } from '@nestjs/common';

const logger = new Logger('SentryConfig');

/**
 * Comprehensive list of sensitive fields to redact
 */
const SENSITIVE_FIELDS = [
  // Authentication
  'password',
  'password_hash',
  'current_password',
  'new_password',
  'confirm_password',
  'old_password',
  // Tokens
  'token',
  'access_token',
  'refresh_token',
  'reset_token',
  'verification_token',
  'auth_token',
  'bearer',
  'jwt',
  // Secrets
  'secret',
  'mfa_secret',
  'totp_secret',
  'otp_secret',
  'two_factor_secret',
  'private_key',
  'encryption_key',
  // API Keys
  'api_key',
  'apiKey',
  'stripe_key',
  'webhook_secret',
  'signing_secret',
  // Payment Information
  'card_number',
  'cardNumber',
  'card_exp',
  'expiry_date',
  'expiration_date',
  'cvv',
  'cvc',
  'security_code',
  'pin',
  'credit_card',
  'creditCard',
  'debit_card',
  // Bank Information
  'bank_account',
  'bankAccount',
  'account_number',
  'routing_number',
  'iban',
  'swift',
  'bic',
  // Personal Identification
  'ssn',
  'social_security',
  'cpf',
  'cnpj',
  'rg',
  'passport',
  'driver_license',
  'national_id',
  // Contact (PII)
  'phone_number',
  'email',
  'address',
  'date_of_birth',
  'birth_date',
];

/**
 * Sensitive headers to remove
 */
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'x-auth-token',
  'x-access-token',
  'x-refresh-token',
  'x-csrf-token',
];

/**
 * Recursively sanitize an object by redacting sensitive fields
 */
function sanitizeData(data: unknown, depth: number = 0): unknown {
  if (depth > 10) return '[MAX_DEPTH_EXCEEDED]';
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Check if string looks like a JWT token
    if (data.match(/^eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*$/)) {
      return '[JWT_REDACTED]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(value, depth + 1);
      }
    }
    return sanitized;
  }

  return data;
}

export function initializeSentry() {
  if (!process.env.SENTRY_DSN) {
    logger.warn('Sentry DSN not configured. Skipping Sentry initialization.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Performance Monitoring
    integrations: [nodeProfilingIntegration()],

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Profiling
    profilesSampleRate: 0.1,

    // Release tracking
    release: process.env.npm_package_version,

    // Before send hook - sanitize ALL sensitive data
    beforeSend(event) {
      // Sanitize request headers
      if (event.request?.headers) {
        for (const header of SENSITIVE_HEADERS) {
          if (event.request.headers[header]) {
            event.request.headers[header] = '[REDACTED]';
          }
        }
      }

      // Sanitize request body/data
      if (event.request?.data) {
        event.request.data = sanitizeData(event.request.data) as string;
      }

      // Sanitize query string
      if (event.request?.query_string) {
        event.request.query_string = sanitizeData(event.request.query_string) as string;
      }

      // Sanitize cookies
      if (event.request?.cookies) {
        event.request.cookies = {};
      }

      // Sanitize breadcrumbs that might contain sensitive data
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.data) {
            breadcrumb.data = sanitizeData(breadcrumb.data) as Record<string, unknown>;
          }
          return breadcrumb;
        });
      }

      // Sanitize extra context
      if (event.extra) {
        event.extra = sanitizeData(event.extra) as Record<string, unknown>;
      }

      // Sanitize contexts
      if (event.contexts) {
        for (const [key, context] of Object.entries(event.contexts)) {
          if (typeof context === 'object' && context !== null) {
            event.contexts[key] = sanitizeData(context) as Record<string, unknown>;
          }
        }
      }

      return event;
    },

    // Before breadcrumb - sanitize breadcrumbs before they're added
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data) {
        breadcrumb.data = sanitizeData(breadcrumb.data) as Record<string, unknown>;
      }
      return breadcrumb;
    },
  });

  logger.log('Sentry initialized successfully');
}
