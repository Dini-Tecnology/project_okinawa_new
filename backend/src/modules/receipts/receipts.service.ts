import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt, ReceiptItemSnapshot } from './entities/receipt.entity';
import { PaginationDto, PaginatedResponseDto } from '@/common/dto/pagination.dto';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
  ) {}

  /**
   * Generate a receipt for a completed order.
   * In a production implementation, this would fetch the actual order and payment data
   * from the OrdersService and PaymentsService. For now, it accepts the data directly
   * to allow the mobile screen to create receipts with real persistence.
   */
  async generate(
    orderId: string,
    paymentId: string | null,
    userId: string,
    restaurantId: string,
    items: ReceiptItemSnapshot[],
    subtotal: number,
    serviceFee: number,
    tip: number,
    total: number,
    paymentMethod: string,
  ): Promise<Receipt> {
    // Check if receipt already exists for this order
    const existing = await this.receiptRepository.findOne({
      where: { order_id: orderId },
    });

    if (existing) {
      throw new ConflictException('Receipt already exists for this order');
    }

    const receipt = this.receiptRepository.create({
      order_id: orderId,
      payment_id: paymentId,
      user_id: userId,
      restaurant_id: restaurantId,
      items_snapshot: items,
      subtotal,
      service_fee: serviceFee,
      tip,
      total,
      payment_method: paymentMethod,
      generated_at: new Date(),
    });

    return this.receiptRepository.save(receipt);
  }

  /**
   * Find a receipt by order ID.
   */
  async findByOrder(orderId: string): Promise<Receipt> {
    const receipt = await this.receiptRepository.findOne({
      where: { order_id: orderId },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found for this order');
    }

    return receipt;
  }

  /**
   * Find all receipts for a user with pagination.
   */
  async findByUser(userId: string, pagination: PaginationDto): Promise<PaginatedResponseDto<Receipt>> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.receiptRepository.findAndCount({
      where: { user_id: userId },
      order: { generated_at: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginatedResponseDto(items, total, page, limit);
  }
}
