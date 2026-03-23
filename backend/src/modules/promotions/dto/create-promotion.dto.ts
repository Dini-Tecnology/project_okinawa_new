import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsUUID,
  IsDateString,
  IsArray,
  Min,
  Max,
  MaxLength,
  MinLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { PromotionType, PromotionStatus } from '../entities/promotion.entity';

export class CreatePromotionDto {
  @ApiProperty({
    description: 'Restaurant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  restaurant_id: string;

  @ApiProperty({
    description: 'Promotion code (uppercase, no spaces, 4-20 chars)',
    example: 'WELCOME10',
  })
  @IsNotEmpty({ message: 'Code is required' })
  @IsString({ message: 'Code must be a string' })
  @MinLength(4, { message: 'Code must be at least 4 characters' })
  @MaxLength(20, { message: 'Code cannot exceed 20 characters' })
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Code must contain only uppercase letters and numbers',
  })
  @Transform(({ value }) => value?.toUpperCase().replace(/\s/g, ''))
  code: string;

  @ApiProperty({
    description: 'Promotion title',
    example: '10% de desconto no primeiro pedido',
  })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(255, { message: 'Title cannot exceed 255 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional({
    description: 'Promotion description',
    example: 'Desconto especial para novos clientes',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({
    description: 'Promotion type',
    enum: PromotionType,
    example: PromotionType.PERCENTAGE,
  })
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(PromotionType, { message: 'Invalid promotion type' })
  type: PromotionType;

  @ApiPropertyOptional({
    description: 'Promotion status',
    enum: PromotionStatus,
    default: PromotionStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PromotionStatus, { message: 'Invalid promotion status' })
  status?: PromotionStatus;

  @ApiPropertyOptional({
    description: 'Discount value (percentage 1-100, or amount in cents for fixed)',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Discount value must be an integer' })
  @Min(1, { message: 'Discount value must be at least 1' })
  discount_value?: number;

  @ApiPropertyOptional({
    description: 'Free item ID (for FREE_ITEM type)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Free item ID must be a valid UUID' })
  free_item_id?: string;

  @ApiPropertyOptional({
    description: 'Minimum order value in cents',
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Minimum order value must be an integer' })
  @Min(0, { message: 'Minimum order value cannot be negative' })
  min_order_value?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of total uses (null = unlimited)',
    example: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Max uses must be an integer' })
  @Min(1, { message: 'Max uses must be at least 1' })
  max_uses?: number;

  @ApiPropertyOptional({
    description: 'Maximum uses per user',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Max uses per user must be an integer' })
  @Min(1, { message: 'Max uses per user must be at least 1' })
  max_uses_per_user?: number;

  @ApiProperty({
    description: 'Promotion start date (ISO string)',
    example: '2026-03-01T00:00:00Z',
  })
  @IsNotEmpty({ message: 'Valid from date is required' })
  @IsDateString({}, { message: 'Valid from must be a valid date' })
  valid_from: string;

  @ApiProperty({
    description: 'Promotion end date (ISO string)',
    example: '2026-04-01T23:59:59Z',
  })
  @IsNotEmpty({ message: 'Valid until date is required' })
  @IsDateString({}, { message: 'Valid until must be a valid date' })
  valid_until: string;

  @ApiPropertyOptional({
    description: 'Days of week (0=Sun, 1=Mon... for happy hour)',
    example: [1, 2, 3, 4, 5],
    type: [Number],
  })
  @IsOptional()
  @IsArray({ message: 'Days of week must be an array' })
  @IsInt({ each: true, message: 'Each day must be an integer' })
  @Min(0, { each: true, message: 'Day value must be between 0 and 6' })
  @Max(6, { each: true, message: 'Day value must be between 0 and 6' })
  days_of_week?: number[];

  @ApiPropertyOptional({
    description: 'Happy hour start time (HH:MM)',
    example: '17:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Hours from must be in HH:MM format' })
  hours_from?: string;

  @ApiPropertyOptional({
    description: 'Happy hour end time (HH:MM)',
    example: '19:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Hours until must be in HH:MM format' })
  hours_until?: string;

  @ApiPropertyOptional({
    description: 'Applicable menu categories',
    example: ['drinks', 'appetizers'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Applicable categories must be an array' })
  @IsString({ each: true, message: 'Each category must be a string' })
  applicable_categories?: string[];
}
