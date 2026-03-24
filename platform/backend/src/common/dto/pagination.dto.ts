import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PAGINATION } from '@common/constants/limits';

/**
 * Base pagination DTO for list endpoints
 * Provides consistent pagination across all modules
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    minimum: 1,
    default: PAGINATION.DEFAULT_PAGE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = PAGINATION.DEFAULT_PAGE;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: PAGINATION.MAX_PAGE_SIZE,
    default: PAGINATION.DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION.MAX_PAGE_SIZE)
  limit?: number = PAGINATION.DEFAULT_PAGE_SIZE;

  /**
   * Calculate offset for database queries.
   * This is a computed getter — not a required field.
   */
  get offset(): number {
    return ((this.page || PAGINATION.DEFAULT_PAGE) - 1) * (this.limit || PAGINATION.DEFAULT_PAGE_SIZE);
  }
}

/**
 * Paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  constructor(items: T[], total: number, page: number, limit: number) {
    this.items = items;
    const totalPages = Math.ceil(total / limit);
    this.meta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}

/**
 * Helper function to create paginated response
 */
export function paginate<T>(
  items: T[],
  total: number,
  pagination: PaginationDto,
): PaginatedResponseDto<T> {
  return new PaginatedResponseDto(
    items,
    total,
    pagination.page || PAGINATION.DEFAULT_PAGE,
    pagination.limit || PAGINATION.DEFAULT_PAGE_SIZE,
  );
}

/**
 * Create a proper PaginationDto instance from a plain object.
 * Ensures the `offset` getter is available even when constructed from raw params.
 */
export function toPaginationDto(params?: Partial<PaginationDto>): PaginationDto {
  const dto = new PaginationDto();
  if (params?.page) dto.page = params.page;
  if (params?.limit) dto.limit = params.limit;
  return dto;
}
