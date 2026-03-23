import { Test, TestingModule } from '@nestjs/testing';
import { ServiceConfigController } from '../service-config.controller';
import { ServiceConfigService } from '../service-config.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateServiceTypesDto } from '../dto/update-service-types.dto';
import { UpdateExperienceFlagsDto } from '../dto/update-experience-flags.dto';
import { UpdateFloorConfigDto } from '../dto/update-floor-config.dto';
import { UpdateKitchenConfigDto } from '../dto/update-kitchen-config.dto';
import { UpdatePaymentConfigDto } from '../dto/update-payment-config.dto';
import { UpdateFeaturesDto } from '../dto/update-features.dto';
import { UpdateTeamConfigDto } from '../dto/update-team-config.dto';
import { CreateConfigDto } from '../dto/create-config.dto';

describe('ServiceConfigController', () => {
  let controller: ServiceConfigController;
  let service: ServiceConfigService;

  const mockConfig = {
    id: 'config-1',
    restaurant_id: 'restaurant-1',
    profile: { name: 'Test Restaurant' },
    service_types: { primary: 'casual_dining', supported: ['casual_dining'] },
    experience_flags: { reservationsEnabled: true },
    floor_layout: { sections: [], tables: [] },
    kitchen_stations: { stations: [], routing: { kitchen: [], bar: [] } },
    payment_config: {
      enabledMethods: ['cash', 'credit_card', 'pix'],
      serviceFeePct: 10,
      tipOptions: [10, 12, 15],
      splitModes: ['equal', 'custom'],
    },
    enabled_features: { loyalty: true },
    team_config: { tipDistributionPolicy: 'equal' },
    setup_complete: false,
    setup_completed_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockServiceConfigService = {
    getConfig: jest.fn(),
    initialSetup: jest.fn(),
    updateProfile: jest.fn(),
    updateServiceTypes: jest.fn(),
    updateExperience: jest.fn(),
    updateFloor: jest.fn(),
    updateKitchen: jest.fn(),
    updatePayments: jest.fn(),
    updateFeatures: jest.fn(),
    updateTeam: jest.fn(),
    getSetupCompletion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceConfigController],
      providers: [
        { provide: ServiceConfigService, useValue: mockServiceConfigService },
      ],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ServiceConfigController>(ServiceConfigController);
    service = module.get<ServiceConfigService>(ServiceConfigService);

    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should return the restaurant configuration', async () => {
      mockServiceConfigService.getConfig.mockResolvedValue(mockConfig);

      const result = await controller.getConfig('restaurant-1');

      expect(result).toEqual(mockConfig);
      expect(mockServiceConfigService.getConfig).toHaveBeenCalledWith('restaurant-1');
    });
  });

  describe('updateProfile', () => {
    it('should update the restaurant profile', async () => {
      const dto: UpdateProfileDto = {
        name: 'Updated Restaurant',
        description: 'New description',
      };

      const updatedConfig = {
        ...mockConfig,
        profile: { name: 'Updated Restaurant', description: 'New description' },
      };

      mockServiceConfigService.updateProfile.mockResolvedValue(updatedConfig);

      const result = await controller.updateProfile('restaurant-1', dto);

      expect(result).toEqual(updatedConfig);
      expect(mockServiceConfigService.updateProfile).toHaveBeenCalledWith('restaurant-1', dto);
    });
  });

  describe('updateServiceTypes', () => {
    it('should update service types', async () => {
      const dto: UpdateServiceTypesDto = {
        primary: 'fine_dining',
        supported: ['fine_dining', 'casual_dining'],
      };

      const updatedConfig = {
        ...mockConfig,
        service_types: dto,
      };

      mockServiceConfigService.updateServiceTypes.mockResolvedValue(updatedConfig);

      const result = await controller.updateServiceTypes('restaurant-1', dto);

      expect(result).toEqual(updatedConfig);
      expect(mockServiceConfigService.updateServiceTypes).toHaveBeenCalledWith('restaurant-1', dto);
    });
  });

  describe('updateExperience', () => {
    it('should update experience flags (OWNER or MANAGER)', async () => {
      const dto: UpdateExperienceFlagsDto = {
        reservationsEnabled: true,
        virtualQueueEnabled: true,
      };

      const updatedConfig = {
        ...mockConfig,
        experience_flags: dto,
      };

      mockServiceConfigService.updateExperience.mockResolvedValue(updatedConfig);

      const result = await controller.updateExperience('restaurant-1', dto);

      expect(result).toEqual(updatedConfig);
      expect(mockServiceConfigService.updateExperience).toHaveBeenCalledWith('restaurant-1', dto);
    });
  });

  describe('updateFloor', () => {
    it('should update floor layout', async () => {
      const dto: UpdateFloorConfigDto = {
        sections: [{ id: 'section-1', name: 'Main Hall' }],
        tables: [{ id: 'table-1', tableNumber: '1', sectionId: 'section-1', seats: 4 }],
      };

      const updatedConfig = {
        ...mockConfig,
        floor_layout: { sections: dto.sections, tables: dto.tables },
      };

      mockServiceConfigService.updateFloor.mockResolvedValue(updatedConfig);

      const result = await controller.updateFloor('restaurant-1', dto);

      expect(result).toEqual(updatedConfig);
      expect(mockServiceConfigService.updateFloor).toHaveBeenCalledWith('restaurant-1', dto);
    });
  });

  describe('updateKitchen', () => {
    it('should update kitchen config (OWNER or MANAGER)', async () => {
      const dto: UpdateKitchenConfigDto = {
        stations: [{ id: 'st-1', name: 'grill', keywords: ['steak', 'burger'], displayName: 'Grill Station' }],
        routing: { kitchen: ['st-1'], bar: [] },
      };

      const updatedConfig = {
        ...mockConfig,
        kitchen_stations: { stations: dto.stations, routing: dto.routing },
      };

      mockServiceConfigService.updateKitchen.mockResolvedValue(updatedConfig);

      const result = await controller.updateKitchen('restaurant-1', dto);

      expect(result).toEqual(updatedConfig);
      expect(mockServiceConfigService.updateKitchen).toHaveBeenCalledWith('restaurant-1', dto);
    });
  });

  describe('updatePayments', () => {
    it('should update payment config', async () => {
      const dto: UpdatePaymentConfigDto = {
        enabledMethods: ['cash', 'pix'],
        serviceFeePct: 12,
      };

      const updatedConfig = {
        ...mockConfig,
        payment_config: { ...mockConfig.payment_config, ...dto },
      };

      mockServiceConfigService.updatePayments.mockResolvedValue(updatedConfig);

      const result = await controller.updatePayments('restaurant-1', dto);

      expect(result).toEqual(updatedConfig);
      expect(mockServiceConfigService.updatePayments).toHaveBeenCalledWith('restaurant-1', dto);
    });
  });

  describe('updateFeatures', () => {
    it('should update enabled features', async () => {
      const dto: UpdateFeaturesDto = {
        loyalty: true,
        analytics: true,
        pushNotifications: false,
      };

      const updatedConfig = {
        ...mockConfig,
        enabled_features: dto,
      };

      mockServiceConfigService.updateFeatures.mockResolvedValue(updatedConfig);

      const result = await controller.updateFeatures('restaurant-1', dto);

      expect(result).toEqual(updatedConfig);
      expect(mockServiceConfigService.updateFeatures).toHaveBeenCalledWith('restaurant-1', dto);
    });
  });

  describe('updateTeam', () => {
    it('should update team configuration', async () => {
      const dto: UpdateTeamConfigDto = {
        tipDistributionPolicy: 'weighted',
        roles: {
          waiter: { maxCount: 10, permissions: ['create_order'] },
        },
      };

      const updatedConfig = {
        ...mockConfig,
        team_config: dto,
      };

      mockServiceConfigService.updateTeam.mockResolvedValue(updatedConfig);

      const result = await controller.updateTeam('restaurant-1', dto);

      expect(result).toEqual(updatedConfig);
      expect(mockServiceConfigService.updateTeam).toHaveBeenCalledWith('restaurant-1', dto);
    });
  });

  describe('initialSetup', () => {
    it('should complete initial setup wizard', async () => {
      const dto: CreateConfigDto = {
        restaurantId: 'restaurant-1',
        profile: { name: 'My Restaurant' },
        serviceTypes: { primary: 'casual_dining', supported: ['casual_dining'] },
      };

      const setupConfig = {
        ...mockConfig,
        setup_complete: true,
        setup_completed_at: new Date(),
      };

      mockServiceConfigService.initialSetup.mockResolvedValue(setupConfig);

      const result = await controller.initialSetup(dto);

      expect(result).toEqual(setupConfig);
      expect(result.setup_complete).toBe(true);
      expect(mockServiceConfigService.initialSetup).toHaveBeenCalledWith(dto);
    });
  });

  describe('getSetupCompletion', () => {
    it('should return setup completion status', async () => {
      const completionData = {
        setupComplete: false,
        setupCompletedAt: null,
        completionPercentage: 37,
        sections: {
          profile: true,
          serviceTypes: true,
          experienceFlags: true,
          floorLayout: false,
          kitchenStations: false,
          paymentConfig: true,
          enabledFeatures: false,
          teamConfig: false,
        },
      };

      mockServiceConfigService.getSetupCompletion.mockResolvedValue(completionData);

      const result = await controller.getSetupCompletion('restaurant-1');

      expect(result).toEqual(completionData);
      expect(result.completionPercentage).toBe(37);
      expect(mockServiceConfigService.getSetupCompletion).toHaveBeenCalledWith('restaurant-1');
    });
  });
});
