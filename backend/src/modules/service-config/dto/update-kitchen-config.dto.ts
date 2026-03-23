import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested, IsString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class KitchenStationDto {
  @ApiPropertyOptional()
  @IsString()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  keywords: string[];

  @ApiPropertyOptional()
  @IsString()
  displayName: string;
}

class RoutingConfigDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kitchen?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bar?: string[];
}

/**
 * DTO for updating kitchen stations and routing configuration
 */
export class UpdateKitchenConfigDto {
  @ApiPropertyOptional({ description: 'Kitchen stations', type: [KitchenStationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KitchenStationDto)
  stations?: KitchenStationDto[];

  @ApiPropertyOptional({ description: 'Order routing configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => RoutingConfigDto)
  routing?: RoutingConfigDto;
}
