import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PromotionsService } from '../promotions.service';
import { Promotion, PromotionType, PromotionStatus } from '../entities/promotion.entity';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { ValidatePromotionDto } from '../dto/validate-promotion.dto';
import { EventsGateway } from '@/modules/events/events.realtime';

describe('PromotionsService', () => {
  let service: PromotionsService;
  let repository: jest.Mocked<Repository<Promotion>>;

  const mockPromotion: Partial<Promotion> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    restaurant_id: 'rest-123',
    code: 'WELCOME10',
    title: '10% off first order',
    description: 'Welcome discount',
    type: PromotionType.PERCENTAGE,
    status: PromotionStatus.ACTIVE,
    discount_value: 10,
    free_item_id: null,
    min_order_value: null,
    max_uses: 100,
    current_uses: 0,
    max_uses_per_user: 1,
    valid_from: new Date('2026-01-01'),
    valid_until: new Date('2026-12-31'),
    days_of_week: null,
    hours_from: null,
    hours_until: null,
    applicable_categories: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockPromotion]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 0 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsService,
        {
          provide: getRepositoryToken(Promotion),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            increment: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: EventsGateway,
          useValue: { emitToRestaurant: jest.fn(), notifyRestaurant: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PromotionsService>(PromotionsService);
    repository = module.get(getRepositoryToken(Promotion));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreatePromotionDto = {
      restaurant_id: 'rest-123',
      code: 'WELCOME10',
      title: '10% off first order',
      type: PromotionType.PERCENTAGE,
      discount_value: 10,
      valid_from: '2026-01-01T00:00:00Z',
      valid_until: '2026-12-31T23:59:59Z',
    };

    it('should create a promotion successfully', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockPromotion as Promotion);
      repository.save.mockResolvedValue(mockPromotion as Promotion);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPromotion);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate code', async () => {
      repository.findOne.mockResolvedValue(mockPromotion as Promotion);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when valid_until is before valid_from', async () => {
      const badDto = {
        ...createDto,
        valid_from: '2026-12-31T00:00:00Z',
        valid_until: '2026-01-01T00:00:00Z',
      };

      await expect(service.create(badDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when percentage exceeds 100', async () => {
      const badDto = {
        ...createDto,
        discount_value: 150,
      };

      repository.findOne.mockResolvedValue(null);

      await expect(service.create(badDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findActiveByRestaurant', () => {
    it('should return active promotions for a restaurant', async () => {
      const result = await service.findActiveByRestaurant('rest-123');

      expect(result).toEqual([mockPromotion]);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('promo');
    });
  });

  describe('findByCode', () => {
    it('should return promotion by code', async () => {
      repository.findOne.mockResolvedValue(mockPromotion as Promotion);

      const result = await service.findByCode('WELCOME10');

      expect(result).toEqual(mockPromotion);
    });

    it('should throw NotFoundException when code not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByCode('NONEXIST')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return promotion by id', async () => {
      repository.findOne.mockResolvedValue(mockPromotion as Promotion);

      const result = await service.findById(mockPromotion.id!);

      expect(result).toEqual(mockPromotion);
    });

    it('should throw NotFoundException when id not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should set promotion status to inactive', async () => {
      repository.findOne.mockResolvedValue({ ...mockPromotion } as Promotion);
      repository.save.mockImplementation(async (promo: any) => promo);

      const result = await service.softDelete(mockPromotion.id!);

      expect(result.status).toBe(PromotionStatus.INACTIVE);
    });
  });

  describe('validate', () => {
    const validateDto: ValidatePromotionDto = {
      code: 'WELCOME10',
      restaurantId: 'rest-123',
      orderValue: 10000,
    };

    it('should return valid result for a valid promotion', async () => {
      repository.findOne.mockResolvedValue(mockPromotion as Promotion);
      repository.increment.mockResolvedValue(undefined as any);

      const result = await service.validate(validateDto);

      expect(result.valid).toBe(true);
      expect(result.discount).toBeDefined();
      expect(result.discount!.type).toBe(PromotionType.PERCENTAGE);
      expect(result.discount!.value).toBe(1000); // 10% of 10000
    });

    it('should return invalid when code not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.validate(validateDto);

      expect(result.valid).toBe(false);
      expect(result.discount).toBeNull();
    });

    it('should return invalid when promotion is inactive', async () => {
      repository.findOne.mockResolvedValue({
        ...mockPromotion,
        status: PromotionStatus.INACTIVE,
      } as Promotion);

      const result = await service.validate(validateDto);

      expect(result.valid).toBe(false);
    });

    it('should return invalid when promotion is expired', async () => {
      repository.findOne.mockResolvedValue({
        ...mockPromotion,
        valid_until: new Date('2020-01-01'),
      } as Promotion);

      const result = await service.validate(validateDto);

      expect(result.valid).toBe(false);
    });

    it('should return invalid when usage limit reached', async () => {
      repository.findOne.mockResolvedValue({
        ...mockPromotion,
        max_uses: 100,
        current_uses: 100,
      } as Promotion);

      const result = await service.validate(validateDto);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('usage limit');
    });

    it('should return invalid when order value below minimum', async () => {
      repository.findOne.mockResolvedValue({
        ...mockPromotion,
        min_order_value: 20000,
      } as Promotion);

      const result = await service.validate({ ...validateDto, orderValue: 5000 });

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Minimum order value');
    });

    it('should calculate fixed discount correctly', async () => {
      repository.findOne.mockResolvedValue({
        ...mockPromotion,
        type: PromotionType.FIXED,
        discount_value: 1500,
      } as Promotion);
      repository.increment.mockResolvedValue(undefined as any);

      const result = await service.validate(validateDto);

      expect(result.valid).toBe(true);
      expect(result.discount!.value).toBe(1500);
    });

    it('should increment usage counter on successful validation', async () => {
      repository.findOne.mockResolvedValue(mockPromotion as Promotion);
      repository.increment.mockResolvedValue(undefined as any);

      await service.validate(validateDto);

      expect(repository.increment).toHaveBeenCalledWith(
        { id: mockPromotion.id },
        'current_uses',
        1,
      );
    });
  });

  describe('update', () => {
    it('should update a promotion successfully', async () => {
      repository.findOne.mockResolvedValueOnce(mockPromotion as Promotion);
      repository.save.mockImplementation(async (promo: any) => promo);

      const result = await service.update(mockPromotion.id!, { title: 'Updated title' });

      expect(result.title).toBe('Updated title');
    });

    it('should throw ConflictException when updating to duplicate code', async () => {
      repository.findOne
        .mockResolvedValueOnce(mockPromotion as Promotion) // findById
        .mockResolvedValueOnce({ ...mockPromotion, id: 'other-id' } as Promotion); // duplicate check

      await expect(
        service.update(mockPromotion.id!, { code: 'DUPLICATE' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
