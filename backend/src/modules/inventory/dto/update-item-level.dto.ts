import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateItemLevelDto {
  @ApiProperty({ minimum: 0, description: 'New stock level' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 }, { message: 'Level must be a valid number' })
  @Min(0, { message: 'Level cannot be negative' })
  current_level: number;

  @ApiProperty({ required: false, description: 'Reason for update (e.g. "Delivery received")' })
  @IsOptional()
  @IsString()
  notes?: string;
}
