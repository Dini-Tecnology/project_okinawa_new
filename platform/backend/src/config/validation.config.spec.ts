import { validationSchema, validationOptions } from './validation.config';

/**
 * Helper that runs the Joi schema against a given env object and
 * returns { error, value } — mirrors what ConfigModule does internally.
 */
function validate(env: Record<string, string>) {
  return validationSchema.validate(env, { ...validationOptions, abortEarly: false });
}

describe('validationSchema', () => {
  // Minimum set of required variables that are always needed regardless of environment
  const minimalDevelopmentEnv: Record<string, string> = {
    NODE_ENV: 'development',
    DATABASE_HOST: 'localhost',
    DATABASE_USER: 'okinawa',
    DATABASE_PASSWORD: 'supersecretpassword123',
    DATABASE_NAME: 'okinawa_db',
    JWT_SECRET: 'this_is_a_very_long_secret_at_least_32_chars',
    JWT_REFRESH_SECRET: 'this_is_another_very_long_refresh_secret_32',
  };

  describe('development environment — minimal valid config', () => {
    it('should pass validation with minimum required variables', () => {
      const { error, value } = validate(minimalDevelopmentEnv);

      expect(error).toBeUndefined();
      expect(value).toBeDefined();
    });

    it('should apply default values for optional fields', () => {
      const { error, value } = validate(minimalDevelopmentEnv);

      expect(error).toBeUndefined();
      expect(value.PORT).toBe(3000);
      expect(value.DATABASE_PORT).toBe(5432);
      expect(value.DATABASE_SSL).toBe('false');
      expect(value.DATABASE_SSL_REJECT_UNAUTHORIZED).toBe('true');
      expect(value.CORS_ORIGIN).toBe('http://localhost:3000');
      expect(value.CORS_CREDENTIALS).toBe('true');
    });

    it('should accept CORS_ORIGIN without restriction in development', () => {
      const env = { ...minimalDevelopmentEnv, CORS_ORIGIN: 'http://localhost:8081' };
      const { error } = validate(env);

      expect(error).toBeUndefined();
    });

    it('should accept DATABASE_SSL=false in development', () => {
      const env = { ...minimalDevelopmentEnv, DATABASE_SSL: 'false' };
      const { error } = validate(env);

      expect(error).toBeUndefined();
    });
  });

  describe('production environment — strict requirements', () => {
    const minimalProductionEnv: Record<string, string> = {
      ...minimalDevelopmentEnv,
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://app.example.com',
      DATABASE_SSL: 'true',
    };

    it('should pass validation with all production-required variables set', () => {
      const { error } = validate(minimalProductionEnv);

      expect(error).toBeUndefined();
    });

    it('should fail when CORS_ORIGIN is missing in production', () => {
      const env: Record<string, string> = { ...minimalProductionEnv };
      delete env['CORS_ORIGIN'];

      const { error } = validate(env);

      expect(error).toBeDefined();
      const messages = error!.details.map((d) => d.message);
      expect(messages.some((m) => m.includes('CORS_ORIGIN'))).toBe(true);
    });

    it('should fail when DATABASE_SSL is not "true" in production', () => {
      const env = { ...minimalProductionEnv, DATABASE_SSL: 'false' };

      const { error } = validate(env);

      expect(error).toBeDefined();
      const messages = error!.details.map((d) => d.message);
      expect(messages.some((m) => m.includes('DATABASE_SSL'))).toBe(true);
    });

    it('should fail when DATABASE_SSL is absent in production', () => {
      const env: Record<string, string> = { ...minimalProductionEnv };
      delete env['DATABASE_SSL'];

      const { error } = validate(env);

      expect(error).toBeDefined();
      // Check either the message or the path includes DATABASE_SSL
      const hasSSLError = error!.details.some(
        (d) =>
          d.message.includes('DATABASE_SSL') ||
          d.path.includes('DATABASE_SSL'),
      );
      expect(hasSSLError).toBe(true);
    });
  });

  describe('JWT_SECRET validation', () => {
    it('should fail when JWT_SECRET is shorter than 32 characters', () => {
      const env = { ...minimalDevelopmentEnv, JWT_SECRET: 'short_secret' };

      const { error } = validate(env);

      expect(error).toBeDefined();
      const messages = error!.details.map((d) => d.message);
      expect(messages.some((m) => m.includes('JWT_SECRET'))).toBe(true);
    });

    it('should fail when JWT_SECRET is missing', () => {
      const env: Record<string, string> = { ...minimalDevelopmentEnv };
      delete env['JWT_SECRET'];

      const { error } = validate(env);

      expect(error).toBeDefined();
      const messages = error!.details.map((d) => d.message);
      expect(messages.some((m) => m.includes('JWT_SECRET'))).toBe(true);
    });

    it('should fail when JWT_REFRESH_SECRET is shorter than 32 characters', () => {
      const env = { ...minimalDevelopmentEnv, JWT_REFRESH_SECRET: 'too_short' };

      const { error } = validate(env);

      expect(error).toBeDefined();
      const messages = error!.details.map((d) => d.message);
      expect(messages.some((m) => m.includes('JWT_REFRESH_SECRET'))).toBe(true);
    });

    it('should pass when JWT_SECRET has exactly 32 characters', () => {
      const env = {
        ...minimalDevelopmentEnv,
        JWT_SECRET: '12345678901234567890123456789012', // exactly 32 chars
      };

      const { error } = validate(env);

      expect(error).toBeUndefined();
    });
  });

  describe('DATABASE_SSL_REJECT_UNAUTHORIZED', () => {
    it('should default to "true" when not set', () => {
      const { error, value } = validate(minimalDevelopmentEnv);

      expect(error).toBeUndefined();
      expect(value.DATABASE_SSL_REJECT_UNAUTHORIZED).toBe('true');
    });

    it('should accept "false" explicitly', () => {
      const env = { ...minimalDevelopmentEnv, DATABASE_SSL_REJECT_UNAUTHORIZED: 'false' };
      const { error } = validate(env);

      expect(error).toBeUndefined();
    });
  });

  describe('required database variables', () => {
    it('should fail when DATABASE_HOST is missing', () => {
      const env: Record<string, string> = { ...minimalDevelopmentEnv };
      delete env['DATABASE_HOST'];

      const { error } = validate(env);

      expect(error).toBeDefined();
      const messages = error!.details.map((d) => d.message);
      expect(messages.some((m) => m.includes('DATABASE_HOST'))).toBe(true);
    });

    it('should fail when DATABASE_PASSWORD is missing', () => {
      const env: Record<string, string> = { ...minimalDevelopmentEnv };
      delete env['DATABASE_PASSWORD'];

      const { error } = validate(env);

      expect(error).toBeDefined();
      const messages = error!.details.map((d) => d.message);
      expect(messages.some((m) => m.includes('DATABASE_PASSWORD'))).toBe(true);
    });
  });
});
