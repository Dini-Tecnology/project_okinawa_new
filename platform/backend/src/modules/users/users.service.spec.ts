import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Profile } from './entities/profile.entity';
import { UserRole as UserRoleEntity } from '@/modules/user-roles/entities/user-role.entity';
import { UserRole } from '@/common/enums';

describe('UsersService', () => {
  let service: UsersService;
  let profileRepository: jest.Mocked<Repository<Profile>>;
  let userRoleRepository: jest.Mocked<Repository<UserRoleEntity>>;

  const mockProfile = {
    id: 'user-1',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+1234567890',
    avatar_url: 'https://example.com/avatar.jpg',
    is_active: true,
    preferences: {},
    roles: [],
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as unknown as Profile;

  const mockUserRole = {
    id: 'role-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    role: UserRole.WAITER,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    user: mockProfile,
    restaurant: null,
  } as unknown as UserRoleEntity;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockUserRoleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(UserRoleEntity),
          useValue: mockUserRoleRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    profileRepository = module.get(getRepositoryToken(Profile));
    userRoleRepository = module.get(getRepositoryToken(UserRoleEntity));

    jest.clearAllMocks();
    mockQueryBuilder.leftJoinAndSelect.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
    mockQueryBuilder.orderBy.mockReturnThis();
    mockQueryBuilder.skip.mockReturnThis();
    mockQueryBuilder.take.mockReturnThis();
  });

  describe('findOne', () => {
    it('should return a user profile by id', async () => {
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findOne('user-1');

      expect(result).toEqual(mockProfile);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: ['roles', 'roles.restaurant'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users with default params', async () => {
      const mockData = [mockProfile];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockData, 1]);
      mockProfileRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.findAll();

      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should apply search filter when provided', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockProfile], 1]);
      mockProfileRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.findAll({ search: 'Test' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(profile.full_name ILIKE :search OR profile.email ILIKE :search)',
        { search: '%Test%' },
      );
    });

    it('should apply role filter when provided', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockProfile], 1]);
      mockProfileRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      await service.findAll({ role: UserRole.WAITER });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'roles.role = :role',
        { role: UserRole.WAITER },
      );
    });

    it('should calculate totalPages correctly for multiple pages', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 45]);
      mockProfileRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.meta.totalPages).toBe(3);
    });

    it('should return empty data when no users found', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);
      mockProfileRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as any,
      );

      const result = await service.findAll();

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('update', () => {
    it('should update a user profile', async () => {
      const updateDto = {
        full_name: 'Updated Name',
        phone: '+9876543210',
      };

      mockProfileRepository.findOne.mockResolvedValue({ ...mockProfile });
      mockProfileRepository.save.mockResolvedValue({
        ...mockProfile,
        ...updateDto,
      });

      const result = await service.update('user-1', updateDto);

      expect(result.full_name).toBe('Updated Name');
      expect(result.phone).toBe('+9876543210');
      expect(mockProfileRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { full_name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('should set is_active to false', async () => {
      const profile = { ...mockProfile, is_active: true };
      mockProfileRepository.findOne.mockResolvedValue(profile);
      mockProfileRepository.save.mockImplementation((p) =>
        Promise.resolve(p as Profile),
      );

      const result = await service.deactivate('user-1');

      expect(result.is_active).toBe(false);
      expect(mockProfileRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.deactivate('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete by setting is_active false and deleted_at', async () => {
      const profile = { ...mockProfile, is_active: true, deleted_at: null };
      mockProfileRepository.findOne.mockResolvedValue(profile);
      mockProfileRepository.save.mockImplementation((p) =>
        Promise.resolve(p as Profile),
      );

      const result = await service.deleteAccount('user-1');

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('30 days');
      expect(mockProfileRepository.save).toHaveBeenCalled();
      const savedProfile = mockProfileRepository.save.mock.calls[0][0];
      expect(savedProfile.is_active).toBe(false);
      expect(savedProfile.deletion_requested_at).toBeInstanceOf(Date);
      expect(savedProfile.deletion_scheduled_for).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteAccount('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockProfile);
      expect(mockProfileRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['roles'],
      });
    });

    it('should return null if user not found by email', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('getStaff', () => {
    it('should return staff members for a restaurant', async () => {
      mockUserRoleRepository.find.mockResolvedValue([mockUserRole]);

      const result = await service.getStaff('restaurant-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user-1');
      expect(result[0].role).toBe(UserRole.WAITER);
      expect(mockUserRoleRepository.find).toHaveBeenCalledWith({
        where: { restaurant_id: 'restaurant-1' },
        relations: ['user'],
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when restaurant has no staff', async () => {
      mockUserRoleRepository.find.mockResolvedValue([]);

      const result = await service.getStaff('restaurant-1');

      expect(result).toEqual([]);
    });
  });

  describe('addStaff', () => {
    it('should add staff by user_id', async () => {
      mockUserRoleRepository.findOne.mockResolvedValueOnce(null); // no existing role
      mockUserRoleRepository.create.mockReturnValue(mockUserRole);
      mockUserRoleRepository.save.mockResolvedValue(mockUserRole);

      const result = await service.addStaff('restaurant-1', {
        user_id: 'user-1',
        role: UserRole.WAITER,
      });

      expect(result).toEqual(mockUserRole);
      expect(mockUserRoleRepository.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        restaurant_id: 'restaurant-1',
        role: UserRole.WAITER,
        is_active: true,
      });
    });

    it('should add staff by email when user_id not provided', async () => {
      mockProfileRepository.findOne.mockResolvedValue(mockProfile);
      mockUserRoleRepository.findOne.mockResolvedValueOnce(null); // no existing role
      mockUserRoleRepository.create.mockReturnValue(mockUserRole);
      mockUserRoleRepository.save.mockResolvedValue(mockUserRole);

      const result = await service.addStaff('restaurant-1', {
        email: 'test@example.com',
        role: UserRole.WAITER,
      });

      expect(result).toEqual(mockUserRole);
    });

    it('should throw BadRequestException if user not found by email', async () => {
      mockProfileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addStaff('restaurant-1', {
          email: 'notfound@example.com',
          role: UserRole.WAITER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if neither user_id nor email provided', async () => {
      await expect(
        service.addStaff('restaurant-1', {
          role: UserRole.WAITER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user already has a role in restaurant', async () => {
      mockUserRoleRepository.findOne.mockResolvedValueOnce(mockUserRole); // existing role found

      await expect(
        service.addStaff('restaurant-1', {
          user_id: 'user-1',
          role: UserRole.WAITER,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStaffRole', () => {
    it('should update staff role', async () => {
      const existingRole = { ...mockUserRole, role: UserRole.WAITER };
      mockUserRoleRepository.findOne.mockResolvedValue(existingRole);
      mockUserRoleRepository.save.mockImplementation((r) =>
        Promise.resolve(r as UserRoleEntity),
      );

      const result = await service.updateStaffRole(
        'restaurant-1',
        'user-1',
        UserRole.MANAGER,
      );

      expect(result.role).toBe(UserRole.MANAGER);
    });

    it('should throw NotFoundException if staff member not found', async () => {
      mockUserRoleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStaffRole('restaurant-1', 'nonexistent', UserRole.MANAGER),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeStaff', () => {
    it('should remove a staff member from restaurant', async () => {
      mockUserRoleRepository.findOne.mockResolvedValue(mockUserRole);
      mockUserRoleRepository.remove.mockResolvedValue(mockUserRole);

      await service.removeStaff('restaurant-1', 'user-1');

      expect(mockUserRoleRepository.remove).toHaveBeenCalledWith(mockUserRole);
    });

    it('should throw NotFoundException if staff member not found', async () => {
      mockUserRoleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeStaff('restaurant-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
