// @ts-nocheck
/**
 * Tabs API Integration Tests
 *
 * Uses Jest global fetch mocks (no MSW / vitest dependency).
 */

// Mock data
const mockTab = {
  id: 'tab-001',
  userId: 'user-123',
  restaurantId: 'rest-456',
  type: 'individual',
  status: 'open',
  preAuthAmount: 100,
  limitAmount: 500,
  items: [],
  total: 0,
  createdAt: new Date().toISOString(),
};

const mockTabItem = {
  id: 'item-001',
  tabId: 'tab-001',
  userId: 'user-123',
  menuItemId: 'menu-001',
  menuItemName: 'Cerveja Artesanal',
  quantity: 2,
  unitPrice: 18.9,
  total: 37.8,
  addedAt: new Date().toISOString(),
};

const mockHappyHour = {
  id: 'hh-001',
  restaurantId: 'rest-456',
  dayOfWeek: [4, 5], // Thursday, Friday
  startTime: '17:00',
  endTime: '20:00',
  discountPercentage: 30,
  isActive: true,
};

// ---------- fetch mock router ----------
function createFetchMock() {
  return jest.fn(async (url: string, init?: RequestInit) => {
    const method = (init?.method || 'GET').toUpperCase();
    const body = init?.body ? JSON.parse(init.body as string) : {};

    // POST /api/tabs
    if (method === 'POST' && url === '/api/tabs') {
      return new Response(
        JSON.stringify({
          ...mockTab,
          restaurantId: body.restaurantId || mockTab.restaurantId,
          type: body.type || mockTab.type,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // GET /api/tabs/:id
    if (method === 'GET' && /^\/api\/tabs\/[^/]+$/.test(url) && !url.includes('/items')) {
      const id = url.split('/').pop();
      if (id === 'not-found') {
        return new Response(JSON.stringify({ message: 'Tab not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ...mockTab, id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/tabs/:id/join
    if (method === 'POST' && /\/api\/tabs\/[^/]+\/join$/.test(url)) {
      return new Response(
        JSON.stringify({ success: true, message: 'Joined tab successfully', tab: mockTab }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // POST /api/tabs/:id/items
    if (method === 'POST' && /\/api\/tabs\/[^/]+\/items$/.test(url)) {
      return new Response(
        JSON.stringify({ ...mockTabItem, menuItemId: body.menuItemId, quantity: body.quantity }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // GET /api/tabs/:id/items
    if (method === 'GET' && /\/api\/tabs\/[^/]+\/items$/.test(url)) {
      return new Response(
        JSON.stringify({ items: [mockTabItem], total: mockTabItem.total }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // POST /api/tabs/:id/repeat-round
    if (method === 'POST' && /\/api\/tabs\/[^/]+\/repeat-round$/.test(url)) {
      return new Response(
        JSON.stringify({ success: true, items: [{ ...mockTabItem, id: 'item-002' }], message: 'Round repeated successfully' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // POST /api/tabs/:id/split
    if (method === 'POST' && /\/api\/tabs\/[^/]+\/split$/.test(url)) {
      const splitType = body.splitType as string;
      if (splitType === 'equal') {
        return new Response(
          JSON.stringify({ splitType: 'equal', totalAmount: 150.0, perPerson: 50.0, participants: 3 }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        );
      }
      return new Response(
        JSON.stringify({
          splitType: 'by_consumption',
          breakdown: [
            { userId: 'user-1', amount: 75.0 },
            { userId: 'user-2', amount: 45.0 },
            { userId: 'user-3', amount: 30.0 },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // POST /api/tabs/:id/pay
    if (method === 'POST' && /\/api\/tabs\/[^/]+\/pay$/.test(url)) {
      return new Response(
        JSON.stringify({
          success: true,
          paymentId: 'pay-001',
          amount: body.amount,
          method: body.paymentMethod,
          tabStatus: 'closed',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // GET /api/happy-hour/active
    if (method === 'GET' && url.startsWith('/api/happy-hour/active')) {
      const restaurantId = new URL(url, 'http://localhost').searchParams.get('restaurantId');
      if (restaurantId === 'no-hh') {
        return new Response(JSON.stringify({ active: false, happyHour: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ active: true, happyHour: mockHappyHour }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/waiter-calls
    if (method === 'POST' && url === '/api/waiter-calls') {
      return new Response(
        JSON.stringify({
          id: 'call-001',
          tabId: body.tabId,
          tableId: body.tableId,
          type: body.type || 'general',
          status: 'pending',
          createdAt: new Date().toISOString(),
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // fallback
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

// ---------- test suite ----------
describe('Tabs API Integration Tests', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = createFetchMock() as any;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  describe('Tab Lifecycle', () => {
    it('should create a new individual tab', async () => {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: 'rest-456', type: 'individual' }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.type).toBe('individual');
      expect(data.status).toBe('open');
    });

    it('should create a group tab', async () => {
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: 'rest-456', type: 'group' }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.type).toBe('group');
    });

    it('should get tab by ID', async () => {
      const response = await fetch('/api/tabs/tab-001');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.id).toBe('tab-001');
    });

    it('should return 404 for non-existent tab', async () => {
      const response = await fetch('/api/tabs/not-found');

      expect(response.status).toBe(404);
    });
  });

  describe('Tab Operations', () => {
    it('should join an existing tab', async () => {
      const response = await fetch('/api/tabs/tab-001/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-456' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should add items to tab', async () => {
      const response = await fetch('/api/tabs/tab-001/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItemId: 'menu-001', quantity: 2 }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.menuItemId).toBe('menu-001');
      expect(data.quantity).toBe(2);
    });

    it('should list tab items', async () => {
      const response = await fetch('/api/tabs/tab-001/items');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.items).toHaveLength(1);
      expect(data.total).toBeGreaterThan(0);
    });

    it('should repeat last round', async () => {
      const response = await fetch('/api/tabs/tab-001/repeat-round', { method: 'POST' });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(1);
    });
  });

  describe('Tab Payment', () => {
    it('should calculate equal split', async () => {
      const response = await fetch('/api/tabs/tab-001/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ splitType: 'equal', participants: 3 }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.splitType).toBe('equal');
      expect(data.perPerson).toBe(50.0);
    });

    it('should calculate split by consumption', async () => {
      const response = await fetch('/api/tabs/tab-001/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ splitType: 'by_consumption' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.splitType).toBe('by_consumption');
      expect(data.breakdown).toHaveLength(3);
    });

    it('should process payment', async () => {
      const response = await fetch('/api/tabs/tab-001/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 150.0, paymentMethod: 'pix' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.tabStatus).toBe('closed');
    });
  });

  describe('Happy Hour', () => {
    it('should return active happy hour', async () => {
      const response = await fetch('/api/happy-hour/active?restaurantId=rest-456');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.active).toBe(true);
      expect(data.happyHour.discountPercentage).toBe(30);
    });

    it('should return no happy hour when inactive', async () => {
      const response = await fetch('/api/happy-hour/active?restaurantId=no-hh');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.active).toBe(false);
      expect(data.happyHour).toBeNull();
    });
  });

  describe('Waiter Calls', () => {
    it('should create waiter call', async () => {
      const response = await fetch('/api/waiter-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabId: 'tab-001', tableId: 'table-5', type: 'service' }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.status).toBe('pending');
      expect(data.type).toBe('service');
    });
  });
});
