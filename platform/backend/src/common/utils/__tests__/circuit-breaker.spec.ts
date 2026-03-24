import {
  CircuitBreaker,
  CircuitState,
  CircuitBreakerOpenError,
} from '../circuit-breaker';

/** Helper that creates a breaker with sensible test defaults. */
function createBreaker(
  overrides: Partial<{
    failureThreshold: number;
    resetTimeout: number;
    halfOpenMax: number;
    name: string;
  }> = {},
) {
  return new CircuitBreaker({
    name: 'test',
    failureThreshold: 3,
    resetTimeout: 200, // short timeout for fast tests
    halfOpenMax: 1,
    ...overrides,
  });
}

const succeed = () => Promise.resolve('ok');
const fail = () => Promise.reject(new Error('boom'));

describe('CircuitBreaker', () => {
  // ─── CLOSED state ──────────────────────────────────────

  describe('CLOSED state', () => {
    it('should start in CLOSED state', () => {
      const cb = createBreaker();
      expect(cb.getState()).toBe(CircuitState.CLOSED);
    });

    it('should pass calls through when closed', async () => {
      const cb = createBreaker();
      const result = await cb.execute(succeed);
      expect(result).toBe('ok');
    });

    it('should tolerate failures below threshold', async () => {
      const cb = createBreaker({ failureThreshold: 3 });

      // 2 failures — should stay CLOSED
      await expect(cb.execute(fail)).rejects.toThrow('boom');
      await expect(cb.execute(fail)).rejects.toThrow('boom');

      expect(cb.getState()).toBe(CircuitState.CLOSED);
    });

    it('should count consecutive failures correctly', async () => {
      const cb = createBreaker({ failureThreshold: 3 });

      await expect(cb.execute(fail)).rejects.toThrow();
      await expect(cb.execute(fail)).rejects.toThrow();

      const stats = cb.getStats();
      expect(stats.consecutiveFailures).toBe(2);
      expect(stats.failedCalls).toBe(2);
    });

    it('should reset consecutive failures on success', async () => {
      const cb = createBreaker({ failureThreshold: 3 });

      await expect(cb.execute(fail)).rejects.toThrow();
      await expect(cb.execute(fail)).rejects.toThrow();
      await cb.execute(succeed);

      expect(cb.getStats().consecutiveFailures).toBe(0);
      expect(cb.getState()).toBe(CircuitState.CLOSED);
    });
  });

  // ─── Transition to OPEN ────────────────────────────────

  describe('CLOSED -> OPEN transition', () => {
    it('should open after failureThreshold consecutive failures', async () => {
      const cb = createBreaker({ failureThreshold: 3 });

      await expect(cb.execute(fail)).rejects.toThrow();
      await expect(cb.execute(fail)).rejects.toThrow();
      await expect(cb.execute(fail)).rejects.toThrow();

      expect(cb.getState()).toBe(CircuitState.OPEN);
    });

    it('should record the openedAt timestamp', async () => {
      const cb = createBreaker({ failureThreshold: 1 });
      await expect(cb.execute(fail)).rejects.toThrow();

      const stats = cb.getStats();
      expect(stats.openedAt).toBeDefined();
      expect(stats.openedAt).not.toBeNull();
    });
  });

  // ─── OPEN state ────────────────────────────────────────

  describe('OPEN state', () => {
    it('should reject calls immediately when open (no fallback)', async () => {
      const cb = createBreaker({ failureThreshold: 1, resetTimeout: 10_000 });
      await expect(cb.execute(fail)).rejects.toThrow('boom');

      // Now open — next call should be rejected with CircuitBreakerOpenError
      await expect(cb.execute(succeed)).rejects.toThrow(CircuitBreakerOpenError);
    });

    it('should execute fallback when open', async () => {
      const cb = createBreaker({ failureThreshold: 1, resetTimeout: 10_000 });
      await expect(cb.execute(fail)).rejects.toThrow();

      const result = await cb.execute(succeed, () => 'fallback-value');
      expect(result).toBe('fallback-value');
    });

    it('should not call the primary function when open', async () => {
      const cb = createBreaker({ failureThreshold: 1, resetTimeout: 10_000 });
      await expect(cb.execute(fail)).rejects.toThrow();

      const primary = jest.fn().mockResolvedValue('should-not-run');
      await cb.execute(primary, () => 'fallback');

      expect(primary).not.toHaveBeenCalled();
    });
  });

  // ─── HALF_OPEN state ───────────────────────────────────

  describe('OPEN -> HALF_OPEN transition', () => {
    it('should transition to HALF_OPEN after resetTimeout', async () => {
      const cb = createBreaker({ failureThreshold: 1, resetTimeout: 50 });
      await expect(cb.execute(fail)).rejects.toThrow();
      expect(cb.getState()).toBe(CircuitState.OPEN);

      // Wait for the reset timeout
      await new Promise((r) => setTimeout(r, 80));

      // getState() performs lazy transition
      expect(cb.getState()).toBe(CircuitState.HALF_OPEN);
    });

    it('should allow one trial call in HALF_OPEN', async () => {
      const cb = createBreaker({
        failureThreshold: 1,
        resetTimeout: 50,
        halfOpenMax: 1,
      });
      await expect(cb.execute(fail)).rejects.toThrow();
      await new Promise((r) => setTimeout(r, 80));

      // This call should go through (trial call)
      const result = await cb.execute(succeed);
      expect(result).toBe('ok');
    });

    it('should reject excess calls beyond halfOpenMax', async () => {
      const cb = createBreaker({
        failureThreshold: 1,
        resetTimeout: 50,
        halfOpenMax: 1,
      });
      await expect(cb.execute(fail)).rejects.toThrow();
      await new Promise((r) => setTimeout(r, 80));

      // First HALF_OPEN call is a slow promise so we can test the second
      const slow = () =>
        new Promise<string>((resolve) => setTimeout(() => resolve('slow'), 200));

      // Fire the first call (takes the single half-open slot)
      const p1 = cb.execute(slow);

      // Second call should be rejected (halfOpenMax = 1)
      await expect(cb.execute(succeed)).rejects.toThrow(CircuitBreakerOpenError);

      await p1; // clean up
    });
  });

  // ─── Recovery ──────────────────────────────────────────

  describe('HALF_OPEN -> CLOSED (recovery)', () => {
    it('should close circuit on successful trial call', async () => {
      const cb = createBreaker({ failureThreshold: 1, resetTimeout: 50 });
      await expect(cb.execute(fail)).rejects.toThrow();
      await new Promise((r) => setTimeout(r, 80));

      await cb.execute(succeed);
      expect(cb.getState()).toBe(CircuitState.CLOSED);
      expect(cb.getStats().consecutiveFailures).toBe(0);
    });
  });

  describe('HALF_OPEN -> OPEN (re-open)', () => {
    it('should re-open circuit on failed trial call', async () => {
      const cb = createBreaker({ failureThreshold: 1, resetTimeout: 50 });
      await expect(cb.execute(fail)).rejects.toThrow();
      await new Promise((r) => setTimeout(r, 80));

      await expect(cb.execute(fail)).rejects.toThrow();
      expect(cb.getState()).toBe(CircuitState.OPEN);
    });
  });

  // ─── Fallback execution ────────────────────────────────

  describe('fallback execution', () => {
    it('should run fallback on failure when circuit is closed', async () => {
      const cb = createBreaker({ failureThreshold: 5 });
      const result = await cb.execute(fail, () => 'safe');
      expect(result).toBe('safe');
    });

    it('should run async fallback', async () => {
      const cb = createBreaker({ failureThreshold: 5 });
      const result = await cb.execute(fail, async () => 'async-safe');
      expect(result).toBe('async-safe');
    });

    it('should run fallback when circuit is open', async () => {
      const cb = createBreaker({ failureThreshold: 1, resetTimeout: 10_000 });
      await cb.execute(fail, () => 'ignored');

      const result = await cb.execute(succeed, () => 'open-fallback');
      expect(result).toBe('open-fallback');
    });
  });

  // ─── Stats tracking ───────────────────────────────────

  describe('stats tracking', () => {
    it('should track total, successful, and failed calls', async () => {
      const cb = createBreaker({ failureThreshold: 10 });

      await cb.execute(succeed);
      await cb.execute(succeed);
      await expect(cb.execute(fail)).rejects.toThrow();

      const stats = cb.getStats();
      expect(stats.totalCalls).toBe(3);
      expect(stats.successfulCalls).toBe(2);
      expect(stats.failedCalls).toBe(1);
    });

    it('should track lastSuccessTime and lastFailureTime', async () => {
      const cb = createBreaker({ failureThreshold: 10 });
      const before = Date.now();

      await cb.execute(succeed);
      const statsAfterSuccess = cb.getStats();
      expect(statsAfterSuccess.lastSuccessTime).toBeGreaterThanOrEqual(before);
      expect(statsAfterSuccess.lastFailureTime).toBeNull();

      await expect(cb.execute(fail)).rejects.toThrow();
      const statsAfterFailure = cb.getStats();
      expect(statsAfterFailure.lastFailureTime).toBeGreaterThanOrEqual(before);
    });

    it('should include the circuit name', () => {
      const cb = createBreaker({ name: 'my-service' });
      expect(cb.getStats().name).toBe('my-service');
    });

    it('should count failed calls caused by open circuit', async () => {
      const cb = createBreaker({ failureThreshold: 1, resetTimeout: 10_000 });
      await expect(cb.execute(fail)).rejects.toThrow(); // triggers open

      // This call is rejected by the open circuit
      await expect(cb.execute(succeed)).rejects.toThrow(CircuitBreakerOpenError);

      const stats = cb.getStats();
      // 2 total, 0 successful, 2 failed
      expect(stats.totalCalls).toBe(2);
      expect(stats.successfulCalls).toBe(0);
      expect(stats.failedCalls).toBe(2);
    });
  });

  // ─── Manual reset ──────────────────────────────────────

  describe('reset()', () => {
    it('should reset circuit to CLOSED', async () => {
      const cb = createBreaker({ failureThreshold: 1, resetTimeout: 10_000 });
      await expect(cb.execute(fail)).rejects.toThrow();
      expect(cb.getState()).toBe(CircuitState.OPEN);

      cb.reset();
      expect(cb.getState()).toBe(CircuitState.CLOSED);
      expect(cb.getStats().consecutiveFailures).toBe(0);
    });

    it('should allow calls to pass through after reset', async () => {
      const cb = createBreaker({ failureThreshold: 1, resetTimeout: 10_000 });
      await expect(cb.execute(fail)).rejects.toThrow();

      cb.reset();
      const result = await cb.execute(succeed);
      expect(result).toBe('ok');
    });
  });

  // ─── CircuitBreakerOpenError ───────────────────────────

  describe('CircuitBreakerOpenError', () => {
    it('should have the correct name and message', () => {
      const err = new CircuitBreakerOpenError('my-breaker');
      expect(err.name).toBe('CircuitBreakerOpenError');
      expect(err.message).toContain('my-breaker');
      expect(err.message).toContain('open');
    });

    it('should be an instance of Error', () => {
      const err = new CircuitBreakerOpenError('test');
      expect(err).toBeInstanceOf(Error);
    });
  });
});
