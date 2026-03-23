import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO for updating payment configuration
 */
export class UpdatePaymentConfigDto {
  @ApiPropertyOptional({ description: 'Enabled payment methods', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledMethods?: string[];

  @ApiPropertyOptional({ description: 'Service fee percentage (e.g. 10 for 10%)' })
  @IsOptional()
  @IsNumber()
  serviceFeePct?: number;

  @ApiPropertyOptional({ description: 'Tip percentage options', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tipOptions?: number[];

  @ApiPropertyOptional({ description: 'Available split modes (e.g. equal, custom, by_item)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  splitModes?: string[];
}
