import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;

interface BootstrapConfig {
  supabaseUrl: string;
  secretKey: string;
  adminEmail: string;
  adminPassword: string;
  adminFullName: string;
  restaurantName: string;
  restaurantServiceType: string;
  restaurantPhone: string;
  restaurantEmail: string;
  restaurantAddress: string;
  restaurantCity: string;
  restaurantState: string;
  restaurantZipCode: string;
}

interface AuthAdminUserResponse {
  id: string;
  email?: string;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  if (value.includes('<') || value.includes('>')) {
    throw new Error(`Environment variable ${name} still contains a placeholder value: ${value}`);
  }
  return value.trim();
}

function withDefault(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

function firstAvailableRequiredEnv(names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) {
      if (value.includes('<') || value.includes('>')) {
        throw new Error(`Environment variable ${name} still contains a placeholder value: ${value}`);
      }
      return value.trim();
    }
  }
  throw new Error(`Missing required environment variable. Provide one of: ${names.join(', ')}`);
}

function loadConfig(): BootstrapConfig {
  const rawSupabaseUrl = requiredEnv('SUPABASE_URL').replace(/\/+$/, '');
  try {
    const parsed = new URL(rawSupabaseUrl);
    if (parsed.protocol !== 'https:') {
      throw new Error(`SUPABASE_URL must use https. Received: ${rawSupabaseUrl}`);
    }
  } catch {
    throw new Error(`SUPABASE_URL is invalid: ${rawSupabaseUrl}`);
  }

  return {
    supabaseUrl: rawSupabaseUrl,
    secretKey: firstAvailableRequiredEnv(['SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY']),
    adminEmail: requiredEnv('BOOTSTRAP_ADMIN_EMAIL'),
    adminPassword: requiredEnv('BOOTSTRAP_ADMIN_PASSWORD'),
    adminFullName: withDefault('BOOTSTRAP_ADMIN_FULL_NAME', 'Owner Admin'),
    restaurantName: withDefault('BOOTSTRAP_RESTAURANT_NAME', 'Okinawa Restaurant'),
    restaurantServiceType: withDefault('BOOTSTRAP_RESTAURANT_SERVICE_TYPE', 'restaurant'),
    restaurantPhone: withDefault('BOOTSTRAP_RESTAURANT_PHONE', '+5500000000000'),
    restaurantEmail: withDefault('BOOTSTRAP_RESTAURANT_EMAIL', requiredEnv('BOOTSTRAP_ADMIN_EMAIL')),
    restaurantAddress: withDefault('BOOTSTRAP_RESTAURANT_ADDRESS', 'Avenida Principal, 100'),
    restaurantCity: withDefault('BOOTSTRAP_RESTAURANT_CITY', 'Sao Paulo'),
    restaurantState: withDefault('BOOTSTRAP_RESTAURANT_STATE', 'SP'),
    restaurantZipCode: withDefault('BOOTSTRAP_RESTAURANT_ZIP_CODE', '01000-000'),
  };
}

async function supabaseRequest<T>(
  config: BootstrapConfig,
  path: string,
  init: RequestInit,
  customHeaders?: HeadersInit,
): Promise<T> {
  const response = await fetch(`${config.supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: config.secretKey,
      Authorization: `Bearer ${config.secretKey}`,
      'Content-Type': 'application/json',
      ...customHeaders,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed (${response.status}) ${path}: ${body}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const bodyText = await response.text();
  if (!bodyText.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(bodyText) as T;
  } catch {
    throw new Error(`Supabase response is not valid JSON for ${path}: ${bodyText}`);
  }
}

async function createOrGetAdminUser(config: BootstrapConfig): Promise<AuthAdminUserResponse> {
  try {
    return await supabaseRequest<AuthAdminUserResponse>(config, '/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email: config.adminEmail,
        password: config.adminPassword,
        email_confirm: true,
        app_metadata: {
          roles: ['owner'],
          bootstrap: true,
        },
        user_metadata: {
          full_name: config.adminFullName,
        },
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('already') && !message.includes('registered')) {
      throw error;
    }
  }

  const users = await supabaseRequest<{ users: AuthAdminUserResponse[] }>(
    config,
    `/auth/v1/admin/users?email=${encodeURIComponent(config.adminEmail)}`,
    { method: 'GET' },
  );

  const existing = users.users.find((user) => user.email?.toLowerCase() === config.adminEmail.toLowerCase());
  if (!existing) {
    throw new Error(`Admin user not found after conflict: ${config.adminEmail}`);
  }

  return existing;
}

async function upsertProfile(config: BootstrapConfig, userId: string): Promise<void> {
  await supabaseRequest<JsonObject[]>(
    config,
    '/rest/v1/profiles?on_conflict=id',
    {
      method: 'POST',
      body: JSON.stringify([
        {
          id: userId,
          email: config.adminEmail,
          full_name: config.adminFullName,
          provider: 'email',
          is_active: true,
          marketing_consent: false,
        },
      ]),
    },
    {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
  );
}

async function upsertRestaurant(config: BootstrapConfig, ownerId: string): Promise<string> {
  const restaurantId = randomUUID();
  const rows = await supabaseRequest<Array<{ id: string }>>(
    config,
    '/rest/v1/restaurants?select=id&owner_id=eq.' + ownerId,
    { method: 'GET' },
  );

  if (rows.length > 0) {
    return rows[0].id;
  }

  const created = await supabaseRequest<Array<{ id: string }>>(
    config,
    '/rest/v1/restaurants',
    {
      method: 'POST',
      body: JSON.stringify([
        {
          id: restaurantId,
          owner_id: ownerId,
          name: config.restaurantName,
          description: 'Bootstrap sem legado',
          address: config.restaurantAddress,
          city: config.restaurantCity,
          state: config.restaurantState,
          zip_code: config.restaurantZipCode,
          phone: config.restaurantPhone,
          email: config.restaurantEmail,
          service_type: config.restaurantServiceType,
          is_active: true,
        },
      ]),
    },
    {
      Prefer: 'return=representation',
    },
  );

  if (!created[0]?.id) {
    throw new Error('Failed to create bootstrap restaurant');
  }

  return created[0].id;
}

async function ensureOwnerRole(config: BootstrapConfig, userId: string, restaurantId: string): Promise<void> {
  const existing = await supabaseRequest<Array<{ id: string }>>(
    config,
    `/rest/v1/user_roles?select=id&user_id=eq.${userId}&restaurant_id=eq.${restaurantId}&role=eq.owner`,
    { method: 'GET' },
  );

  if (existing.length > 0) {
    return;
  }

  await supabaseRequest<JsonObject[]>(
    config,
    '/rest/v1/user_roles',
    {
      method: 'POST',
      body: JSON.stringify([
        {
          id: randomUUID(),
          user_id: userId,
          restaurant_id: restaurantId,
          role: 'owner',
          is_active: true,
        },
      ]),
    },
    {
      Prefer: 'return=minimal',
    },
  );
}

async function updateAppMetadata(config: BootstrapConfig, userId: string, restaurantId: string): Promise<void> {
  await supabaseRequest<JsonObject>(
    config,
    `/auth/v1/admin/users/${userId}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        app_metadata: {
          roles: ['owner'],
          restaurant_ids: [restaurantId],
          bootstrap: true,
        },
      }),
    },
  );
}

async function main() {
  const config = loadConfig();

  console.warn('Starting Supabase no-legacy bootstrap...');
  const adminUser = await createOrGetAdminUser(config);
  await upsertProfile(config, adminUser.id);
  const restaurantId = await upsertRestaurant(config, adminUser.id);
  await ensureOwnerRole(config, adminUser.id, restaurantId);
  await updateAppMetadata(config, adminUser.id, restaurantId);

  console.warn('Bootstrap completed successfully.');
  console.warn(`Admin user: ${config.adminEmail}`);
  console.warn(`Restaurant ID: ${restaurantId}`);
}

main().catch((error) => {
  console.error('Supabase no-legacy bootstrap failed.');
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('PGRST205')) {
    console.error(
      'Prerequisite missing: apply Supabase migrations first so tables profiles/restaurants/user_roles exist.',
    );
  }
  console.error(error);
  process.exit(1);
});
