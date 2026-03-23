import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ValidatePromotionDto {
  @ApiProperty({
    description: 'Coupon code to validate',
    example: 'WELCOME10',
  })
  @IsNotEmpty({ message: 'Code is required' })
  @IsString({ message: 'Code must be a string' })
  @MaxLength(20, { message: 'Code cannot exceed 20 characters' })
  code: string;

  @ApiProperty({
    description: 'Restaurant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  restaurantId: string;

  @ApiPropertyOptional({
    description: 'User ID (for per-user limit checks)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  userId?: string;

  @ApiProperty({
    description: 'Order value in cents',
    example: 5000,
  })
  @IsNotEmpty({ message: 'Order value is required' })
  @Type(() => Number)
  @IsInt({ message: 'Order value must be an integer' })
  @Min(0, { message: 'Order value cannot be negative' })
  orderValue: number;

  @ApiPropertyOptional({
    description: 'Order items (for category-based validation)',
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Order items must be an array' })
  orderItems?: string[];
}
