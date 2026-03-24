import { getWsCorsConfig } from './ws-cors.config';

describe('getWsCorsConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.CORS_ORIGIN;
    delete process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return dev defaults when no CORS_ORIGIN env is set', () => {
    const config = getWsCorsConfig();

    expect(config.credentials).toBe(true);
    expect(Array.isArray(config.origin)).toBe(true);
    expect(config.origin).toEqual([
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'http://localhost:19006',
    ]);
  });

  it('should parse CORS_ORIGIN when set as comma-separated string', () => {
    process.env.CORS_ORIGIN = 'https://app.noowe.com, https://admin.noowe.com';

    const config = getWsCorsConfig();

    expect(config.credentials).toBe(true);
    expect(Array.isArray(config.origin)).toBe(true);
    expect(config.origin).toEqual([
      'https://app.noowe.com',
      'https://admin.noowe.com',
    ]);
  });

  it('should parse single CORS_ORIGIN value', () => {
    process.env.CORS_ORIGIN = 'https://app.noowe.com';

    const config = getWsCorsConfig();

    expect(config.credentials).toBe(true);
    expect(config.origin).toEqual(['https://app.noowe.com']);
  });

  it('should return false origin in production with no CORS_ORIGIN', () => {
    process.env.NODE_ENV = 'production';

    const config = getWsCorsConfig();

    expect(config.credentials).toBe(true);
    expect(config.origin).toBe(false);
  });

  it('should use CORS_ORIGIN even in production when set', () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN = 'https://app.noowe.com';

    const config = getWsCorsConfig();

    expect(config.credentials).toBe(true);
    expect(config.origin).toEqual(['https://app.noowe.com']);
  });
});
