import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '@/common/enums';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    findOne: jest.fn(),
    update: jest.fn(),
    deleteAccount: jest.fn(),
    findAll: jest.fn(),
    deactivate: jest.fn(),
    getStaff: jest.fn(),
    addStaff: jest.fn(),
    updateStaffRole: jest.fn(),
    removeStaff: jest.fn(),
  };

  const mockProfile = {
    id: 'user-1',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+1234567890',
    is_active: true,
    roles: [],
  };

  const mockUser = mockAuthenticatedUser({ sub: 'user-1', id: 'user-1' });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    })
      .overrideGuard(
        require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard,
      )
      .useValue({ canActivate: () => true })
      .overrideGuard(
        require('@/modules/auth/guards/roles.guard').RolesGuard,
      )
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return the current user profile', async () => {
      mockUsersService.findOne.mockResolvedValue(mockProfile);

      const result = await controller.getMe(mockUser);

      expect(result).toEqual(mockProfile);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateMe', () => {
    it('should update the current user profile', async () => {
      const updateDto = { full_name: 'Updated Name' };
      const updated = { ...mockProfile, full_name: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updated);

      const result = await controller.updateMe(mockUser, updateDto as any);

      expect(result.full_name).toBe('Updated Name');
      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', updateDto);
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete the current user account', async () => {
      const deleted = { ...mockProfile, is_active: false, deleted_at: new Date() };
      mockUsersService.deleteAccount.mockResolvedValue(deleted);

      const result = await controller.deleteAccount(mockUser);

      expect(result.is_active).toBe(false);
      expect(mockUsersService.deleteAccount).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const paginatedResult = {
        data: [mockProfile],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      mockUsersService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(1, 20, undefined, undefined);

      expect(result).toEqual(paginatedResult);
      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
        role: undefined,
      });
    });

    it('should pass search and role filters', async () => {
      mockUsersService.findAll.mockResolvedValue({ data: [], meta: {} });

      await controller.findAll(1, 10, 'test', UserRole.WAITER);

      expect(mockUsersService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'test',
        role: UserRole.WAITER,
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockProfile);

      const result = await controller.findOne('user-1');

      expect(result).toEqual(mockProfile);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateUser', () => {
    it('should update user by id', async () => {
      const updateDto = { full_name: 'Admin Updated' };
      const updated = { ...mockProfile, full_name: 'Admin Updated' };
      mockUsersService.update.mockResolvedValue(updated);

      const result = await controller.updateUser('user-1', updateDto as any);

      expect(result.full_name).toBe('Admin Updated');
      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', updateDto);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      const deactivated = { ...mockProfile, is_active: false };
      mockUsersService.deactivate.mockResolvedValue(deactivated);

      const result = await controller.deactivateUser('user-1');

      expect(result.is_active).toBe(false);
      expect(mockUsersService.deactivate).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getStaff', () => {
    it('should return staff for a restaurant', async () => {
      const staff = [
        {
          id: 'user-1',
          full_name: 'Waiter One',
          email: 'waiter@test.com',
          role: UserRole.WAITER,
          is_active: true,
        },
      ];
      mockUsersService.getStaff.mockResolvedValue(staff);

      const result = await controller.getStaff('restaurant-1');

      expect(result).toEqual(staff);
      expect(mockUsersService.getStaff).toHaveBeenCalledWith('restaurant-1');
    });
  });

  describe('addStaff', () => {
    it('should add staff member to restaurant', async () => {
      const mockRole = {
        id: 'role-1',
        user_id: 'user-1',
        restaurant_id: 'restaurant-1',
        role: UserRole.WAITER,
      };
      mockUsersService.addStaff.mockResolvedValue(mockRole);

      const body = { user_id: 'user-1', role: UserRole.WAITER };
      const result = await controller.addStaff('restaurant-1', body);

      expect(result).toEqual(mockRole);
      expect(mockUsersService.addStaff).toHaveBeenCalledWith(
        'restaurant-1',
        body,
      );
    });
  });

  describe('updateStaffRole', () => {
    it('should update a staff member role', async () => {
      const updated = { ...mockProfile, role: UserRole.MANAGER };
      mockUsersService.updateStaffRole.mockResolvedValue(updated);

      const result = await controller.updateStaffRole(
        'restaurant-1',
        'user-1',
        UserRole.MANAGER,
      );

      expect(mockUsersService.updateStaffRole).toHaveBeenCalledWith(
        'restaurant-1',
        'user-1',
        UserRole.MANAGER,
      );
      expect(result).toEqual(updated);
    });
  });

  describe('removeStaff', () => {
    it('should remove a staff member from restaurant', async () => {
      mockUsersService.removeStaff.mockResolvedValue(undefined);

      await controller.removeStaff('restaurant-1', 'user-1');

      expect(mockUsersService.removeStaff).toHaveBeenCalledWith(
        'restaurant-1',
        'user-1',
      );
    });
  });
});
