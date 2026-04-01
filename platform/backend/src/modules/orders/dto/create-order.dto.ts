import { IsNotEmpty, IsString, IsArray, IsOptional, IsNumber, ValidateNested, IsEnum, IsUUID, Min, Max, MaxLength, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { OrderType } from '@/common/enums';

/**
 * Customization option for an order item
 * @example { name: 'Extra cheese', value: 'Double', price_modifier: 2.50 }
 */
export class OrderItemCustomizationDto {
  @ApiProperty({ maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'Customization name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({ maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200, { message: 'Customization value cannot exceed 200 characters' })
  value: string;

  @ApiProperty({ required: false, minimum: 0, maximum: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Price modifier must be a number' })
  @Min(0, { message: 'Price modifier cannot be negative' })
  @Max(1000, { message: 'Price modifier cannot exceed 1000' })
  price_modifier?: number;
}

/**
 * Individual item in an order
 * @example { menu_item_id: '123e4567-e89b-12d3-a456-426614174000', quantity: 2 }
 */
export class OrderItemDto {
  @ApiProperty({ description: 'Menu item UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid menu item ID format' })
  menu_item_id: string;

  @ApiProperty({ minimum: 1, maximum: 100 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @Max(100, { message: 'Quantity cannot exceed 100' })
  quantity: number;

  @ApiProperty({ required: false, type: [OrderItemCustomizationDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20, { message: 'Cannot have more than 20 customizations per item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemCustomizationDto)
  customizations?: OrderItemCustomizationDto[];

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Special instructions cannot exceed 500 characters' })
  @Transform(({ value }) => value?.trim())
  special_instructions?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;

  @ApiProperty({ required: false, description: 'Table UUID' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid table ID format' })
  table_id?: string;

  @ApiProperty({ enum: OrderType, default: OrderType.DINE_IN })
  @IsOptional()
  @IsEnum(OrderType, { message: 'Invalid order type' })
  order_type?: OrderType;

  @ApiProperty({ type: [OrderItemDto], minItems: 1, maxItems: 50 })
  @IsArray()
  @ArrayMinSize(1, { message: 'Order must contain at least one item' })
  @ArrayMaxSize(50, { message: 'Order cannot contain more than 50 items' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ required: false, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Special instructions cannot exceed 1000 characters' })
  @Transform(({ value }) => value?.trim())
  special_instructions?: string;

  @ApiProperty({ required: false, minimum: 0, maximum: 10000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tip amount must be a number' })
  @Min(0, { message: 'Tip amount cannot be negative' })
  @Max(10000, { message: 'Tip amount cannot exceed 10000' })
  tip_amount?: number;

  @ApiProperty({ required: false, description: 'Promotion/coupon code to apply', maxLength: 20 })
  @IsOptional()
  @IsString({ message: 'Promotion code must be a string' })
  @MaxLength(20, { message: 'Promotion code cannot exceed 20 characters' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  promotion_code?: string;
}
