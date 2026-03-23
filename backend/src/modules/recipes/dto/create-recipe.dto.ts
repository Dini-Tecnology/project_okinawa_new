import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsUrl,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { RecipeDifficulty } from '../entities/drink-recipe.entity';

export class IngredientDto {
  @ApiProperty({ description: 'Ingredient name', example: 'Gin Artesanal' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ description: 'Amount', example: '60' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  amount: string;

  @ApiProperty({ description: 'Unit of measurement', example: 'ml' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  unit: string;
}

export class CreateRecipeDto {
  @ApiProperty({ maxLength: 120, example: 'Gin Tonica Aurora' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ maxLength: 80, example: 'Gin' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => value?.trim())
  category: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ enum: RecipeDifficulty, default: RecipeDifficulty.EASY })
  @IsEnum(RecipeDifficulty)
  difficulty: RecipeDifficulty;

  @ApiProperty({ minimum: 1, maximum: 60, example: 5 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  preparation_time_minutes: number;

  @ApiProperty({ maxLength: 80, example: 'Highball' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => value?.trim())
  glass_type: string;

  @ApiPropertyOptional({ maxLength: 200, example: 'Pepino + Cardamomo' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  garnish?: string;

  @ApiPropertyOptional({ maxLength: 80, example: 'Gin' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Transform(({ value }) => value?.trim())
  base_spirit?: string;

  @ApiProperty({ maxLength: 60, example: 'gelado', default: 'gelado' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Transform(({ value }) => value?.trim())
  serving_temp?: string;

  @ApiProperty({ type: [IngredientDto], description: 'List of ingredients' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  ingredients: IngredientDto[];

  @ApiProperty({ type: [String], description: 'Preparation steps in order' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  steps: string[];

  @ApiPropertyOptional({ type: [String], description: 'Tags for categorization' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  tags?: string[];

  @ApiPropertyOptional({ minimum: 0, maximum: 100000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100000)
  price?: number;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsUrl()
  image_url?: string;
}
