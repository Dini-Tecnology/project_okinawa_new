import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, IsNull } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';
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
  private readonly logger = new Logger(UsersService.name);

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

    // LGPD — Schedule deletion with 30-day grace period instead of immediate anonymization
    profile.deletion_requested_at = new Date();
    profile.deletion_scheduled_for = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    profile.is_active = false;

    await this.profileRepository.save(profile);
    this.logger.log(`Account ${id} scheduled for deletion on ${profile.deletion_scheduled_for.toISOString()}`);

    return {
      message: 'Deletion scheduled. Your account will be permanently deleted in 30 days. Contact support to cancel.',
    };
  }

  /**
   * Daily cron job at 4 AM — processes accounts whose 30-day grace period has elapsed.
   * Performs LGPD Art. 12 PII anonymization ("right to be forgotten").
   */
  @Cron('0 4 * * *')
  async processPendingDeletions(): Promise<void> {
    const now = new Date();

    const pendingProfiles = await this.profileRepository.find({
      where: {
        deletion_scheduled_for: LessThanOrEqual(now),
        is_active: false,
        deleted_at: IsNull(),
      },
    });

    for (const profile of pendingProfiles) {
      const anonId = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
      profile.email = `deleted_${anonId}@anonymized.local`;
      profile.full_name = null;
      profile.phone = null;
      profile.avatar_url = null;
      profile.default_address = null;
      profile.dietary_restrictions = null;
      profile.favorite_cuisines = null;
      profile.preferences = null;
      profile.marketing_consent = false;
      profile.deleted_at = new Date();

      await this.profileRepository.save(profile);
      this.logger.log(`Account ${profile.id} anonymized after 30-day grace period`);
    }

    if (pendingProfiles.length > 0) {
      this.logger.log(`Processed ${pendingProfiles.length} pending account deletion(s)`);
    }
  }

  async cancelDeletion(userId: string) {
    const profile = await this.profileRepository.findOne({ where: { id: userId } });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    if (!profile.deletion_requested_at) {
      throw new BadRequestException('No pending deletion request for this account.');
    }

    if (profile.deleted_at) {
      throw new BadRequestException('Account has already been permanently deleted.');
    }

    profile.deletion_requested_at = null;
    profile.deletion_scheduled_for = null;
    profile.is_active = true;

    await this.profileRepository.save(profile);
    this.logger.log(`Account ${userId} deletion cancelled — account reactivated`);

    return { message: 'Account deletion cancelled. Your account has been reactivated.' };
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
