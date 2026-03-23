import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ApprovalType } from '../entities/approval.entity';

export class CreateApprovalDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;

  @ApiProperty({ enum: ApprovalType, description: 'Type of approval request' })
  @IsNotEmpty()
  @IsEnum(ApprovalType, { message: 'Invalid approval type' })
  type: ApprovalType;

  @ApiProperty({ description: 'Name of the item/order involved' })
  @IsNotEmpty()
  @IsString()
  item_name: string;

  @ApiProperty({ required: false, description: 'Table UUID' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid table ID format' })
  table_id?: string;

  @ApiProperty({ description: 'Reason/justification for the request', minLength: 5 })
  @IsNotEmpty()
  @IsString()
  @MinLength(5, { message: 'Reason must be at least 5 characters' })
  reason: string;

  @ApiProperty({ description: 'Financial amount impacted (decimal)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a number' })
  @Min(0, { message: 'Amount cannot be negative' })
  amount?: number;

  @ApiProperty({ required: false, description: 'Related order UUID' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid order ID format' })
  order_id?: string;
}
