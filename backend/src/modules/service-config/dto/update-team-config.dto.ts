import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

/**
 * DTO for updating team configuration
 */
export class UpdateTeamConfigDto {
  @ApiPropertyOptional({ description: 'Tip distribution policy (e.g. equal, weighted, individual)' })
  @IsOptional()
  @IsString()
  tipDistributionPolicy?: string;

  @ApiPropertyOptional({
    description: 'Role configurations (max count, permissions per role)',
    example: {
      waiter: { maxCount: 10, permissions: ['create_order', 'view_tables'] },
      chef: { maxCount: 5, permissions: ['view_orders', 'update_order_status'] },
    },
  })
  @IsOptional()
  @IsObject()
  roles?: Record<string, {
    maxCount?: number;
    permissions?: string[];
  }>;
}
