import {
  IsString,
  IsNumber,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BarOrderItemDto {
  @ApiProperty({ description: 'Item name' })
  @IsString()
  item_name: string;

  @ApiProperty({ description: 'Item price' })
  @IsNumber()
  @Min(0)
  item_price: number;

  @ApiProperty({ description: 'Quantity', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class AddBarOrderDto {
  @ApiProperty({ type: [BarOrderItemDto], description: 'Items to order' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BarOrderItemDto)
  items: BarOrderItemDto[];
}
