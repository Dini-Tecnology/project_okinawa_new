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
