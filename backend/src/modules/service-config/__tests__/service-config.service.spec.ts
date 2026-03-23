import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceConfigService } from '../service-config.service';
import { ServiceConfigGateway } from '../service-config.gateway';
import { RestaurantConfig } from '../entities/restaurant-config.entity';

describe('ServiceConfigService', () => {
  let service: ServiceConfigService;
  let configRepository: Repository<RestaurantConfig>;
  let gateway: ServiceConfigGateway;

  const mockConfig: Partial<RestaurantConfig> = {
    id: 'config-1',
    restaurant_id: 'restaurant-1',
    profile: { name: 'Test Restaurant' },
    service_types: { primary: 'casual_dining', supported: ['casual_dining'] },
    experience_flags: {},
    floor_layout: { sections: [], tables: [] },
    kitchen_stations: { stations: [], routing: { kitchen: [], bar: [] } },
    payment_config: {
      enabledMethods: ['cash', 'credit_card', 'debit_card', 'pix'],
      serviceFeePct: 10,
      tipOptions: [10, 12, 15],
      splitModes: ['equal', 'custom'],
    },
    enabled_features: {},
    team_config: {},
    setup_complete: false,
    setup_completed_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockConfigRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockGateway = {
    emitConfigUpdated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceConfigService,
        {
          provide: getRepositoryToken(RestaurantConfig),
          useValue: mockConfigRepository,
        },
        {
          provide: ServiceConfigGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<ServiceConfigService>(ServiceConfigService);
    configRepository = module.get(getRepositoryToken(RestaurantConfig));
    gateway = module.get<ServiceConfigGateway>(ServiceConfigGateway);

    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should return existing config', async () => {
      mockConfigRepository.findOne.mockResolvedValue(mockConfig);

      const result = await service.getConfig('restaurant-1');

      expect(result).toEqual(mockConfig);
      expect(mockConfigRepository.findOne).toHaveBeenCalledWith({
        where: { restaurant_id: 'restaurant-1' },
      });
    });

    it('should create default config if none exists', async () => {
      mockConfigRepository.findOne.mockResolvedValue(null);
      const defaultConfig = {
        ...mockConfig,
        profile: {},
        experience_flags: {},
        enabled_features: {},
        team_config: {},
      };
      mockConfigRepository.create.mockReturnValue(defaultConfig);
      mockConfigRepository.save.mockResolvedValue(defaultConfig);

      const result = await service.getConfig('restaurant-1');

      expect(result).toBeDefined();
      expect(mockConfigRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurant_id: 'restaurant-1',
          setup_complete: false,
        }),
      );
      expect(mockConfigRepository.save).toHaveBeenCalled();
    });
  });

  describe('initialSetup', () => {
    it('should create config with setup_complete = true', async () => {
      mockConfigRepository.findOne.mockResolvedValue(null);

      const newConfig = {
        ...mockConfig,
        setup_complete: true,
        setup_completed_at: expect.any(Date),
      };
      mockConfigRepository.create.mockReturnValue({ restaurant_id: 'restaurant-1' });
      mockConfigRepository.save.mockResolvedValue(newConfig);

      const result = await service.initialSetup({
        restaurantId: 'restaurant-1',
        profile: { name: 'My Restaurant' },
        serviceTypes: { primary: 'casual_dining', supported: ['casual_dining'] },
      });

      expect(result.setup_complete).toBe(true);
      expect(mockConfigRepository.save).toHaveBeenCalled();
      expect(mockGateway.emitConfigUpdated).toHaveBeenCalledWith('restaurant-1', 'setup');
    });

    it('should update existing config if one already exists', async () => {
      mockConfigRepository.findOne.mockResolvedValue({ ...mockConfig });
      mockConfigRepository.save.mockResolvedValue({
        ...mockConfig,
        profile: { name: 'Updated via Setup' },
        setup_complete: true,
      });

      const result = await service.initialSetup({
        restaurantId: 'restaurant-1',
        profile: { name: 'Updated via Setup' },
      });

      expect(result.setup_complete).toBe(true);
      expect(mockConfigRepository.create).not.toHaveBeenCalled();
      expect(mockGateway.emitConfigUpdated).toHaveBeenCalledWith('restaurant-1', 'setup');
    });
  });

  describe('updateProfile', () => {
    it('should update profile and emit WebSocket event', async () => {
      mockConfigRepository.findOne.mockResolvedValue({ ...mockConfig });
      const updatedConfig = {
        ...mockConfig,
        profile: { name: 'Updated Name', description: 'New desc' },
      };
      mockConfigRepository.save.mockResolvedValue(updatedConfig);

      const result = await service.updateProfile('restaurant-1', {
        name: 'Updated Name',
        description: 'New desc',
      });

      expect(result.profile.name).toBe('Updated Name');
      expect(mockGateway.emitConfigUpdated).toHaveBeenCalledWith('restaurant-1', 'profile');
    });
  });

  describe('updateServiceTypes', () => {
    it('should update service types and emit event', async () => {
      mockConfigRepository.findOne.mockResolvedValue({ ...mockConfig });
      const updatedConfig = {
        ...mockConfig,
        service_types: { primary: 'fine_dining', supported: ['fine_dining', 'casual_dining'] },
      };
      mockConfigRepository.save.mockResolvedValue(updatedConfig);

      const result = await service.updateServiceTypes('restaurant-1', {
        primary: 'fine_dining',
        supported: ['fine_dining', 'casual_dining'],
      });

      expect(result.service_types.primary).toBe('fine_dining');
      expect(mockGateway.emitConfigUpdated).toHaveBeenCalledWith('restaurant-1', 'service_types');
    });
  });

  describe('updateExperience', () => {
    it('should update experience flags and emit event', async () => {
      mockConfigRepository.findOne.mockResolvedValue({ ...mockConfig });
      const updatedConfig = {
        ...mockConfig,
        experience_flags: { reservationsEnabled: true, virtualQueueEnabled: true },
      };
      mockConfigRepository.save.mockResolvedValue(updatedConfig);

      const result = await service.updateExperience('restaurant-1', {
        reservationsEnabled: true,
        virtualQueueEnabled: true,
      });

      expect(result.experience_flags.reservationsEnabled).toBe(true);
      expect(mockGateway.emitConfigUpdated).toHaveBeenCalledWith('restaurant-1', 'experience_flags');
    });
  });

  describe('updateFloor', () => {
    it('should update floor layout and emit event', async () => {
      mockConfigRepository.findOne.mockResolvedValue({ ...mockConfig });
      const updatedConfig = {
        ...mockConfig,
        floor_layout: {
          sections: [{ id: 's1', name: 'Main' }],
          tables: [{ id: 't1', tableNumber: '1', sectionId: 's1', seats: 4 }],
        },
      };
      mockConfigRepository.save.mockResolvedValue(updatedConfig);

      const result = await service.updateFloor('restaurant-1', {
        sections: [{ id: 's1', name: 'Main' }],
        tables: [{ id: 't1', tableNumber: '1', sectionId: 's1', seats: 4 }],
      });

      expect(result.floor_layout.sections).toHaveLength(1);
      expect(mockGateway.emitConfigUpdated).toHaveBeenCalledWith('restaurant-1', 'floor_layout');
    });
  });

  describe('updateKitchen', () => {
    it('should update kitchen stations and emit event', async () => {
      mockConfigRepository.findOne.mockResolvedValue({ ...mockConfig });
      const updatedConfig = {
        ...mockConfig,
        kitchen_stations: {
          stations: [{ id: 'st1', name: 'grill', keywords: ['steak'], displayName: 'Grill' }],
          routing: { kitchen: ['st1'], bar: [] },
        },
      };
      mockConfigRepository.save.mockResolvedValue(updatedConfig);

      const result = await service.updateKitchen('restaurant-1', {
        stations: [{ id: 'st1', name: 'grill', keywords: ['steak'], displayName: 'Grill' }],
        routing: { kitchen: ['st1'], bar: [] },
      });

      expect(result.kitchen_stations.stations).toHaveLength(1);
      expect(mockGateway.emitConfigUpdated).toHaveBeenCalledWith('restaurant-1', 'kitchen_stations');
    });
  });

  describe('updatePayments', () => {
    it('should update payment config and emit event', async () => {
      mockConfigRepository.findOne.mockResolvedValue({ ...mockConfig });
      const updatedConfig = {
        ...mockConfig,
        payment_config: {
          ...mockConfig.payment_config,
          serviceFeePct: 12,
          enabledMethods: ['cash', 'pix'],
        },
      };
      mockConfigRepository.save.mockResolvedValue(updatedConfig);

      const result = await service.updatePayments('restaurant-1', {
        serviceFeePct: 12,
        enabledMethods: ['cash', 'pix'],
      });

      expect(result.payment_config.serviceFeePct).toBe(12);
      expect(mockGateway.emitConfigUpdated).toHaveBeenCalledWith('restaurant-1', 'payment_config');
    });
  });

  describe('updateFeatures', () => {
    it('should update features and emit event', async () => {
      mockConfigRepository.findOne.mockResolvedValue({ ...mockConfig });
      const updatedConfig = {
        ...mockConfig,
        enabled_features: { loyalty: true, analytics: true },
      };
      mockConfigRepository.save.mockResolvedValue(updatedConfig);

      const result = await service.updateFeatures('restaurant-1', {
        loyalty: true,
        analytics: true,
      });

      expect(result.enabled_features.loyalty).toBe(true);
      expect(mockGateway.emitConfigUpdated).toHaveBeenCalledWith('restaurant-1', 'enabled_features');
    });
  });

  describe('updateTeam', () => {
    it('should update team config and emit event', async () => {
      mockConfigRepository.findOne.mockResolvedValue({ ...mockConfig });
      const updatedConfig = {
        ...mockConfig,
        team_config: {
          tipDistributionPolicy: 'weighted',
          roles: { waiter: { maxCount: 10 } },
        },
      };
      mockConfigRepository.save.mockResolvedValue(updatedConfig);

      const result = await service.updateTeam('restaurant-1', {
        tipDistributionPolicy: 'weighted',
        roles: { waiter: { maxCount: 10 } },
      });

      expect(result.team_config.tipDistributionPolicy).toBe('weighted');
      expect(mockGateway.emitConfigUpdated).toHaveBeenCalledWith('restaurant-1', 'team_config');
    });
  });

  describe('getSetupCompletion', () => {
    it('should return completion percentage and section status', async () => {
      mockConfigRepository.findOne.mockResolvedValue({
        ...mockConfig,
        profile: { name: 'My Restaurant' },
        service_types: { primary: 'casual_dining', supported: ['casual_dining'] },
        experience_flags: { reservationsEnabled: true },
      });

      const result = await service.getSetupCompletion('restaurant-1');

      expect(result).toHaveProperty('setupComplete');
      expect(result).toHaveProperty('completionPercentage');
      expect(result).toHaveProperty('sections');
      expect(typeof result.completionPercentage).toBe('number');
      expect(result.completionPercentage).toBeGreaterThanOrEqual(0);
      expect(result.completionPercentage).toBeLessThanOrEqual(100);
    });

    it('should return 0% for empty config', async () => {
      mockConfigRepository.findOne.mockResolvedValue(null);
      const emptyConfig = {
        id: 'config-new',
        restaurant_id: 'restaurant-1',
        profile: {},
        service_types: { primary: 'casual_dining', supported: ['casual_dining'] },
        experience_flags: {},
        floor_layout: { sections: [], tables: [] },
        kitchen_stations: { stations: [], routing: { kitchen: [], bar: [] } },
        payment_config: {
          enabledMethods: ['cash', 'credit_card', 'debit_card', 'pix'],
          serviceFeePct: 10,
          tipOptions: [10, 12, 15],
          splitModes: ['equal', 'custom'],
        },
        enabled_features: {},
        team_config: {},
        setup_complete: false,
        setup_completed_at: null,
      };
      mockConfigRepository.create.mockReturnValue(emptyConfig);
      mockConfigRepository.save.mockResolvedValue(emptyConfig);

      const result = await service.getSetupCompletion('restaurant-1');

      // With default values, serviceTypes and paymentConfig should be considered complete
      expect(result.setupComplete).toBe(false);
      expect(result.sections.profile).toBe(false);
    });
  });
});
