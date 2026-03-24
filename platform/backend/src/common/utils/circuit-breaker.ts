import { Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export interface CircuitBreakerOptions {
  /** Number of consecutive failures before the circuit opens (default: 5) */
  failureThreshold: number;
  /** Milliseconds to wait before transitioning from OPEN to HALF_OPEN (default: 30000) */
  resetTimeout: number;
  /** Maximum number of trial calls allowed in HALF_OPEN state (default: 1) */
  halfOpenMax: number;
  /** Human-readable name used in log messages */
  name: string;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  name: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  consecutiveFailures: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  openedAt: number | null;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeout: 30_000,
  halfOpenMax: 1,
  name: 'default',
};

export class CircuitBreaker {
  private readonly logger: Logger;
  private readonly options: CircuitBreakerOptions;

  private state: CircuitState = CircuitState.CLOSED;
  private consecutiveFailures = 0;
  private halfOpenCalls = 0;

  private totalCalls = 0;
  private successfulCalls = 0;
  private failedCalls = 0;

  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private openedAt: number | null = null;

  constructor(options: Partial<CircuitBreakerOptions> & { name: string }) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.logger = new Logger(`CircuitBreaker:${this.options.name}`);
  }

  /**
   * Execute a function through the circuit breaker.
   *
   * - CLOSED: calls pass through; failures are counted.
   * - OPEN: calls are rejected immediately (or the fallback is used).
   * - HALF_OPEN: a limited number of trial calls are allowed.
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => T | Promise<T>,
  ): Promise<T> {
    this.totalCalls++;

    // Attempt transition from OPEN -> HALF_OPEN if the timeout has elapsed
    if (this.state === CircuitState.OPEN) {
      if (this.shouldTransitionToHalfOpen()) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        // Circuit is still open — reject or fallback
        this.failedCalls++;
        if (fallback) {
          this.logger.warn(
            `Circuit "${this.options.name}" is OPEN — executing fallback`,
          );
          return fallback();
        }
        throw new CircuitBreakerOpenError(this.options.name);
      }
    }

    // HALF_OPEN: limit the number of trial calls
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.options.halfOpenMax) {
        this.failedCalls++;
        if (fallback) {
          this.logger.warn(
            `Circuit "${this.options.name}" HALF_OPEN limit reached — executing fallback`,
          );
          return fallback();
        }
        throw new CircuitBreakerOpenError(this.options.name);
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        this.logger.warn(
          `Circuit "${this.options.name}" call failed — executing fallback`,
        );
        return fallback();
      }
      throw error;
    }
  }

  /** Returns the current circuit state. */
  getState(): CircuitState {
    // If the timeout has elapsed while OPEN, return HALF_OPEN (lazy transition)
    if (
      this.state === CircuitState.OPEN &&
      this.shouldTransitionToHalfOpen()
    ) {
      return CircuitState.HALF_OPEN;
    }
    return this.state;
  }

  /** Returns a snapshot of circuit breaker statistics. */
  getStats(): CircuitBreakerStats {
    return {
      state: this.getState(),
      name: this.options.name,
      totalCalls: this.totalCalls,
      successfulCalls: this.successfulCalls,
      failedCalls: this.failedCalls,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      openedAt: this.openedAt,
    };
  }

  /** Manually reset the circuit breaker to CLOSED state. */
  reset(): void {
    this.logger.log(`Circuit "${this.options.name}" manually reset`);
    this.state = CircuitState.CLOSED;
    this.consecutiveFailures = 0;
    this.halfOpenCalls = 0;
    this.openedAt = null;
  }

  // ─── Private Helpers ──────────────────────────────────────

  private onSuccess(): void {
    this.successfulCalls++;
    this.lastSuccessTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.CLOSED);
    }

    // Reset consecutive failures on any success in CLOSED state as well
    this.consecutiveFailures = 0;
    this.halfOpenCalls = 0;
  }

  private onFailure(): void {
    this.failedCalls++;
    this.consecutiveFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Trial call failed — reopen the circuit
      this.transitionTo(CircuitState.OPEN);
      return;
    }

    if (
      this.state === CircuitState.CLOSED &&
      this.consecutiveFailures >= this.options.failureThreshold
    ) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  private shouldTransitionToHalfOpen(): boolean {
    if (this.openedAt === null) return false;
    return Date.now() - this.openedAt >= this.options.resetTimeout;
  }

  private transitionTo(newState: CircuitState): void {
    const previousState = this.state;
    this.state = newState;

    if (newState === CircuitState.OPEN) {
      this.openedAt = Date.now();
      this.halfOpenCalls = 0;
    }

    if (newState === CircuitState.CLOSED) {
      this.openedAt = null;
      this.consecutiveFailures = 0;
      this.halfOpenCalls = 0;
    }

    if (newState === CircuitState.HALF_OPEN) {
      this.halfOpenCalls = 0;
    }

    this.logger.warn(
      `Circuit "${this.options.name}" transitioned: ${previousState} -> ${newState}`,
    );
  }
}

/**
 * Thrown when a call is rejected because the circuit is open.
 */
export class CircuitBreakerOpenError extends Error {
  constructor(circuitName: string) {
    super(
      `Circuit breaker "${circuitName}" is open — call rejected`,
    );
    this.name = 'CircuitBreakerOpenError';
  }
}
