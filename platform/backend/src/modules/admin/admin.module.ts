/**
 * AdminModule - Foundation for the Admin Panel
 *
 * Provides operational support endpoints for managing users,
 * viewing system health, handling LGPD requests, and basic analytics.
 *
 * Protected by OWNER role — only restaurant owners can access.
 *
 * Dependencies:
 * - Profile entity (user management)
 * - Order entity (analytics)
 * - UserConsent entity (LGPD consent tracking)
 * - ConsentService (from IdentityModule, globally exported)
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Profile } from '@/modules/users/entities/profile.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { UserConsent } from '@/modules/identity/entities/user-consent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, Order, UserConsent]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
