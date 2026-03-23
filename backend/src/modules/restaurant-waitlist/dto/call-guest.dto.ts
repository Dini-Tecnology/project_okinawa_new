import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CallGuestDto {
  @ApiPropertyOptional({ description: 'Table number (e.g., "Mesa 8")' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  table_number?: string;

  @ApiPropertyOptional({ description: 'Custom message to the guest' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  message?: string;
}
