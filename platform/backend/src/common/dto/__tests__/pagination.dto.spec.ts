import {
  PaginationDto,
  PaginatedResponseDto,
  paginate,
  toPaginationDto,
} from '../pagination.dto';
import { PAGINATION } from '@common/constants/limits';

describe('PaginationDto', () => {
  describe('default values', () => {
    it('should have DEFAULT_PAGE as the default page', () => {
      const dto = new PaginationDto();
      expect(dto.page).toBe(PAGINATION.DEFAULT_PAGE);
    });

    it('should have DEFAULT_PAGE_SIZE as the default limit', () => {
      const dto = new PaginationDto();
      expect(dto.limit).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
    });
  });

  describe('offset getter', () => {
    it('should return 0 for page 1', () => {
      const dto = new PaginationDto();
      dto.page = 1;
      dto.limit = 20;
      expect(dto.offset).toBe(0);
    });

    it('should calculate offset correctly for page 2', () => {
      const dto = new PaginationDto();
      dto.page = 2;
      dto.limit = 20;
      expect(dto.offset).toBe(20);
    });

    it('should calculate offset correctly for page 3 with limit 15', () => {
      const dto = new PaginationDto();
      dto.page = 3;
      dto.limit = 15;
      expect(dto.offset).toBe(30);
    });

    it('should use defaults when page is undefined', () => {
      const dto = new PaginationDto();
      dto.page = undefined;
      dto.limit = 10;
      expect(dto.offset).toBe(0);
    });

    it('should use defaults when limit is undefined', () => {
      const dto = new PaginationDto();
      dto.page = 2;
      dto.limit = undefined;
      expect(dto.offset).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
    });
  });
});

describe('PaginatedResponseDto', () => {
  it('should calculate totalPages correctly', () => {
    const response = new PaginatedResponseDto(['a', 'b', 'c'], 10, 1, 3);
    expect(response.meta.totalPages).toBe(4); // ceil(10/3)
  });

  it('should set hasNextPage to true when there are more pages', () => {
    const response = new PaginatedResponseDto(['a'], 10, 1, 5);
    expect(response.meta.hasNextPage).toBe(true);
  });

  it('should set hasNextPage to false on last page', () => {
    const response = new PaginatedResponseDto(['a'], 5, 1, 5);
    expect(response.meta.hasNextPage).toBe(false);
  });

  it('should set hasPreviousPage to false on page 1', () => {
    const response = new PaginatedResponseDto(['a'], 10, 1, 5);
    expect(response.meta.hasPreviousPage).toBe(false);
  });

  it('should set hasPreviousPage to true on page > 1', () => {
    const response = new PaginatedResponseDto(['a'], 10, 2, 5);
    expect(response.meta.hasPreviousPage).toBe(true);
  });

  it('should handle empty results', () => {
    const response = new PaginatedResponseDto([], 0, 1, 20);
    expect(response.items).toEqual([]);
    expect(response.meta.total).toBe(0);
    expect(response.meta.totalPages).toBe(0);
    expect(response.meta.hasNextPage).toBe(false);
    expect(response.meta.hasPreviousPage).toBe(false);
  });
});

describe('paginate helper', () => {
  it('should create a PaginatedResponseDto from items, total, and PaginationDto', () => {
    const dto = new PaginationDto();
    dto.page = 1;
    dto.limit = 10;
    const items = ['a', 'b', 'c'];

    const result = paginate(items, 3, dto);

    expect(result.items).toEqual(items);
    expect(result.meta.total).toBe(3);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.totalPages).toBe(1);
  });

  it('should use default values when page and limit are not set', () => {
    const dto = new PaginationDto();
    const result = paginate([], 100, dto);

    expect(result.meta.page).toBe(PAGINATION.DEFAULT_PAGE);
    expect(result.meta.limit).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
    expect(result.meta.totalPages).toBe(Math.ceil(100 / PAGINATION.DEFAULT_PAGE_SIZE));
  });
});

describe('toPaginationDto helper', () => {
  it('should create a proper PaginationDto from a plain object', () => {
    const dto = toPaginationDto({ page: 3, limit: 25 });

    expect(dto).toBeInstanceOf(PaginationDto);
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(25);
    expect(dto.offset).toBe(50); // (3-1) * 25
  });

  it('should use defaults when called with undefined', () => {
    const dto = toPaginationDto(undefined);

    expect(dto).toBeInstanceOf(PaginationDto);
    expect(dto.page).toBe(PAGINATION.DEFAULT_PAGE);
    expect(dto.limit).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
    expect(dto.offset).toBe(0);
  });

  it('should use defaults when called with empty object', () => {
    const dto = toPaginationDto({});

    expect(dto).toBeInstanceOf(PaginationDto);
    expect(dto.page).toBe(PAGINATION.DEFAULT_PAGE);
    expect(dto.limit).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
    expect(dto.offset).toBe(0);
  });

  it('should preserve the offset getter on the resulting instance', () => {
    const dto = toPaginationDto({ page: 5, limit: 10 });
    expect(dto.offset).toBe(40); // (5-1) * 10
  });

  it('should handle partial params (only page)', () => {
    const dto = toPaginationDto({ page: 2 });
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(PAGINATION.DEFAULT_PAGE_SIZE);
    expect(dto.offset).toBe(PAGINATION.DEFAULT_PAGE_SIZE); // (2-1) * DEFAULT
  });

  it('should handle partial params (only limit)', () => {
    const dto = toPaginationDto({ limit: 50 });
    expect(dto.page).toBe(PAGINATION.DEFAULT_PAGE);
    expect(dto.limit).toBe(50);
    expect(dto.offset).toBe(0);
  });
});
