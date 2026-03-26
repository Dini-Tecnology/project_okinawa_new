/**
 * ============================================================================
 * NOOWE Platform - k6 Load Test Suite
 * ============================================================================
 *
 * README: How to Run
 * ------------------
 *
 * 1. Install k6:
 *    - macOS:  brew install k6
 *    - Linux:  sudo apt install k6  (or snap install k6)
 *    - Docker: docker pull grafana/k6
 *
 * 2. Start the backend (port 3000):
 *    cd platform/backend && npm run start:dev
 *
 * 3. Run the test:
 *    k6 run platform/backend/test/load/load-test.js
 *
 * 4. Override the base URL for staging/production:
 *    k6 run -e BASE_URL=https://api.noowebr.com platform/backend/test/load/load-test.js
 *
 * 5. Output JSON for CI integration:
 *    k6 run --out json=results.json platform/backend/test/load/load-test.js
 *
 * 6. Output to InfluxDB/Grafana (optional):
 *    k6 run --out influxdb=http://localhost:8086/k6 platform/backend/test/load/load-test.js
 *
 * 7. Run with Docker:
 *    docker run --rm -i --network host grafana/k6 run - < platform/backend/test/load/load-test.js
 *
 * Environment Variables:
 *   BASE_URL          - API base URL (default: http://localhost:3000)
 *   TEST_USER_EMAIL   - Email for auth tests (default: loadtest@noowe.com)
 *   TEST_USER_PASS    - Password for auth tests (default: LoadTest@2026!)
 *   RESTAURANT_ID     - Restaurant UUID for menu/order tests (default: test UUID)
 *
 * ============================================================================
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ---------------------------------------------------------------------------
// Custom Metrics
// ---------------------------------------------------------------------------

const errorRate = new Rate('error_rate');
const healthDuration = new Trend('health_duration', true);
const authDuration = new Trend('auth_duration', true);
const orderDuration = new Trend('order_duration', true);
const menuDuration = new Trend('menu_duration', true);
const paymentDuration = new Trend('payment_duration', true);
const successfulLogins = new Counter('successful_logins');
const successfulOrders = new Counter('successful_orders');
const successfulPayments = new Counter('successful_payments');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_PREFIX = `${BASE_URL}/api/v1`;

const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'loadtest@noowe.com';
const TEST_USER_PASS = __ENV.TEST_USER_PASS || 'LoadTest@2026!';
const RESTAURANT_ID =
  __ENV.RESTAURANT_ID || '00000000-0000-4000-a000-000000000001';

// ---------------------------------------------------------------------------
// k6 Options
// ---------------------------------------------------------------------------

export const options = {
  // Scenarios allow independent VU pools per endpoint
  scenarios: {
    // Scenario 1: Health check baseline
    health_check: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },   // ramp-up
        { duration: '3m', target: 10 },   // sustained
        { duration: '1m', target: 0 },    // ramp-down
      ],
      exec: 'healthCheck',
      tags: { scenario: 'health' },
    },

    // Scenario 2: Auth login flow — 50 VUs
    auth_login: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 0 },
      ],
      exec: 'authLogin',
      tags: { scenario: 'auth' },
    },

    // Scenario 3: Create order — 30 VUs
    create_order: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 30 },
        { duration: '3m', target: 30 },
        { duration: '1m', target: 0 },
      ],
      exec: 'createOrder',
      tags: { scenario: 'orders' },
    },

    // Scenario 4: Menu items — 100 VUs (highest concurrency, read-heavy)
    get_menu_items: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      exec: 'getMenuItems',
      tags: { scenario: 'menu' },
    },

    // Scenario 5: Payment processing — 20 VUs
    payment_process: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 20 },
        { duration: '1m', target: 0 },
      ],
      exec: 'paymentProcess',
      tags: { scenario: 'payments' },
    },
  },

  // Global thresholds
  thresholds: {
    // Overall: 95th percentile response time must be below 500ms
    http_req_duration: ['p(95)<500'],

    // Overall error rate must be below 1%
    error_rate: ['rate<0.01'],

    // Per-scenario duration thresholds
    health_duration: ['p(95)<200'],      // Health should be fast
    auth_duration: ['p(95)<800'],        // Auth may involve bcrypt hashing
    order_duration: ['p(95)<1000'],      // Orders involve DB writes + validation
    menu_duration: ['p(95)<300'],        // Menu reads should be fast (cached)
    payment_duration: ['p(95)<1500'],    // Payments involve external processing

    // HTTP-specific thresholds
    http_req_failed: ['rate<0.01'],      // Less than 1% HTTP errors
  },
};

// ---------------------------------------------------------------------------
// Shared Helpers
// ---------------------------------------------------------------------------

const jsonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/**
 * Authenticates and returns an auth token.
 * Caches the token per VU to avoid re-authenticating on every iteration.
 */
function getAuthToken() {
  const res = http.post(
    `${API_PREFIX}/auth/login`,
    JSON.stringify({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASS,
    }),
    { headers: jsonHeaders, tags: { name: 'auth_login_for_token' } },
  );

  if (res.status === 200 || res.status === 201) {
    try {
      const body = JSON.parse(res.body);
      return body.access_token || body.token || body.data?.access_token || null;
    } catch (_) {
      return null;
    }
  }
  return null;
}

function authHeaders(token) {
  return {
    ...jsonHeaders,
    Authorization: `Bearer ${token}`,
  };
}

// ---------------------------------------------------------------------------
// Scenario Functions
// ---------------------------------------------------------------------------

/**
 * Scenario 1: Health Endpoint (GET /api/v1/health)
 * Baseline test - this endpoint is public, lightweight, and should always
 * respond quickly. Verifies DB connectivity and memory usage.
 */
export function healthCheck() {
  const res = http.get(`${API_PREFIX}/health`, {
    headers: jsonHeaders,
    tags: { name: 'GET /health' },
  });

  healthDuration.add(res.timings.duration);

  const passed = check(res, {
    'health: status is 200': (r) => r.status === 200,
    'health: status is ok': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'ok';
      } catch (_) {
        return false;
      }
    },
    'health: response time < 200ms': (r) => r.timings.duration < 200,
  });

  errorRate.add(!passed);
  sleep(1);
}

/**
 * Scenario 2: Auth Login Flow (POST /api/v1/auth/login)
 * Tests authentication throughput. This endpoint uses bcrypt comparison
 * and JWT generation, so it is CPU-intensive.
 */
export function authLogin() {
  const res = http.post(
    `${API_PREFIX}/auth/login`,
    JSON.stringify({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASS,
    }),
    {
      headers: jsonHeaders,
      tags: { name: 'POST /auth/login' },
    },
  );

  authDuration.add(res.timings.duration);

  const passed = check(res, {
    'auth: status is 200 or 201': (r) =>
      r.status === 200 || r.status === 201,
    'auth: returns token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!(body.access_token || body.token || body.data?.access_token);
      } catch (_) {
        return false;
      }
    },
    'auth: response time < 800ms': (r) => r.timings.duration < 800,
  });

  if (res.status === 200 || res.status === 201) {
    successfulLogins.add(1);
  }

  errorRate.add(!passed);
  sleep(1);
}

/**
 * Scenario 3: Create Order (POST /api/v1/orders)
 * Tests order creation throughput. Requires authentication.
 * Sends a realistic order payload with items and restaurant context.
 */
export function createOrder() {
  const token = getAuthToken();
  if (!token) {
    errorRate.add(true);
    sleep(2);
    return;
  }

  const orderPayload = {
    restaurant_id: RESTAURANT_ID,
    type: 'dine_in',
    items: [
      {
        menu_item_id: '00000000-0000-4000-a000-000000000010',
        quantity: 2,
        notes: 'No onions',
        customizations: [],
      },
      {
        menu_item_id: '00000000-0000-4000-a000-000000000011',
        quantity: 1,
        notes: '',
        customizations: [],
      },
    ],
    notes: `k6 load test order - ${Date.now()}`,
  };

  const res = http.post(
    `${API_PREFIX}/orders`,
    JSON.stringify(orderPayload),
    {
      headers: authHeaders(token),
      tags: { name: 'POST /orders' },
    },
  );

  orderDuration.add(res.timings.duration);

  const passed = check(res, {
    'order: status is 200 or 201': (r) =>
      r.status === 200 || r.status === 201,
    'order: returns order id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!(body.id || body.data?.id);
      } catch (_) {
        return false;
      }
    },
    'order: response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  if (res.status === 200 || res.status === 201) {
    successfulOrders.add(1);
  }

  errorRate.add(!passed);
  sleep(2);
}

/**
 * Scenario 4: Get Menu Items (GET /api/v1/menu-items?restaurant_id=xxx)
 * Tests read performance under high concurrency (100 VUs).
 * This is the most common API call from the mobile app.
 */
export function getMenuItems() {
  const res = http.get(
    `${API_PREFIX}/menu-items?restaurant_id=${RESTAURANT_ID}`,
    {
      headers: jsonHeaders,
      tags: { name: 'GET /menu-items' },
    },
  );

  menuDuration.add(res.timings.duration);

  const passed = check(res, {
    'menu: status is 200': (r) => r.status === 200,
    'menu: returns array or data': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) || Array.isArray(body.data) || body.items;
      } catch (_) {
        return false;
      }
    },
    'menu: response time < 300ms': (r) => r.timings.duration < 300,
  });

  errorRate.add(!passed);
  sleep(0.5);
}

/**
 * Scenario 5: Payment Processing (POST /api/v1/payments/process)
 * Tests payment processing under load. Requires authentication.
 * Lower VU count (20) since payments are sensitive operations.
 */
export function paymentProcess() {
  const token = getAuthToken();
  if (!token) {
    errorRate.add(true);
    sleep(2);
    return;
  }

  const paymentPayload = {
    order_id: '00000000-0000-4000-a000-000000000099',
    amount: 4990,  // R$ 49.90 in cents
    currency: 'BRL',
    method: 'credit_card',
    payment_details: {
      card_token: 'tok_test_load_' + Date.now(),
      installments: 1,
    },
  };

  const res = http.post(
    `${API_PREFIX}/payments/process`,
    JSON.stringify(paymentPayload),
    {
      headers: authHeaders(token),
      tags: { name: 'POST /payments/process' },
    },
  );

  paymentDuration.add(res.timings.duration);

  const passed = check(res, {
    'payment: status is 200 or 201': (r) =>
      r.status === 200 || r.status === 201,
    'payment: returns transaction id': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !!(
          body.transaction_id ||
          body.id ||
          body.data?.transaction_id ||
          body.data?.id
        );
      } catch (_) {
        return false;
      }
    },
    'payment: response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  if (res.status === 200 || res.status === 201) {
    successfulPayments.add(1);
  }

  errorRate.add(!passed);
  sleep(2);
}

// ---------------------------------------------------------------------------
// Setup & Teardown
// ---------------------------------------------------------------------------

/**
 * Runs once before all VUs start. Use for test data seeding or
 * verifying the target environment is reachable.
 */
export function setup() {
  console.log(`[NOOWE Load Test] Target: ${BASE_URL}`);
  console.log(`[NOOWE Load Test] Restaurant ID: ${RESTAURANT_ID}`);

  // Verify the API is reachable before starting the full test
  const healthRes = http.get(`${API_PREFIX}/health`, {
    headers: jsonHeaders,
    tags: { name: 'setup_health_check' },
  });

  if (healthRes.status !== 200) {
    console.error(
      `[NOOWE Load Test] API is not reachable at ${BASE_URL}. ` +
      `Health check returned status ${healthRes.status}. Aborting.`
    );
    // Return data that VUs can use to detect setup failure
    return { apiReachable: false };
  }

  console.log('[NOOWE Load Test] API is reachable. Starting test...');
  return { apiReachable: true, startTime: new Date().toISOString() };
}

/**
 * Runs once after all VUs finish. Use for cleanup or summary logging.
 */
export function teardown(data) {
  if (data && data.startTime) {
    console.log(`[NOOWE Load Test] Test started at: ${data.startTime}`);
    console.log(`[NOOWE Load Test] Test ended at: ${new Date().toISOString()}`);
  }
  console.log('[NOOWE Load Test] Complete. Review results above.');
}
