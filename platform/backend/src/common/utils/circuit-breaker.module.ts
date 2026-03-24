import { Global, Injectable, Module } from '@nestjs/common';
import {
  CircuitBreaker,
  CircuitBreakerOptions,
  CircuitBreakerStats,
} from './circuit-breaker';

@Injectable()
export class CircuitBreakerService {
  private readonly breakers = new Map<string, CircuitBreaker>();

  /**
   * Retrieve (or lazily create) a named circuit breaker.
   *
   * Subsequent calls with the same `name` return the same instance,
   * so circuits are shared across injected consumers.
   */
  getBreaker(
    name: string,
    options?: Partial<Omit<CircuitBreakerOptions, 'name'>>,
  ): CircuitBreaker {
    let breaker = this.breakers.get(name);
    if (!breaker) {
      breaker = new CircuitBreaker({ name, ...options });
      this.breakers.set(name, breaker);
    }
    return breaker;
  }

  /** List stats for every registered circuit breaker. */
  getAllStats(): CircuitBreakerStats[] {
    return Array.from(this.breakers.values()).map((b) => b.getStats());
  }

  /** Reset every registered circuit breaker to CLOSED. */
  resetAll(): void {
    this.breakers.forEach((b) => b.reset());
  }
}

@Global()
@Module({
  providers: [CircuitBreakerService],
  exports: [CircuitBreakerService],
})
export class CircuitBreakerModule {}
