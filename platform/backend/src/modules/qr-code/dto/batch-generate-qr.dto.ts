import { IsUUID, IsEnum, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum QRCodeStyle {
  MINIMAL = 'minimal',
  PREMIUM = 'premium',
  BOLD = 'bold',
  ELEGANT = 'elegant',
}

export class TableQRGenerateDto {
  @ApiProperty({
    description: 'Table UUID to generate QR code for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Table ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Table ID is required' })
  table_id: string;

  @ApiPropertyOptional({
    description: 'Table number/name for display',
    example: 'T-01',
  })
  @IsOptional()
  @IsString()
  table_number?: string;
}

export class BatchGenerateQRDto {
  @ApiProperty({
    description: 'Restaurant UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'Restaurant ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Restaurant ID is required' })
  restaurant_id: string;

  @ApiProperty({
    description: 'Array of table IDs to generate QR codes for',
    type: [TableQRGenerateDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableQRGenerateDto)
  tables: TableQRGenerateDto[];

  @ApiPropertyOptional({
    description: 'QR code visual style',
    enum: QRCodeStyle,
    default: QRCodeStyle.MINIMAL,
  })
  @IsOptional()
  @IsEnum(QRCodeStyle, { message: 'Style must be one of: minimal, premium, bold, elegant' })
  style?: QRCodeStyle;

  @ApiPropertyOptional({
    description: 'Primary color for QR code (hex)',
    example: '#EA580C',
  })
  @IsOptional()
  @IsString()
  color_primary?: string;

  @ApiPropertyOptional({
    description: 'Secondary color for QR code (hex)',
    example: '#F97316',
  })
  @IsOptional()
  @IsString()
  color_secondary?: string;

  @ApiPropertyOptional({
    description: 'Include restaurant logo in QR code center',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  include_logo?: boolean;
}

export class GeneratedQRCodeDto {
  @ApiProperty({
    description: 'Table UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  table_id: string;

  @ApiProperty({
    description: 'Table number/name',
    example: 'T-01',
  })
  table_number: string;

  @ApiProperty({
    description: 'QR code image as base64 data URL',
    example: 'data:image/png;base64,iVBORw0KGgo...',
  })
  qr_code_image: string;

  @ApiProperty({
    description: 'QR code data/URL that is encoded',
    example: 'https://app.okinawa.com/scan/abc123/def456?sig=abc...',
  })
  qr_code_data: string;

  @ApiProperty({
    description: 'HMAC signature for validation',
    example: 'a1b2c3d4e5f6...',
  })
  signature: string;

  @ApiProperty({
    description: 'QR code version number',
    example: 1,
  })
  version: number;
}

export class BatchGenerateResultDto {
  @ApiProperty({
    description: 'Array of generated QR codes',
    type: [GeneratedQRCodeDto],
  })
  qr_codes: GeneratedQRCodeDto[];

  @ApiProperty({
    description: 'Total number of QR codes generated',
    example: 10,
  })
  total_generated: number;

  @ApiProperty({
    description: 'Style used for generation',
    enum: QRCodeStyle,
    example: QRCodeStyle.PREMIUM,
  })
  style: QRCodeStyle;
}
