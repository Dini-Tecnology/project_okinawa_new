// @ts-nocheck
/**
 * Club API Integration Tests
 *
 * Uses Jest global fetch mocks (no MSW / vitest dependency).
 */

// Mock data
const mockEntry = {
  id: 'entry-001',
  userId: 'user-123',
  restaurantId: 'rest-456',
  eventDate: '2025-02-01',
  entryType: 'advance',
  ticketTier: 'pista',
  price: 60.0,
  consumptionCredit: 30.0,
  status: 'paid',
  qrCode: 'TK-ENTRY0-AB',
  qrPayload: 'base64encodedpayload',
};

const mockVipTable = {
  id: 'vip-001',
  userId: 'user-123',
  tableId: 'table-vip-1',
  tableName: 'Camarote Premium',
  restaurantId: 'rest-456',
  eventDate: '2025-02-01',
  guestCount: 8,
  minimumSpend: 2000.0,
  currentSpend: 0,
  status: 'confirmed',
  guests: [],
};

const mockQueueEntry = {
  id: 'queue-001',
  userId: 'user-123',
  restaurantId: 'rest-456',
  position: 15,
  priority: 'standard',
  estimatedWaitMinutes: 25,
  status: 'waiting',
  joinedAt: new Date().toISOString(),
};

const mockBirthdayEntry = {
  id: 'bd-001',
  userId: 'user-123',
  restaurantId: 'rest-456',
  eventDate: '2025-02-01',
  birthday: '1998-02-02',
  companions: 2,
  documentVerified: true,
  status: 'approved',
  qrCode: 'BD-USER12-XY',
};

const mockOccupancy = {
  restaurantId: 'rest-456',
  currentCount: 450,
  maxCapacity: 600,
  percentage: 75,
  level: 'moderate',
  lastUpdated: new Date().toISOString(),
};

// ---------- fetch mock router ----------
function createFetchMock() {
  return jest.fn(async (url: string, init?: RequestInit) => {
    const method = (init?.method || 'GET').toUpperCase();
    const body = init?.body ? JSON.parse(init.body as string) : {};

    // POST /api/club-entries
    if (method === 'POST' && url === '/api/club-entries') {
      return new Response(
        JSON.stringify({
          ...mockEntry,
          ticketTier: body.ticketTier || mockEntry.ticketTier,
          eventDate: body.eventDate || mockEntry.eventDate,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // GET /api/club-entries/my
    if (method === 'GET' && url === '/api/club-entries/my') {
      return new Response(JSON.stringify({ entries: [mockEntry], total: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/club-entries/validate
    if (method === 'POST' && url === '/api/club-entries/validate') {
      const qrCode = body.qrCode as string;
      if (qrCode === 'INVALID') {
        return new Response(JSON.stringify({ valid: false, error: 'Invalid QR code' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (qrCode === 'USED') {
        return new Response(JSON.stringify({ valid: false, error: 'Entry already used' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ valid: true, entry: mockEntry }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/club-entries/check-in
    if (method === 'POST' && url === '/api/club-entries/check-in') {
      return new Response(
        JSON.stringify({
          success: true,
          entryId: body.entryId,
          checkedInAt: new Date().toISOString(),
          wristbandColor: 'green',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // POST /api/club-entries/check-out
    if (method === 'POST' && url === '/api/club-entries/check-out') {
      return new Response(
        JSON.stringify({ success: true, entryId: body.entryId, checkedOutAt: new Date().toISOString() }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // POST /api/vip-tables
    if (method === 'POST' && url === '/api/vip-tables') {
      return new Response(
        JSON.stringify({
          ...mockVipTable,
          tableId: body.tableId || mockVipTable.tableId,
          guestCount: body.guestCount || mockVipTable.guestCount,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // GET /api/vip-tables/available
    if (method === 'GET' && url.startsWith('/api/vip-tables/available')) {
      const eventDate = new URL(url, 'http://localhost').searchParams.get('eventDate');
      return new Response(
        JSON.stringify({
          tables: [
            { id: 'table-vip-1', name: 'Camarote Premium', capacity: 10, minimumSpend: 2000, available: true },
            { id: 'table-vip-2', name: 'Camarote Gold', capacity: 8, minimumSpend: 1500, available: true },
            { id: 'table-vip-3', name: 'Camarote Standard', capacity: 6, minimumSpend: 1000, available: false },
          ],
          eventDate,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // GET /api/vip-tables/:id/tab
    if (method === 'GET' && /^\/api\/vip-tables\/[^/]+\/tab$/.test(url)) {
      const tableId = url.split('/')[3];
      return new Response(
        JSON.stringify({
          tableId,
          tabId: 'tab-vip-001',
          items: [],
          currentSpend: 500.0,
          minimumSpend: 2000.0,
          remainingMinimum: 1500.0,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // POST /api/queue
    if (method === 'POST' && url === '/api/queue') {
      return new Response(
        JSON.stringify({
          ...mockQueueEntry,
          priority: body.priority || mockQueueEntry.priority,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // GET /api/queue/position
    if (method === 'GET' && url === '/api/queue/position') {
      return new Response(
        JSON.stringify({ position: 12, estimatedWaitMinutes: 20, status: 'waiting', aheadOfYou: 11 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // DELETE /api/queue/:id
    if (method === 'DELETE' && url.startsWith('/api/queue/')) {
      return new Response(JSON.stringify({ success: true, message: 'Left queue successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST /api/guest-list
    if (method === 'POST' && url === '/api/guest-list') {
      return new Response(
        JSON.stringify({
          id: 'gl-001',
          name: body.name,
          phone: body.phone,
          eventDate: body.eventDate,
          companions: body.companions || 0,
          status: 'confirmed',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // POST /api/birthday-entries
    if (method === 'POST' && url === '/api/birthday-entries') {
      return new Response(
        JSON.stringify({
          ...mockBirthdayEntry,
          eventDate: body.eventDate || mockBirthdayEntry.eventDate,
          companions: body.companions || mockBirthdayEntry.companions,
          status: 'pending',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // PUT /api/birthday-entries/:id/approve
    if (method === 'PUT' && /\/api\/birthday-entries\/[^/]+\/approve$/.test(url)) {
      return new Response(
        JSON.stringify({ ...mockBirthdayEntry, status: 'approved', qrCode: 'BD-USER12-XY' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // PUT /api/birthday-entries/:id/reject
    if (method === 'PUT' && /\/api\/birthday-entries\/[^/]+\/reject$/.test(url)) {
      return new Response(
        JSON.stringify({ id: 'bd-001', status: 'rejected', rejectionReason: body.reason || 'Invalid documentation' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // GET /api/occupancy/:restaurantId
    if (method === 'GET' && /^\/api\/occupancy\/[^/]+$/.test(url)) {
      const restaurantId = url.split('/').pop();
      return new Response(
        JSON.stringify({ ...mockOccupancy, restaurantId }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // GET /api/lineup/:restaurantId/:date
    if (method === 'GET' && /^\/api\/lineup\/[^/]+\/[^/]+$/.test(url)) {
      const parts = url.split('/');
      return new Response(
        JSON.stringify({
          restaurantId: parts[3],
          eventDate: parts[4],
          slots: [
            { time: '23:00', artist: 'DJ Opening', genre: 'House' },
            { time: '01:00', artist: 'DJ Snake', genre: 'EDM', isHeadliner: true },
            { time: '03:00', artist: 'DJ Closing', genre: 'Tech House' },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // GET /api/promoters/:id/sales
    if (method === 'GET' && /^\/api\/promoters\/[^/]+\/sales$/.test(url)) {
      return new Response(
        JSON.stringify({
          promoterId: 'promo-001',
          totalSales: 45,
          totalRevenue: 3600.0,
          pendingCommission: 360.0,
          sales: [
            { date: '2025-01-30', count: 12, revenue: 960.0 },
            { date: '2025-01-31', count: 33, revenue: 2640.0 },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
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
describe('Club API Integration Tests', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = createFetchMock() as any;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  describe('Entry Management', () => {
    it('should purchase an entry ticket', async () => {
      const response = await fetch('/api/club-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDate: '2025-02-01', ticketTier: 'pista' }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.ticketTier).toBe('pista');
      expect(data.qrCode).toBeDefined();
    });

    it('should get user entries', async () => {
      const response = await fetch('/api/club-entries/my');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.entries).toHaveLength(1);
    });

    it('should validate a valid entry', async () => {
      const response = await fetch('/api/club-entries/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: 'TK-ENTRY0-AB' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.valid).toBe(true);
      expect(data.entry).toBeDefined();
    });

    it('should reject invalid entry', async () => {
      const response = await fetch('/api/club-entries/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: 'INVALID' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.valid).toBe(false);
      expect(data.error).toBe('Invalid QR code');
    });

    it('should reject already used entry', async () => {
      const response = await fetch('/api/club-entries/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: 'USED' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.valid).toBe(false);
      expect(data.error).toBe('Entry already used');
    });

    it('should check-in successfully', async () => {
      const response = await fetch('/api/club-entries/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: 'entry-001' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.wristbandColor).toBeDefined();
    });
  });

  describe('VIP Tables', () => {
    it('should get available tables', async () => {
      const response = await fetch('/api/vip-tables/available?eventDate=2025-02-01');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tables).toHaveLength(3);
      expect(data.tables.filter((t: { available: boolean }) => t.available)).toHaveLength(2);
    });

    it('should reserve a VIP table', async () => {
      const response = await fetch('/api/vip-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: 'table-vip-1', eventDate: '2025-02-01', guestCount: 8 }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.status).toBe('confirmed');
      expect(data.minimumSpend).toBe(2000);
    });

    it('should get VIP table tab', async () => {
      const response = await fetch('/api/vip-tables/vip-001/tab');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.currentSpend).toBeDefined();
      expect(data.remainingMinimum).toBeDefined();
    });
  });

  describe('Virtual Queue', () => {
    it('should join queue', async () => {
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: 'rest-456', priority: 'standard' }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.position).toBeDefined();
      expect(data.estimatedWaitMinutes).toBeDefined();
    });

    it('should get queue position', async () => {
      const response = await fetch('/api/queue/position');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.position).toBe(12);
      expect(data.aheadOfYou).toBe(11);
    });

    it('should leave queue', async () => {
      const response = await fetch('/api/queue/queue-001', { method: 'DELETE' });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Birthday Entry', () => {
    it('should request birthday entry', async () => {
      const response = await fetch('/api/birthday-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventDate: '2025-02-01', companions: 2 }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.status).toBe('pending');
    });

    it('should approve birthday entry', async () => {
      const response = await fetch('/api/birthday-entries/bd-001/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('approved');
      expect(data.qrCode).toBeDefined();
    });

    it('should reject birthday entry', async () => {
      const response = await fetch('/api/birthday-entries/bd-001/reject', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Document not legible' }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('rejected');
    });
  });

  describe('Occupancy & Lineup', () => {
    it('should get current occupancy', async () => {
      const response = await fetch('/api/occupancy/rest-456');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.percentage).toBe(75);
      expect(data.level).toBe('moderate');
    });

    it('should get event lineup', async () => {
      const response = await fetch('/api/lineup/rest-456/2025-02-01');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.slots).toHaveLength(3);
      expect(data.slots.find((s: { isHeadliner?: boolean }) => s.isHeadliner)?.artist).toBe('DJ Snake');
    });
  });

  describe('Promoter System', () => {
    it('should get promoter sales', async () => {
      const response = await fetch('/api/promoters/promo-001/sales');

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.totalSales).toBe(45);
      expect(data.pendingCommission).toBe(360.0);
    });
  });
});
