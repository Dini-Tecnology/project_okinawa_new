/**
 * Dev-only auth bypass: show login/register UI, but enter the app without real credentials.
 * Set EXPO_PUBLIC_SKIP_AUTH=true in the app .env — never enable in production builds.
 */
export function isAuthSkipped(): boolean {
  const flag = process.env.EXPO_PUBLIC_SKIP_AUTH;
  return flag === 'true' || flag === '1';
}

export const DEV_GUEST_ACCESS_TOKEN = 'dev-bypass-token';

export const DEV_GUEST_USER = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'exploracao@noowe.local',
  full_name: 'Exploração UI',
  role: 'customer',
} as const;

export function isDevGuestAccessToken(token: string | null | undefined): boolean {
  return token === DEV_GUEST_ACCESS_TOKEN;
}
