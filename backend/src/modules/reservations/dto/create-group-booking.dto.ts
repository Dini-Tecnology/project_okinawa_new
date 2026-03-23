import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { CreateReservationDto } from './create-reservation.dto';

/**
 * DTO for creating a group booking reservation (8+ guests)
 * Extends regular reservation with group-specific fields
 *
 * @description Group bookings require coordinator contact info and support
 * pre-fixed menus and deposits
 */
export class CreateGroupBookingDto extends CreateReservationDto {
  @ApiProperty({
    description: 'Name of the group coordinator',
    example: 'Maria Silva',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Group coordinator name is required for group bookings' })
  @IsString()
  @MaxLength(200, { message: 'Coordinator name cannot exceed 200 characters' })
  @Transform(({ value }) => value?.trim())
  group_coordinator_name: string;

  @ApiProperty({
    description: 'Phone of the group coordinator (international format)',
    example: '+5511999998888',
  })
  @IsNotEmpty({ message: 'Group coordinator phone is required for group bookings' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid coordinator phone number format',
  })
  group_coordinator_phone: string;

  @ApiProperty({
    description: 'Whether a pre-fixed menu is selected',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  pre_fixed_menu?: boolean;

  @ApiProperty({
    description: 'UUID of the selected pre-fixed menu',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Invalid pre-fixed menu ID format' })
  pre_fixed_menu_id?: string;

  @ApiProperty({
    description: 'Whether a deposit is required',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  deposit_required?: boolean;

  @ApiProperty({
    description: 'Deposit amount in currency units (e.g. BRL)',
    required: false,
    minimum: 0,
    maximum: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Deposit amount must be a number' })
  @Min(0, { message: 'Deposit amount cannot be negative' })
  @Max(100000, { message: 'Deposit amount cannot exceed 100000' })
  deposit_amount?: number;
}
