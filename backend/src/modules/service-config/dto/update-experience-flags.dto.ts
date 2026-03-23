import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

/**
 * DTO for updating experience flags configuration
 */
export class UpdateExperienceFlagsDto {
  @ApiPropertyOptional({ description: 'Enable reservations system' })
  @IsOptional()
  @IsBoolean()
  reservationsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable virtual queue / waitlist' })
  @IsOptional()
  @IsBoolean()
  virtualQueueEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable family-friendly mode' })
  @IsOptional()
  @IsBoolean()
  familyModeEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable QR code table ordering' })
  @IsOptional()
  @IsBoolean()
  qrTableOrdering?: boolean;

  @ApiPropertyOptional({ description: 'Enable shared comanda for group orders' })
  @IsOptional()
  @IsBoolean()
  sharedComanda?: boolean;

  @ApiPropertyOptional({ description: 'Enable AI harmonization for menus' })
  @IsOptional()
  @IsBoolean()
  aiHarmonization?: boolean;

  @ApiPropertyOptional({ description: 'Work mode (e.g. coworking_friendly, silent, standard)' })
  @IsOptional()
  @IsString()
  workMode?: string;

  @ApiPropertyOptional({ description: 'Enable happy hour scheduling' })
  @IsOptional()
  @IsBoolean()
  happyHourEnabled?: boolean;
}
