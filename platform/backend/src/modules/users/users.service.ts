import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { UserRole as UserRoleEntity } from '@/modules/user-roles/entities/user-role.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRole } from '@/common/enums';
import { PAGINATION } from '@common/constants/limits';
import { toPaginationDto } from '@/common/dto/pagination.dto';

export interface FindUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(UserRoleEntity)
    private userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  async findOne(id: string) {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.restaurant'],
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    return profile;
  }

  async findAll(params: FindUsersParams = {}) {
    const { search, role } = params;
    const dto = toPaginationDto({ page: params.page, limit: params.limit });

    const queryBuilder = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.roles', 'roles')
      .leftJoinAndSelect('roles.restaurant', 'restaurant');

    if (search) {
      queryBuilder.andWhere(
        '(profile.full_name ILIKE :search OR profile.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('roles.role = :role', { role });
    }

    queryBuilder
      .orderBy('profile.created_at', 'DESC')
      .skip(dto.offset)
      .take(dto.limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page: dto.page!,
        limit: dto.limit!,
        total,
        totalPages: Math.ceil(total / dto.limit!),
      },
    };
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.findOne(id);

    Object.assign(profile, updateProfileDto);

    return this.profileRepository.save(profile);
  }

  async deactivate(id: string) {
    const profile = await this.findOne(id);
    profile.is_active = false;
    return this.profileRepository.save(profile);
  }

  async deleteAccount(id: string) {
    const profile = await this.findOne(id);
    // Soft delete - just mark as inactive and clear personal data
    profile.is_active = false;
    profile.deleted_at = new Date();
    return this.profileRepository.save(profile);
  }

  async findByEmail(email: string) {
    return this.profileRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
  }

  // Staff management methods
  async getStaff(restaurantId: string) {
    const roles = await this.userRoleRepository.find({
      where: { restaurant_id: restaurantId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    return roles.map((role) => ({
      id: role.user_id,
      full_name: role.user?.full_name,
      email: role.user?.email,
      phone: role.user?.phone,
      avatar_url: role.user?.avatar_url,
      role: role.role,
      is_active: role.is_active,
      created_at: role.created_at,
    }));
  }

  async addStaff(
    restaurantId: string,
    data: { user_id?: string; email?: string; role: UserRole; full_name?: string },
  ) {
    let userId = data.user_id;

    // If no user_id, try to find by email
    if (!userId && data.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        userId = existingUser.id;
      }
    }

    if (!userId) {
      throw new BadRequestException('User not found. User must have an account first.');
    }

    // Check if already has role in this restaurant
    const existingRole = await this.userRoleRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
    });

    if (existingRole) {
      throw new BadRequestException('User already has a role in this restaurant');
    }

    const userRole = this.userRoleRepository.create({
      user_id: userId,
      restaurant_id: restaurantId,
      role: data.role,
      is_active: true,
    });

    return this.userRoleRepository.save(userRole);
  }

  async updateStaffRole(
    restaurantId: string,
    userId: string,
    newRole: UserRole,
  ) {
    const userRole = await this.userRoleRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
    });

    if (!userRole) {
      throw new NotFoundException('Staff member not found');
    }

    userRole.role = newRole;
    return this.userRoleRepository.save(userRole);
  }

  async removeStaff(restaurantId: string, userId: string) {
    const userRole = await this.userRoleRepository.findOne({
      where: { user_id: userId, restaurant_id: restaurantId },
    });

    if (!userRole) {
      throw new NotFoundException('Staff member not found');
    }

    return this.userRoleRepository.remove(userRole);
  }
}
