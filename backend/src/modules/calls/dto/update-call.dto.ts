import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCallDto {
  @ApiProperty({
    required: false,
    description: 'Optional note from the staff member',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Note must be at most 500 characters' })
  note?: string;
}
