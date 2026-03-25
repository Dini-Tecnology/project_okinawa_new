import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './entities/restaurant.entity';
import { FilterRestaurantDto } from './dto/filter-restaurant.dto';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { NotFoundException } from '@nestjs/common';
import { UserRole as UserRoleEnum } from '@/common/enums';

describe('RestaurantsService', () => {
  let service: RestaurantsService;
  let restaurantRepository: Repository<Restaurant>;
  let userRoleRepository: Repository<UserRole>;

  const mockRestaurant = {
    id: 'restaurant-1',
    name: 'Test Restaurant',
    city: 'New York',
    is_active: true,
    service_types: ['dine_in'],
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  const mockRestaurantRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockUserRoleRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRestaurantRepository,
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRoleRepository,
        },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
    restaurantRepository = module.get(getRepositoryToken(Restaurant));
    userRoleRepository = module.get(getRepositoryToken(UserRole));

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all active restaurants', async () => {
      const filters = {} as FilterRestaurantDto;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockRestaurant], 1]);

      const result = await service.findAll(filters);

      expect(result.items).toEqual([mockRestaurant]);
      expect(result.meta.total).toBe(1);
      expect(mockRestaurantRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter by city', async () => {
      const filters = { city: 'New York' } as FilterRestaurantDto;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockRestaurant], 1]);

      const result = await service.findAll(filters);

      expect(result.items).toEqual([mockRestaurant]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter by service type', async () => {
      const filters = { serviceType: 'dine_in' } as FilterRestaurantDto;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockRestaurant], 1]);

      const result = await service.findAll(filters);

      expect(result.items).toEqual([mockRestaurant]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter by location radius', async () => {
      const filters = {
        latitude: 40.7128,
        longitude: -74.006,
        radius: 5,
      } as FilterRestaurantDto;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockRestaurant], 1]);

      const result = await service.findAll(filters);

      expect(result.items).toEqual([mockRestaurant]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a restaurant by id', async () => {
      mockRestaurantRepository.findOne.mockResolvedValue(mockRestaurant);

      const result = await service.findOne('restaurant-1');

      expect(result).toEqual(mockRestaurant);
      expect(mockRestaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'restaurant-1' },
        relations: ['service_configs'],
      });
    });

    it('should throw NotFoundException if restaurant not found', async () => {
      mockRestaurantRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a restaurant and assign owner role', async () => {
      const createDto = {
        name: 'New Restaurant',
        city: 'New York',
        state: 'NY',
        address: '123 Main St',
        zip_code: '10001',
      };

      mockRestaurantRepository.create.mockReturnValue(mockRestaurant);
      mockRestaurantRepository.save.mockResolvedValue(mockRestaurant);
      mockUserRoleRepository.create.mockReturnValue({
        user_id: 'user-1',
        restaurant_id: 'restaurant-1',
        role: UserRoleEnum.OWNER,
      });
      mockUserRoleRepository.save.mockResolvedValue({});

      const result = await service.create(createDto, 'user-1');

      expect(result).toEqual(mockRestaurant);
      expect(mockRestaurantRepository.create).toHaveBeenCalled();
      expect(mockRestaurantRepository.save).toHaveBeenCalled();
      expect(mockUserRoleRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a restaurant', async () => {
      const updateDto = {
        name: 'Updated Restaurant',
      };

      mockRestaurantRepository.findOne.mockResolvedValue(mockRestaurant);
      mockRestaurantRepository.save.mockResolvedValue({
        ...mockRestaurant,
        ...updateDto,
      });

      const result = await service.update('restaurant-1', updateDto);

      expect(result.name).toBe('Updated Restaurant');
      expect(mockRestaurantRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if restaurant not found', async () => {
      mockRestaurantRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
