import { IsString, IsUUID, IsArray, IsOptional, IsEnum, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PartialOrderItemDto {
  @IsUUID()
  menuItemId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  customizations?: Record<string, any>;
}

export enum OrderPriority {
  NORMAL = 'normal',
  RUSH = 'rush',
}

export class CreatePartialOrderDto {
  @IsUUID()
  restaurantId: string;

  @IsUUID()
  tableId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartialOrderItemDto)
  items: PartialOrderItemDto[];

  @IsString()
  @IsOptional()
  guestNote?: string;

  @IsEnum(OrderPriority)
  @IsOptional()
  priority?: OrderPriority;

  @IsUUID()
  @IsOptional()
  existingOrderId?: string;
}
