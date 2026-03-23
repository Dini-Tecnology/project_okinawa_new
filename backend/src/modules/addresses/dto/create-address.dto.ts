import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAddressDto {
  @ApiProperty({ description: 'Address label (e.g. Casa, Trabalho, Outro)', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50, { message: 'Label cannot exceed 50 characters' })
  label: string;

  @ApiProperty({ description: 'Street name', maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255, { message: 'Street cannot exceed 255 characters' })
  street: string;

  @ApiProperty({ description: 'Street number', maxLength: 20 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20, { message: 'Number cannot exceed 20 characters' })
  number: string;

  @ApiProperty({ required: false, description: 'Address complement', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Complement cannot exceed 255 characters' })
  complement?: string;

  @ApiProperty({ description: 'Neighborhood', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'Neighborhood cannot exceed 100 characters' })
  neighborhood: string;

  @ApiProperty({ description: 'City', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city: string;

  @ApiProperty({ description: 'State code (2 characters)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2, { message: 'State cannot exceed 2 characters' })
  state: string;

  @ApiProperty({ description: 'Postal code', maxLength: 10 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10, { message: 'Postal code cannot exceed 10 characters' })
  postal_code: string;

  @ApiProperty({ required: false, description: 'Country code (default: BR)' })
  @IsOptional()
  @IsString()
  @MaxLength(5, { message: 'Country code cannot exceed 5 characters' })
  country?: string;

  @ApiProperty({ required: false, description: 'Latitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  latitude?: number;

  @ApiProperty({ required: false, description: 'Longitude' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  longitude?: number;

  @ApiProperty({ required: false, description: 'Set as default address', default: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
