import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CallType } from '../entities/service-call.entity';

export class CreateCallDto {
  @ApiProperty({ description: 'Restaurant UUID' })
  @IsNotEmpty()
  @IsUUID('4', { message: 'Invalid restaurant ID format' })
  restaurant_id: string;

  @ApiProperty({ required: false, description: 'Table UUID' })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid table ID format' })
  table_id?: string;

  @ApiProperty({
    enum: CallType,
    description: 'Type of service call: waiter, manager, help, or emergency',
  })
  @IsNotEmpty()
  @IsEnum(CallType, { message: 'Invalid call type. Must be: waiter, manager, help, or emergency' })
  call_type: CallType;

  @ApiProperty({
    required: false,
    description: 'Optional message from the customer (max 500 characters)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Message must be at most 500 characters' })
  message?: string;
}
