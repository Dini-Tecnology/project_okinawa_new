import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { InventoryCategory, InventoryUnit } from '../entities/inventory-item.entity';

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;

  @ApiProperty({ maxLength: 100, description: 'Item name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({ enum: InventoryCategory, description: 'Inventory category' })
  @IsNotEmpty()
  @IsEnum(InventoryCategory, { message: 'Invalid inventory category' })
  category: InventoryCategory;

  @ApiProperty({ minimum: 0, description: 'Current stock level' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'Current level must be a valid number' })
  @Min(0, { message: 'Current level cannot be negative' })
  current_level: number;

  @ApiProperty({ enum: InventoryUnit, description: 'Unit of measurement' })
  @IsNotEmpty()
  @IsEnum(InventoryUnit, { message: 'Invalid inventory unit' })
  unit: InventoryUnit;

  @ApiProperty({ minimum: 0, description: 'Minimum acceptable level (triggers alerts)' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'Min level must be a valid number' })
  @Min(0.001, { message: 'Min level must be greater than 0' })
  min_level: number;

  @ApiProperty({ required: false, description: 'Maximum level (for purchase planning)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'Max level must be a valid number' })
  @Min(0, { message: 'Max level cannot be negative' })
  max_level?: number;

  @ApiProperty({ required: false, minimum: 0, description: 'Unit cost in currency' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Unit cost must be a valid number' })
  @Min(0, { message: 'Unit cost cannot be negative' })
  unit_cost?: number;

  @ApiProperty({ required: false, maxLength: 200, description: 'Supplier name' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Supplier name cannot exceed 200 characters' })
  supplier?: string;

  @ApiProperty({ required: false, description: 'Free-form notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
