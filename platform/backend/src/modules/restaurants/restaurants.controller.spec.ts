import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { FilterRestaurantDto } from './dto/filter-restaurant.dto';
import { UpdateServiceConfigDto } from './dto/update-service-config.dto';
import { UpdateSetupProgressDto } from './dto/update-setup-progress.dto';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('RestaurantsController', () => {
  let controller: RestaurantsController;
  let restaurantsService: RestaurantsService;

  const mockRestaurantsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    getServiceConfig: jest.fn(),
    updateServiceConfig: jest.fn(),
    getSetupProgress: jest.fn(),
    updateSetupProgress: jest.fn(),
  };

  const mockRestaurant = {
    id: 'restaurant-1',
    name: 'Test Restaurant',
    owner_id: 'user-1',
    is_active: true,
    cuisine_type: 'Italian',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantsController],
      providers: [{ provide: RestaurantsService, useValue: mockRestaurantsService }],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('@/common/guards/restaurant-owner.guard').RestaurantOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
    restaurantsService = module.get<RestaurantsService>(RestaurantsService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should get all restaurants with filters', async () => {
      const filters = {
        city: 'New York',
        serviceType: 'dine-in',
      } as FilterRestaurantDto;

      const restaurants = [mockRestaurant];
      mockRestaurantsService.findAll.mockResolvedValue(restaurants);

      const result = await controller.findAll(filters);

      expect(result).toEqual(restaurants);
      expect(mockRestaurantsService.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('findOne', () => {
    it('should get restaurant by id', async () => {
      mockRestaurantsService.findOne.mockResolvedValue(mockRestaurant);

      const result = await controller.findOne('restaurant-1');

      expect(result).toEqual(mockRestaurant);
      expect(mockRestaurantsService.findOne).toHaveBeenCalledWith('restaurant-1');
    });
  });

  describe('create', () => {
    it('should create a new restaurant', async () => {
      const user = mockAuthenticatedUser({ sub: 'user-1' });
      const createDto: CreateRestaurantDto = {
        name: 'New Restaurant',
        cuisine_type: 'Italian',
        address: '123 Main St',
      } as any;

      mockRestaurantsService.create.mockResolvedValue(mockRestaurant);

      const result = await controller.create(createDto, user);

      expect(result).toEqual(mockRestaurant);
      expect(mockRestaurantsService.create).toHaveBeenCalledWith(createDto, 'user-1');
    });
  });

  describe('update', () => {
    it('should update restaurant', async () => {
      const updateData: Partial<CreateRestaurantDto> = {
        name: 'Updated Restaurant',
      };

      const updatedRestaurant = { ...mockRestaurant, name: 'Updated Restaurant' };
      mockRestaurantsService.update.mockResolvedValue(updatedRestaurant);

      const result = await controller.update('restaurant-1', updateData);

      expect(result).toEqual(updatedRestaurant);
      expect(mockRestaurantsService.update).toHaveBeenCalledWith('restaurant-1', updateData);
    });
  });

  describe('remove', () => {
    it('should soft delete restaurant', async () => {
      const deleteResponse = { message: 'Restaurant deactivated successfully' };
      mockRestaurantsService.softDelete.mockResolvedValue(deleteResponse);

      const result = await controller.remove('restaurant-1');

      expect(result).toEqual(deleteResponse);
      expect(mockRestaurantsService.softDelete).toHaveBeenCalledWith('restaurant-1');
    });
  });

  describe('getServiceConfig', () => {
    it('should get restaurant service configuration', async () => {
      const serviceConfig = {
        dine_in_enabled: true,
        takeout_enabled: true,
        delivery_enabled: false,
      };

      mockRestaurantsService.getServiceConfig.mockResolvedValue(serviceConfig);

      const result = await controller.getServiceConfig('restaurant-1');

      expect(result).toEqual(serviceConfig);
      expect(mockRestaurantsService.getServiceConfig).toHaveBeenCalledWith('restaurant-1');
    });
  });

  describe('updateServiceConfig', () => {
    it('should update service configuration', async () => {
      const updateDto: UpdateServiceConfigDto = {
        dine_in_enabled: false,
      } as any;

      const updatedConfig = {
        dine_in_enabled: false,
        takeout_enabled: true,
      };

      mockRestaurantsService.updateServiceConfig.mockResolvedValue(updatedConfig);

      const result = await controller.updateServiceConfig('restaurant-1', updateDto);

      expect(result).toEqual(updatedConfig);
      expect(mockRestaurantsService.updateServiceConfig).toHaveBeenCalledWith(
        'restaurant-1',
        updateDto,
      );
    });
  });

  describe('getSetupProgress', () => {
    it('should get restaurant setup progress', async () => {
      const setupProgress = {
        basic_info: true,
        menu_items: true,
        tables: false,
        staff: false,
      };

      mockRestaurantsService.getSetupProgress.mockResolvedValue(setupProgress);

      const result = await controller.getSetupProgress('restaurant-1');

      expect(result).toEqual(setupProgress);
      expect(mockRestaurantsService.getSetupProgress).toHaveBeenCalledWith('restaurant-1');
    });
  });

  describe('updateSetupProgress', () => {
    it('should update setup progress', async () => {
      const updateDto: UpdateSetupProgressDto = {
        tables: true,
      } as any;

      const updatedProgress = {
        basic_info: true,
        menu_items: true,
        tables: true,
        staff: false,
      };

      mockRestaurantsService.updateSetupProgress.mockResolvedValue(updatedProgress);

      const result = await controller.updateSetupProgress('restaurant-1', updateDto);

      expect(result).toEqual(updatedProgress);
      expect(mockRestaurantsService.updateSetupProgress).toHaveBeenCalledWith(
        'restaurant-1',
        updateDto,
      );
    });
  });
});
