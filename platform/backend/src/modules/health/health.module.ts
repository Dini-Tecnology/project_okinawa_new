import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { CircuitBreakerHealthIndicator } from './circuit-breaker.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [CircuitBreakerHealthIndicator],
})
export class HealthModule {}
