import { Request } from 'express';

/**
 * Represents the authenticated user extracted from JWT payload.
 * Core fields (sub, email, roles) are always present from the JWT strategy.
 * Use mockUser() from test-utils for spec files.
 */
export interface AuthenticatedUser {
  sub: string;
  id: string;
  email: string;
  roles: string[];
  restaurant_id?: string;
  restaurants?: { id: string; role: string }[];
}

/**
 * Helper to create a mock AuthenticatedUser for tests.
 * Provides sensible defaults for all required fields.
 */
/**
 * Express Request with authenticated user attached by JWT guard.
 * Use this instead of `req: any` in controller method parameters.
 */
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export function mockAuthenticatedUser(
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser {
  return {
    sub: 'test-user-id',
    id: 'test-user-id',
    email: 'test@example.com',
    roles: ['CUSTOMER'],
    ...overrides,
  };
}
