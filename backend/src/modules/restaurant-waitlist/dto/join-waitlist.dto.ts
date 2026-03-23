import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsUUID,
  IsInt,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeatingPreference } from '../entities';

export class JoinWaitlistDto {
  @ApiProperty({ description: 'Restaurant ID' })
  @IsUUID()
  restaurant_id: string;

  @ApiProperty({ description: 'Guest name (responsible)' })
  @IsString()
  @MaxLength(150)
  guest_name: string;

  @ApiProperty({ description: 'Party size', minimum: 1, maximum: 20 })
  @IsInt()
  @Min(1)
  @Max(20)
  party_size: number;

  @ApiPropertyOptional({ enum: SeatingPreference, description: 'Seating preference' })
  @IsOptional()
  @IsEnum(SeatingPreference)
  preference?: SeatingPreference;

  @ApiPropertyOptional({ description: 'Has children in the group' })
  @IsOptional()
  @IsBoolean()
  has_kids?: boolean;

  @ApiPropertyOptional({ description: 'Ages of children', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  kids_ages?: number[];

  @ApiPropertyOptional({ description: 'Children allergies', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kids_allergies?: string[];

  @ApiPropertyOptional({ description: 'Customer phone for anonymous walk-ins' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  customer_phone?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
