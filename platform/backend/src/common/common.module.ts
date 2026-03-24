import { Global, Module } from '@nestjs/common';
import { TranslationService } from './services/translation.service';
import { EmailService } from './services/email.service';
import { CacheConfigModule, CacheService } from './cache';
import { TracingModule } from './tracing';
import { StructuredLoggerService, LoggingInterceptor } from './logging';
import { IdempotencyService } from './idempotency';
import { CircuitBreakerModule } from './utils/circuit-breaker.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module({
  imports: [
    CacheConfigModule,
    CircuitBreakerModule,
    TracingModule.forRoot({
      serviceName: 'okinawa-api',
      enabled: process.env.NODE_ENV === 'production',
      samplingRate: 0.1,
    }),
  ],
  providers: [
    TranslationService,
    EmailService,
    CacheService,
    StructuredLoggerService,
    IdempotencyService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [
    // Services
    TranslationService,
    EmailService,
    CacheService,
    StructuredLoggerService,
    IdempotencyService,
    // Modules
    CacheConfigModule,
    CircuitBreakerModule,
    TracingModule,
  ],
})
export class CommonModule {}
