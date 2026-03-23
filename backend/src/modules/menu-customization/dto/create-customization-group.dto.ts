import { IsString, IsUUID, IsInt, IsBoolean, IsArray, IsOptional, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomizationOptionDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsBoolean()
  available: boolean;
}

export class CreateCustomizationGroupDto {
  @IsUUID()
  menu_item_id: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  min_select?: number;

  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  max_select?: number;

  @IsBoolean()
  @IsOptional()
  is_required?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sort_order?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomizationOptionDto)
  options: CustomizationOptionDto[];
}
