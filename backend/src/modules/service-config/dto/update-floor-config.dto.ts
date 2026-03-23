import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class FloorSectionDto {
  @ApiPropertyOptional()
  @IsString()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  capacity?: number;
}

class FloorTableDto {
  @ApiPropertyOptional()
  @IsString()
  id: string;

  @ApiPropertyOptional()
  @IsString()
  tableNumber: string;

  @ApiPropertyOptional()
  @IsString()
  sectionId: string;

  @ApiPropertyOptional()
  @IsNumber()
  seats: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  positionX?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  positionY?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shape?: string;
}

/**
 * DTO for updating floor layout configuration (sections + tables)
 */
export class UpdateFloorConfigDto {
  @ApiPropertyOptional({ description: 'Floor sections', type: [FloorSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorSectionDto)
  sections?: FloorSectionDto[];

  @ApiPropertyOptional({ description: 'Floor tables', type: [FloorTableDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FloorTableDto)
  tables?: FloorTableDto[];
}
