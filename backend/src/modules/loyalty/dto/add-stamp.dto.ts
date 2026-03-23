import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class AddStampDto {
  @ApiProperty({
    description: 'User ID to add stamp for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'User ID must be a valid UUID' })
  user_id: string;

  @ApiProperty({
    description: 'Restaurant ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  restaurant_id: string;

  @ApiProperty({
    description: 'Service type (dine-in, delivery, takeout)',
    example: 'dine-in',
  })
  @IsNotEmpty({ message: 'Service type is required' })
  @IsString({ message: 'Service type must be a string' })
  @MaxLength(50, { message: 'Service type cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  service_type: string;
}
