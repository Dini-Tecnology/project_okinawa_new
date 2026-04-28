import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Promotion,
  PromotionType,
  PromotionStatus,
} from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { EventsGateway } from '@/modules/events/events.realtime';

export interface PromotionValidationResult {
  valid: boolean;
  discount: {
    type: PromotionType;
    value: number;
  } | null;
  message?: string;
}

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Create a new promotion
   */
  async create(dto: CreatePromotionDto): Promise<Promotion> {
    // Validate date range
    const validFrom = new Date(dto.valid_from);
    const validUntil = new Date(dto.valid_until);

    if (validUntil <= validFrom) {
      throw new BadRequestException(
        'Valid until date must be after valid from date',
      );
    }

    // Validate percentage max 100
    if (
      dto.type === PromotionType.PERCENTAGE &&
      dto.discount_value &&
      dto.discount_value > 100
    ) {
      throw new BadRequestException(
        'Percentage discount cannot exceed 100',
      );
    }

    // Check for duplicate code within the same restaurant
    const existing = await this.promotionRepository.findOne({
      where: {
        code: dto.code,
        restaurant_id: dto.restaurant_id,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Promotion code "${dto.code}" already exists for this restaurant`,
      );
    }

    // Determine initial status
    const now = new Date();
    let status = dto.status || PromotionStatus.ACTIVE;
    if (validFrom > now && status === PromotionStatus.ACTIVE) {
      status = PromotionStatus.SCHEDULED;
    }

    const promotion = this.promotionRepository.create({
      ...dto,
      status,
      valid_from: validFrom,
      valid_until: validUntil,
      current_uses: 0,
    });

    const saved = await this.promotionRepository.save(promotion);

    this.eventsGateway.notifyRestaurant(saved.restaurant_id, {
      type: 'promotion:created',
      promotion_id: saved.id,
      code: saved.code,
      status: saved.status,
    });

    return saved;
  }

  /**
   * List active promotions for a restaurant (public-facing)
   */
  async findActiveByRestaurant(restaurantId: string): Promise<Promotion[]> {
    const now = new Date();

    return this.promotionRepository
      .createQueryBuilder('promo')
      .where('promo.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('promo.status = :status', { status: PromotionStatus.ACTIVE })
      .andWhere('promo.valid_from <= :now', { now })
      .andWhere('promo.valid_until >= :now', { now })
      .andWhere(
        '(promo.max_uses IS NULL OR promo.current_uses < promo.max_uses)',
      )
      .orderBy('promo.created_at', 'DESC')
      .getMany();
  }

  /**
   * List all promotions for a restaurant (management view)
   */
  async findAllByRestaurant(restaurantId: string): Promise<Promotion[]> {
    // Auto-expire promotions that have passed their valid_until date
    await this.autoExpirePromotions(restaurantId);

    return this.promotionRepository.find({
      where: { restaurant_id: restaurantId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Find promotion by code
   */
  async findByCode(code: string): Promise<Promotion> {
    const normalizedCode = code.toUpperCase().replace(/\s/g, '');

    const promotion = await this.promotionRepository.findOne({
      where: { code: normalizedCode },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with code "${code}" not found`);
    }

    return promotion;
  }

  /**
   * Find promotion by ID
   */
  async findById(id: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with id "${id}" not found`);
    }

    return promotion;
  }

  /**
   * Update a promotion
   */
  async update(id: string, updateDto: Partial<CreatePromotionDto>): Promise<Promotion> {
    const promotion = await this.findById(id);

    // If code is being changed, check for duplicates
    if (updateDto.code && updateDto.code !== promotion.code) {
      const existing = await this.promotionRepository.findOne({
        where: {
          code: updateDto.code,
          restaurant_id: promotion.restaurant_id,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Promotion code "${updateDto.code}" already exists for this restaurant`,
        );
      }
    }

    // Validate date range if both dates provided
    if (updateDto.valid_from && updateDto.valid_until) {
      const validFrom = new Date(updateDto.valid_from);
      const validUntil = new Date(updateDto.valid_until);
      if (validUntil <= validFrom) {
        throw new BadRequestException(
          'Valid until date must be after valid from date',
        );
      }
    }

    // Validate percentage max 100
    const newType = updateDto.type || promotion.type;
    const newValue = updateDto.discount_value ?? promotion.discount_value;
    if (
      newType === PromotionType.PERCENTAGE &&
      newValue !== null &&
      newValue > 100
    ) {
      throw new BadRequestException(
        'Percentage discount cannot exceed 100',
      );
    }

    Object.assign(promotion, updateDto);

    const saved = await this.promotionRepository.save(promotion);

    this.eventsGateway.notifyRestaurant(saved.restaurant_id, {
      type: 'promotion:updated',
      promotion_id: saved.id,
      code: saved.code,
      status: saved.status,
    });

    return saved;
  }

  /**
   * Soft delete (set status to inactive)
   */
  async softDelete(id: string): Promise<Promotion> {
    const promotion = await this.findById(id);
    promotion.status = PromotionStatus.INACTIVE;
    const saved = await this.promotionRepository.save(promotion);

    this.eventsGateway.notifyRestaurant(saved.restaurant_id, {
      type: 'promotion:deactivated',
      promotion_id: saved.id,
      code: saved.code,
    });

    return saved;
  }

  /**
   * Validate a coupon code at checkout
   */
  async validate(dto: ValidatePromotionDto): Promise<PromotionValidationResult> {
    const normalizedCode = dto.code.toUpperCase().replace(/\s/g, '');

    // Find the promotion
    const promotion = await this.promotionRepository.findOne({
      where: {
        code: normalizedCode,
        restaurant_id: dto.restaurantId,
      },
    });

    if (!promotion) {
      return {
        valid: false,
        discount: null,
        message: 'Coupon code not found',
      };
    }

    // Check status
    if (promotion.status !== PromotionStatus.ACTIVE) {
      return {
        valid: false,
        discount: null,
        message: `Promotion is ${promotion.status}`,
      };
    }

    // Check date validity
    const now = new Date();
    if (now < promotion.valid_from) {
      return {
        valid: false,
        discount: null,
        message: 'Promotion has not started yet',
      };
    }

    if (now > promotion.valid_until) {
      return {
        valid: false,
        discount: null,
        message: 'Promotion has expired',
      };
    }

    // Check total uses
    if (
      promotion.max_uses !== null &&
      promotion.current_uses >= promotion.max_uses
    ) {
      return {
        valid: false,
        discount: null,
        message: 'Promotion usage limit reached',
      };
    }

    // Check minimum order value
    if (
      promotion.min_order_value !== null &&
      dto.orderValue < promotion.min_order_value
    ) {
      return {
        valid: false,
        discount: null,
        message: `Minimum order value is ${promotion.min_order_value} cents`,
      };
    }

    // Check happy hour constraints
    if (promotion.type === PromotionType.HAPPY_HOUR) {
      const dayOfWeek = now.getDay();
      if (
        promotion.days_of_week &&
        !promotion.days_of_week.includes(dayOfWeek)
      ) {
        return {
          valid: false,
          discount: null,
          message: 'Promotion not available today',
        };
      }

      if (promotion.hours_from && promotion.hours_until) {
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (
          currentTime < promotion.hours_from ||
          currentTime > promotion.hours_until
        ) {
          return {
            valid: false,
            discount: null,
            message: `Promotion available only between ${promotion.hours_from} and ${promotion.hours_until}`,
          };
        }
      }
    }

    // Calculate discount value
    let discountAmount: number;
    switch (promotion.type) {
      case PromotionType.PERCENTAGE:
        discountAmount = Math.floor(
          (dto.orderValue * (promotion.discount_value || 0)) / 100,
        );
        break;
      case PromotionType.FIXED:
        discountAmount = promotion.discount_value || 0;
        break;
      case PromotionType.FREE_ITEM:
        discountAmount = 0; // Item-level discount handled differently
        break;
      case PromotionType.BOGO:
        discountAmount = 0; // Item-level discount handled differently
        break;
      case PromotionType.HAPPY_HOUR:
        discountAmount = Math.floor(
          (dto.orderValue * (promotion.discount_value || 0)) / 100,
        );
        break;
      default:
        discountAmount = 0;
    }

    // Increment usage counter
    await this.promotionRepository.increment(
      { id: promotion.id },
      'current_uses',
      1,
    );

    return {
      valid: true,
      discount: {
        type: promotion.type,
        value: discountAmount,
      },
      message: `Coupon "${promotion.code}" applied successfully`,
    };
  }

  /**
   * Auto-expire promotions past their valid_until date
   */
  private async autoExpirePromotions(restaurantId: string): Promise<void> {
    const now = new Date();

    await this.promotionRepository
      .createQueryBuilder()
      .update(Promotion)
      .set({ status: PromotionStatus.EXPIRED })
      .where('restaurant_id = :restaurantId', { restaurantId })
      .andWhere('status = :activeStatus', {
        activeStatus: PromotionStatus.ACTIVE,
      })
      .andWhere('valid_until < :now', { now })
      .execute();

    // Also activate scheduled promotions whose start date has passed
    await this.promotionRepository
      .createQueryBuilder()
      .update(Promotion)
      .set({ status: PromotionStatus.ACTIVE })
      .where('restaurant_id = :restaurantId', { restaurantId })
      .andWhere('status = :scheduledStatus', {
        scheduledStatus: PromotionStatus.SCHEDULED,
      })
      .andWhere('valid_from <= :now', { now })
      .andWhere('valid_until >= :now', { now })
      .execute();
  }
}
