import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { CircuitBreakerHealthIndicator } from './circuit-breaker.health';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let dbIndicator: jest.Mocked<TypeOrmHealthIndicator>;
  let memoryIndicator: jest.Mocked<MemoryHealthIndicator>;
  let diskIndicator: jest.Mocked<DiskHealthIndicator>;
  let circuitBreakerHealthIndicator: jest.Mocked<CircuitBreakerHealthIndicator>;

  const mockHealthResult: HealthCheckResult = {
    status: 'ok',
    info: {
      database: { status: 'up' },
      memory_heap: { status: 'up' },
      memory_rss: { status: 'up' },
      disk: { status: 'up' },
    },
    error: {},
    details: {
      database: { status: 'up' },
      memory_heap: { status: 'up' },
      memory_rss: { status: 'up' },
      disk: { status: 'up' },
    },
  };

  beforeEach(async () => {
    const mockHealthCheckService = {
      check: jest.fn(),
    };

    const mockDbIndicator = {
      pingCheck: jest.fn(),
    };

    const mockMemoryIndicator = {
      checkHeap: jest.fn(),
      checkRSS: jest.fn(),
    };

    const mockDiskIndicator = {
      checkStorage: jest.fn(),
    };

    const mockCircuitBreakerHealthIndicator = {
      check: jest.fn().mockResolvedValue({
        circuit_breakers: { status: 'up', circuits: 'none registered' },
      }),
      getStatus: jest.fn(),
      isHealthy: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: mockDbIndicator },
        { provide: MemoryHealthIndicator, useValue: mockMemoryIndicator },
        { provide: DiskHealthIndicator, useValue: mockDiskIndicator },
        { provide: CircuitBreakerHealthIndicator, useValue: mockCircuitBreakerHealthIndicator },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get(HealthCheckService);
    dbIndicator = module.get(TypeOrmHealthIndicator);
    memoryIndicator = module.get(MemoryHealthIndicator);
    diskIndicator = module.get(DiskHealthIndicator);
    circuitBreakerHealthIndicator = module.get(CircuitBreakerHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return healthy status when all checks pass', async () => {
      healthCheckService.check.mockResolvedValue(mockHealthResult);

      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should return unhealthy status when database is down', async () => {
      const unhealthyResult: HealthCheckResult = {
        status: 'error',
        info: {},
        error: {
          database: { status: 'down', message: 'Connection refused' },
        },
        details: {
          database: { status: 'down', message: 'Connection refused' },
        },
      };

      healthCheckService.check.mockResolvedValue(unhealthyResult);

      const result = await controller.check();

      expect(result.status).toBe('error');
    });
  });

  describe('liveness', () => {
    it('should return ok status with timestamp', async () => {
      const result = await controller.liveness();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    });
  });

  describe('readiness', () => {
    it('should return healthy when database is ready', async () => {
      const readyResult: HealthCheckResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };

      healthCheckService.check.mockResolvedValue(readyResult);

      const result = await controller.readiness();

      expect(result.status).toBe('ok');
    });

    it('should return error when database is not ready', async () => {
      const notReadyResult: HealthCheckResult = {
        status: 'error',
        info: {},
        error: { database: { status: 'down' } },
        details: { database: { status: 'down' } },
      };

      healthCheckService.check.mockResolvedValue(notReadyResult);

      const result = await controller.readiness();

      expect(result.status).toBe('error');
    });
  });
});
