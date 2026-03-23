import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray } from 'class-validator';

/**
 * DTO for updating service types configuration
 */
export class UpdateServiceTypesDto {
  @ApiProperty({ description: 'Primary service type (e.g. casual_dining, fine_dining, fast_casual)' })
  @IsString()
  primary: string;

  @ApiProperty({ description: 'All supported service types', type: [String] })
  @IsArray()
  @IsString({ each: true })
  supported: string[];
}
