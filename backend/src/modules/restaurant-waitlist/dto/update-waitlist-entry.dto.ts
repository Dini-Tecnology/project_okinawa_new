import {
  IsOptional,
  IsBoolean,
  IsArray,
  IsString,
  IsInt,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWaitlistEntryDto {
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
}
