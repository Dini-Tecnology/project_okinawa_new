import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CustomizationOptionDto {
  @ApiProperty({ description: 'Option ID (UUID)' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Option name', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Price delta in cents (can be 0 for free options)' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { message: 'Price delta must be a valid number' })
  @Min(0, { message: 'Price delta cannot be negative' })
  price_delta: number;

  @ApiProperty({ required: false, description: 'Calories for this option' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Calories must be a valid number' })
  @Min(0, { message: 'Calories cannot be negative' })
  calories?: number | null;
}

export class CreateCustomizationGroupDto {
  @ApiProperty({ description: 'Group name (e.g. "Ponto da carne", "Molho")', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'Group name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({ required: false, description: 'Minimum selections required', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_select?: number;

  @ApiProperty({ required: false, description: 'Maximum selections allowed', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  max_select?: number;

  @ApiProperty({ required: false, description: 'Whether this group is required', default: false })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @ApiProperty({ required: false, description: 'Sort order for display', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ type: [CustomizationOptionDto], description: 'Available options for this group' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomizationOptionDto)
  options: CustomizationOptionDto[];
}
