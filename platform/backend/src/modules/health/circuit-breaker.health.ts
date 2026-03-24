import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { CircuitBreakerService } from '@common/utils/circuit-breaker.module';
import { CircuitState } from '@common/utils/circuit-breaker';

@Injectable()
export class CircuitBreakerHealthIndicator extends HealthIndicator {
  constructor(
    private readonly circuitBreakerService: CircuitBreakerService,
  ) {
    super();
  }

  /**
   * Reports each registered circuit breaker's state to the health check.
   *
   * - All circuits CLOSED          -> status "up"
   * - Any circuit HALF_OPEN        -> status "up" (degraded, but functional)
   * - Any circuit OPEN             -> status "down" with details
   */
  async check(key: string): Promise<HealthIndicatorResult> {
    const allStats = this.circuitBreakerService.getAllStats();

    if (allStats.length === 0) {
      return this.getStatus(key, true, { circuits: 'none registered' });
    }

    const circuits: Record<string, { state: string; failures: number }> = {};
    let hasOpenCircuit = false;

    for (const stats of allStats) {
      circuits[stats.name] = {
        state: stats.state,
        failures: stats.consecutiveFailures,
      };

      if (stats.state === CircuitState.OPEN) {
        hasOpenCircuit = true;
      }
    }

    const result = this.getStatus(key, !hasOpenCircuit, { circuits });

    if (hasOpenCircuit) {
      throw new HealthCheckError(
        'Circuit breaker check failed — one or more circuits are open',
        result,
      );
    }

    return result;
  }
}
