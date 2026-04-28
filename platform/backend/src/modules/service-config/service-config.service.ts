import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantConfig, ConfigProfile } from './entities/restaurant-config.entity';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateServiceTypesDto } from './dto/update-service-types.dto';
import { UpdateExperienceFlagsDto } from './dto/update-experience-flags.dto';
import { UpdateFloorConfigDto } from './dto/update-floor-config.dto';
import { UpdateKitchenConfigDto } from './dto/update-kitchen-config.dto';
import { UpdatePaymentConfigDto } from './dto/update-payment-config.dto';
import { UpdateTeamConfigDto } from './dto/update-team-config.dto';
import { UpdateFeaturesDto } from './dto/update-features.dto';
import { ServiceConfigGateway } from './service-config.realtime';
import { ServiceTypeFeatures, getServiceTypeFeatures } from './service-type.registry';

@Injectable()
export class ServiceConfigService {
  private readonly logger = new Logger(ServiceConfigService.name);

  constructor(
    @InjectRepository(RestaurantConfig)
    private configRepository: Repository<RestaurantConfig>,
    private readonly gateway: ServiceConfigGateway,
  ) {}

  /**
   * Get config for a restaurant, creating a default one if it doesn't exist
   */
  async getConfig(restaurantId: string): Promise<RestaurantConfig> {
    let config = await this.configRepository.findOne({
      where: { restaurant_id: restaurantId },
    });

    if (!config) {
      this.logger.log(`Creating default config for restaurant ${restaurantId}`);
      config = this.configRepository.create({
        restaurant_id: restaurantId,
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
      });
      config = await this.configRepository.save(config);
    }

    return config;
  }

  /**
   * Initial setup wizard — creates a full config from scratch
   */
  async initialSetup(createConfigDto: CreateConfigDto): Promise<RestaurantConfig> {
    const { restaurantId } = createConfigDto;

    // Check if config already exists
    let config = await this.configRepository.findOne({
      where: { restaurant_id: restaurantId },
    });

    if (config) {
      this.logger.log(`Config already exists for restaurant ${restaurantId}, updating via setup`);
    } else {
      config = this.configRepository.create({
        restaurant_id: restaurantId,
      });
    }

    // Apply all provided fields
    if (createConfigDto.profile) {
      config.profile = createConfigDto.profile;
    }
    if (createConfigDto.serviceTypes) {
      config.service_types = createConfigDto.serviceTypes;
    }
    if (createConfigDto.experienceFlags) {
      config.experience_flags = createConfigDto.experienceFlags;
    }
    if (createConfigDto.floorLayout) {
      config.floor_layout = createConfigDto.floorLayout as unknown as RestaurantConfig['floor_layout'];
    }
    if (createConfigDto.kitchenStations) {
      config.kitchen_stations = createConfigDto.kitchenStations as unknown as RestaurantConfig['kitchen_stations'];
    }
    if (createConfigDto.paymentConfig) {
      config.payment_config = {
        enabledMethods: createConfigDto.paymentConfig.enabledMethods || ['cash', 'credit_card', 'debit_card', 'pix'],
        serviceFeePct: createConfigDto.paymentConfig.serviceFeePct ?? 10,
        tipOptions: createConfigDto.paymentConfig.tipOptions || [10, 12, 15],
        splitModes: createConfigDto.paymentConfig.splitModes || ['equal', 'custom'],
      };
    }
    if (createConfigDto.enabledFeatures) {
      config.enabled_features = createConfigDto.enabledFeatures;
    }
    if (createConfigDto.teamConfig) {
      config.team_config = createConfigDto.teamConfig as unknown as RestaurantConfig['team_config'];
    }

    config.setup_complete = true;
    config.setup_completed_at = new Date();

    const saved = await this.configRepository.save(config);

    this.logger.log(`Initial setup completed for restaurant ${restaurantId}`);
    this.gateway.emitConfigUpdated(restaurantId, 'setup');

    return saved;
  }

  /**
   * Update profile section
   */
  async updateProfile(restaurantId: string, dto: UpdateProfileDto): Promise<RestaurantConfig> {
    const config = await this.getConfig(restaurantId);
    config.profile = { ...config.profile, ...dto } as ConfigProfile;

    const saved = await this.configRepository.save(config);
    this.gateway.emitConfigUpdated(restaurantId, 'profile');
    this.logger.log(`Profile updated for restaurant ${restaurantId}`);

    return saved;
  }

  /**
   * Update service types
   */
  async updateServiceTypes(restaurantId: string, dto: UpdateServiceTypesDto): Promise<RestaurantConfig> {
    const config = await this.getConfig(restaurantId);
    config.service_types = dto;

    const saved = await this.configRepository.save(config);
    this.gateway.emitConfigUpdated(restaurantId, 'service_types');
    this.logger.log(`Service types updated for restaurant ${restaurantId}`);

    return saved;
  }

  /**
   * Update experience flags
   */
  async updateExperience(restaurantId: string, dto: UpdateExperienceFlagsDto): Promise<RestaurantConfig> {
    const config = await this.getConfig(restaurantId);
    config.experience_flags = { ...config.experience_flags, ...dto };

    const saved = await this.configRepository.save(config);
    this.gateway.emitConfigUpdated(restaurantId, 'experience_flags');
    this.logger.log(`Experience flags updated for restaurant ${restaurantId}`);

    return saved;
  }

  /**
   * Update floor layout
   */
  async updateFloor(restaurantId: string, dto: UpdateFloorConfigDto): Promise<RestaurantConfig> {
    const config = await this.getConfig(restaurantId);

    if (dto.sections !== undefined) {
      config.floor_layout = { ...config.floor_layout, sections: dto.sections as unknown as RestaurantConfig['floor_layout']['sections'] };
    }
    if (dto.tables !== undefined) {
      config.floor_layout = { ...config.floor_layout, tables: dto.tables as unknown as RestaurantConfig['floor_layout']['tables'] };
    }

    const saved = await this.configRepository.save(config);
    this.gateway.emitConfigUpdated(restaurantId, 'floor_layout');
    this.logger.log(`Floor layout updated for restaurant ${restaurantId}`);

    return saved;
  }

  /**
   * Update kitchen stations configuration
   */
  async updateKitchen(restaurantId: string, dto: UpdateKitchenConfigDto): Promise<RestaurantConfig> {
    const config = await this.getConfig(restaurantId);

    if (dto.stations !== undefined) {
      config.kitchen_stations = { ...config.kitchen_stations, stations: dto.stations as unknown as RestaurantConfig['kitchen_stations']['stations'] };
    }
    if (dto.routing !== undefined) {
      config.kitchen_stations = {
        ...config.kitchen_stations,
        routing: {
          kitchen: dto.routing.kitchen || config.kitchen_stations?.routing?.kitchen || [],
          bar: dto.routing.bar || config.kitchen_stations?.routing?.bar || [],
        },
      };
    }

    const saved = await this.configRepository.save(config);
    this.gateway.emitConfigUpdated(restaurantId, 'kitchen_stations');
    this.logger.log(`Kitchen config updated for restaurant ${restaurantId}`);

    return saved;
  }

  /**
   * Update payment configuration
   */
  async updatePayments(restaurantId: string, dto: UpdatePaymentConfigDto): Promise<RestaurantConfig> {
    const config = await this.getConfig(restaurantId);
    config.payment_config = { ...config.payment_config, ...dto };

    const saved = await this.configRepository.save(config);
    this.gateway.emitConfigUpdated(restaurantId, 'payment_config');
    this.logger.log(`Payment config updated for restaurant ${restaurantId}`);

    return saved;
  }

  /**
   * Update enabled features
   */
  async updateFeatures(restaurantId: string, dto: UpdateFeaturesDto): Promise<RestaurantConfig> {
    const config = await this.getConfig(restaurantId);
    config.enabled_features = { ...config.enabled_features, ...dto };

    const saved = await this.configRepository.save(config);
    this.gateway.emitConfigUpdated(restaurantId, 'enabled_features');
    this.logger.log(`Features updated for restaurant ${restaurantId}`);

    return saved;
  }

  /**
   * Update team configuration
   */
  async updateTeam(restaurantId: string, dto: UpdateTeamConfigDto): Promise<RestaurantConfig> {
    const config = await this.getConfig(restaurantId);

    if (dto.tipDistributionPolicy !== undefined) {
      config.team_config = { ...config.team_config, tipDistributionPolicy: dto.tipDistributionPolicy };
    }
    if (dto.roles !== undefined) {
      config.team_config = { ...config.team_config, roles: dto.roles };
    }

    const saved = await this.configRepository.save(config);
    this.gateway.emitConfigUpdated(restaurantId, 'team_config');
    this.logger.log(`Team config updated for restaurant ${restaurantId}`);

    return saved;
  }

  /**
   * Get setup completion percentage and status
   */
  async getSetupCompletion(restaurantId: string): Promise<{
    setupComplete: boolean;
    setupCompletedAt: Date | null;
    completionPercentage: number;
    sections: Record<string, boolean>;
  }> {
    const config = await this.getConfig(restaurantId);

    const sections = {
      profile: this.isSectionComplete(config.profile),
      serviceTypes: !!(config.service_types?.primary && config.service_types?.supported?.length > 0),
      experienceFlags: Object.keys(config.experience_flags || {}).length > 0,
      floorLayout: (config.floor_layout?.sections?.length || 0) > 0 || (config.floor_layout?.tables?.length || 0) > 0,
      kitchenStations: (config.kitchen_stations?.stations?.length || 0) > 0,
      paymentConfig: (config.payment_config?.enabledMethods?.length || 0) > 0,
      enabledFeatures: Object.keys(config.enabled_features || {}).length > 0,
      teamConfig: Object.keys(config.team_config || {}).length > 0,
    };

    const totalSections = Object.keys(sections).length;
    const completedSections = Object.values(sections).filter(Boolean).length;
    const completionPercentage = Math.round((completedSections / totalSections) * 100);

    return {
      setupComplete: config.setup_complete,
      setupCompletedAt: config.setup_completed_at || null,
      completionPercentage,
      sections,
    };
  }

  /**
   * Get the service type features derived from the restaurant's primary service type.
   * Uses the SERVICE_TYPE_REGISTRY to look up which features are enabled.
   */
  async getServiceFeatures(restaurantId: string): Promise<{
    serviceType: string;
    features: ServiceTypeFeatures;
  }> {
    const config = await this.getConfig(restaurantId);
    const primaryType = config.service_types?.primary || 'casual-dining';

    // Normalize underscores to hyphens for registry lookup
    const normalizedType = primaryType.replace(/_/g, '-');
    const features = getServiceTypeFeatures(normalizedType);

    return {
      serviceType: normalizedType,
      features,
    };
  }

  /**
   * Check if profile section has minimum required data
   */
  private isSectionComplete(profile: any | null | undefined): boolean {
    if (!profile) return false;
    return !!(profile.name && String(profile.name).length > 0);
  }
}
