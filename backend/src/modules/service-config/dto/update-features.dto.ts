import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

/**
 * DTO for enabling/disabling platform features
 */
export class UpdateFeaturesDto {
  @ApiPropertyOptional({ description: 'Enable loyalty program' })
  @IsOptional()
  @IsBoolean()
  loyalty?: boolean;

  @ApiPropertyOptional({ description: 'Enable reservations' })
  @IsOptional()
  @IsBoolean()
  reservations?: boolean;

  @ApiPropertyOptional({ description: 'Enable drive-thru mode' })
  @IsOptional()
  @IsBoolean()
  driveThru?: boolean;

  @ApiPropertyOptional({ description: 'Enable multi-language support' })
  @IsOptional()
  @IsBoolean()
  multiLanguage?: boolean;

  @ApiPropertyOptional({ description: 'Enable analytics dashboard' })
  @IsOptional()
  @IsBoolean()
  analytics?: boolean;

  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable webhooks' })
  @IsOptional()
  @IsBoolean()
  webhooks?: boolean;
}
