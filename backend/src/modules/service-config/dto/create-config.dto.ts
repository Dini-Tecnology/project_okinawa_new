import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsObject,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ContactDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsapp?: string;
}

class AddressDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  neighborhood?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}

class ProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactDto)
  contact?: ContactDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  hours?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cuisineType?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priceRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  capacity?: number;
}

class ServiceTypesDto {
  @ApiProperty({ description: 'Primary service type' })
  @IsString()
  primary: string;

  @ApiProperty({ description: 'Supported service types', type: [String] })
  @IsArray()
  @IsString({ each: true })
  supported: string[];
}

class ExperienceFlagsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reservationsEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  virtualQueueEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  familyModeEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  qrTableOrdering?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sharedComanda?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aiHarmonization?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workMode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  happyHourEnabled?: boolean;
}

class PaymentConfigDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  enabledMethods?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  serviceFeePct?: number;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tipOptions?: number[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  splitModes?: string[];
}

class EnabledFeaturesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  loyalty?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reservations?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  driveThru?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  multiLanguage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  analytics?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  webhooks?: boolean;
}

/**
 * DTO for initial setup wizard — creates a full config from scratch
 */
export class CreateConfigDto {
  @ApiProperty({ description: 'Restaurant ID to create config for' })
  @IsUUID()
  restaurantId: string;

  @ApiPropertyOptional({ description: 'Restaurant profile information' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileDto)
  profile?: ProfileDto;

  @ApiPropertyOptional({ description: 'Service types configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceTypesDto)
  serviceTypes?: ServiceTypesDto;

  @ApiPropertyOptional({ description: 'Experience flags' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ExperienceFlagsDto)
  experienceFlags?: ExperienceFlagsDto;

  @ApiPropertyOptional({ description: 'Floor layout' })
  @IsOptional()
  @IsObject()
  floorLayout?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Kitchen stations configuration' })
  @IsOptional()
  @IsObject()
  kitchenStations?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Payment configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentConfigDto)
  paymentConfig?: PaymentConfigDto;

  @ApiPropertyOptional({ description: 'Enabled features' })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnabledFeaturesDto)
  enabledFeatures?: EnabledFeaturesDto;

  @ApiPropertyOptional({ description: 'Team configuration' })
  @IsOptional()
  @IsObject()
  teamConfig?: Record<string, any>;
}
