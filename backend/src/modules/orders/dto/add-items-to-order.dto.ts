import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderItemDto } from './create-order.dto';

/**
 * DTO for adding items to an existing open order (partial order / comanda aberta)
 *
 * @description Used with POST /orders/:id/items to add more items
 * to an order that is in status open_for_additions, confirmed, or preparing.
 *
 * @epic EPIC 17 — Partial Order
 */
export class AddItemsToOrderDto {
  @ApiProperty({
    type: [OrderItemDto],
    minItems: 1,
    maxItems: 50,
    description: 'New items to add to the existing order',
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Must add at least one item' })
  @ArrayMaxSize(50, { message: 'Cannot add more than 50 items at once' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
