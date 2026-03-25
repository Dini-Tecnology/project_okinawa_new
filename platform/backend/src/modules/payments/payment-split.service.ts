import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef, Logger } from '@nestjs/common';
import { UserRole } from '@/common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentSplit, PaymentSplitMode, PaymentSplitStatus } from './entities/payment-split.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderGuest, OrderGuestStatus } from '../orders/entities/order-guest.entity';
import { CreatePaymentSplitDto } from './dto/create-payment-split.dto';
import { CalculateSplitDto } from './dto/calculate-split.dto';
import { ProcessSplitPaymentDto } from './dto/process-split-payment.dto';
import { OrderStatus } from '@/common/enums';
import { PaymentsService } from './payments.service';

export interface SplitCalculation {
  guest_user_id: string;
  guest_name: string;
  amount_due: number;
  service_charge: number;
  tip_amount: number;
  total: number;
  items?: Array<{ item_id: string; name: string; quantity: number; price: number }>;
}

@Injectable()
export class PaymentSplitService {
  private readonly logger = new Logger(PaymentSplitService.name);

  constructor(
    @InjectRepository(PaymentSplit)
    private paymentSplitRepository: Repository<PaymentSplit>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(OrderGuest)
    private orderGuestsRepository: Repository<OrderGuest>,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
  ) {}

  /**
   * Calculate split amounts based on mode
   */
  async calculateSplit(calculateDto: CalculateSplitDto): Promise<SplitCalculation[]> {
    const order = await this.ordersRepository.findOne({
      where: { id: calculateDto.order_id },
      relations: ['items', 'items.ordered_by_user', 'guests', 'guests.guest_user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const SERVICE_CHARGE_RATE = 0.10; // 10%

    switch (calculateDto.split_mode) {
      case PaymentSplitMode.INDIVIDUAL:
        return this.calculateIndividualSplit(order, SERVICE_CHARGE_RATE);

      case PaymentSplitMode.SPLIT_EQUAL:
        return this.calculateEqualSplit(order, SERVICE_CHARGE_RATE);

      case PaymentSplitMode.SPLIT_SELECTIVE:
        if (!calculateDto.selected_items || calculateDto.selected_items.length === 0) {
          throw new BadRequestException('Selected items required for selective mode');
        }
        return this.calculateSelectiveSplit(
          order,
          calculateDto.selected_items,
          SERVICE_CHARGE_RATE,
        );

      default:
        throw new BadRequestException('Invalid split mode');
    }
  }

  /**
   * INDIVIDUAL MODE: Each guest pays only their own items
   */
  private async calculateIndividualSplit(
    order: Order,
    serviceChargeRate: number,
  ): Promise<SplitCalculation[]> {
    const calculations: SplitCalculation[] = [];
    const guests = order.guests || [];

    // Group items by ordered_by
    const itemsByGuest = new Map<string, OrderItem[]>();

    for (const item of order.items) {
      const guestId = item.ordered_by || order.user_id;
      if (!itemsByGuest.has(guestId)) {
        itemsByGuest.set(guestId, []);
      }
      itemsByGuest.get(guestId)!.push(item);
    }

    // Calculate for each guest
    for (const [guestId, items] of itemsByGuest.entries()) {
      const subtotal = items.reduce((sum, item) => sum + parseFloat(item.total_price.toString()), 0);
      const serviceCharge = subtotal * serviceChargeRate;
      const total = subtotal + serviceCharge;

      const guest = guests.find((g) => g.guest_user_id === guestId);
      const guestName = guest?.guest_name || (guestId === order.user_id ? 'Host' : 'Unknown');

      calculations.push({
        guest_user_id: guestId,
        guest_name: guestName,
        amount_due: subtotal,
        service_charge: serviceCharge,
        tip_amount: 0,
        total,
        items: items.map((i) => ({
          item_id: i.id,
          name: i.menu_item?.name || 'Item',
          quantity: i.quantity,
          price: i.total_price,
        })),
      });
    }

    return calculations;
  }

  /**
   * SPLIT_EQUAL MODE: Divide total equally among all guests
   */
  private async calculateEqualSplit(
    order: Order,
    serviceChargeRate: number,
  ): Promise<SplitCalculation[]> {
    const calculations: SplitCalculation[] = [];
    const guests = order.guests || [];
    const totalGuests = guests.length + 1; // guests + host

    const subtotal = parseFloat(order.subtotal.toString());
    const totalServiceCharge = subtotal * serviceChargeRate;
    const grandTotal = subtotal + totalServiceCharge;

    const amountPerGuest = grandTotal / totalGuests;
    const subtotalPerGuest = subtotal / totalGuests;
    const serviceChargePerGuest = totalServiceCharge / totalGuests;

    // Host
    calculations.push({
      guest_user_id: order.user_id,
      guest_name: 'Host',
      amount_due: subtotalPerGuest,
      service_charge: serviceChargePerGuest,
      tip_amount: 0,
      total: amountPerGuest,
    });

    // Guests
    for (const guest of guests) {
      calculations.push({
        guest_user_id: guest.guest_user_id,
        guest_name: guest.guest_name,
        amount_due: subtotalPerGuest,
        service_charge: serviceChargePerGuest,
        tip_amount: 0,
        total: amountPerGuest,
      });
    }

    return calculations;
  }

  /**
   * SPLIT_SELECTIVE MODE: Guest selects specific items or custom amount
   */
  private async calculateSelectiveSplit(
    order: Order,
    selectedItemIds: string[],
    serviceChargeRate: number,
  ): Promise<SplitCalculation[]> {
    const selectedItems = order.items.filter((item) => selectedItemIds.includes(item.id));

    if (selectedItems.length === 0) {
      throw new BadRequestException('No valid items selected');
    }

    const subtotal = selectedItems.reduce(
      (sum, item) => sum + parseFloat(item.total_price.toString()),
      0,
    );
    const serviceCharge = subtotal * serviceChargeRate;
    const total = subtotal + serviceCharge;

    return [
      {
        guest_user_id: order.user_id, // Will be updated with actual guest
        guest_name: 'Selected Items',
        amount_due: subtotal,
        service_charge: serviceCharge,
        tip_amount: 0,
        total,
        items: selectedItems.map((i) => ({
          item_id: i.id,
          name: i.menu_item?.name || 'Item',
          quantity: i.quantity,
          price: i.total_price,
        })),
      },
    ];
  }

  /**
   * Create payment split records for an order
   */
  async createPaymentSplits(
    orderId: string,
    splitMode: PaymentSplitMode,
  ): Promise<PaymentSplit[]> {
    const calculations = await this.calculateSplit({
      order_id: orderId,
      split_mode: splitMode,
    });

    const splits: PaymentSplit[] = [];

    for (const calc of calculations) {
      const split = this.paymentSplitRepository.create({
        order_id: orderId,
        guest_user_id: calc.guest_user_id,
        split_mode: splitMode,
        amount_due: calc.total,
        amount_paid: 0,
        service_charge: calc.service_charge,
        tip_amount: calc.tip_amount,
        status: PaymentSplitStatus.PENDING,
      });

      splits.push(await this.paymentSplitRepository.save(split));
    }

    // Update order
    await this.ordersRepository.update(orderId, {
      is_shared: true,
      payment_split_mode: splitMode,
    });

    return splits;
  }

  /**
   * Create a single payment split
   */
  async createPaymentSplit(createDto: CreatePaymentSplitDto): Promise<PaymentSplit> {
    const order = await this.ordersRepository.findOne({
      where: { id: createDto.order_id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const split = this.paymentSplitRepository.create({
      ...createDto,
      status: PaymentSplitStatus.PENDING,
      amount_paid: 0,
    });

    return this.paymentSplitRepository.save(split);
  }

  /**
   * Get all payment splits for an order
   */
  async getOrderSplits(orderId: string, userId?: string, roles?: UserRole[]): Promise<PaymentSplit[]> {
    // If userId and roles provided, verify access
    if (userId && roles) {
      const isStaff = roles.some(role =>
        [UserRole.OWNER, UserRole.MANAGER, UserRole.WAITER].includes(role)
      );

      if (!isStaff) {
        // Check if user is the order owner or a guest
        const order = await this.ordersRepository.findOne({
          where: { id: orderId },
          relations: ['guests'],
        });

        if (!order) {
          throw new NotFoundException('Order not found');
        }

        const isOrderOwner = order.user_id === userId;
        const isGuest = order.guests?.some(g => g.guest_user_id === userId);

        if (!isOrderOwner && !isGuest) {
          throw new ForbiddenException('Access denied - not authorized for this order');
        }
      }
    }

    return this.paymentSplitRepository.find({
      where: { order_id: orderId },
      relations: ['guest_user', 'payment'],
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Get splits for a specific guest
   */
  async getGuestSplits(userId: string): Promise<PaymentSplit[]> {
    return this.paymentSplitRepository.find({
      where: { guest_user_id: userId },
      relations: ['order', 'order.restaurant', 'payment'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Process payment for a split
   */
  async processSplitPayment(processDto: ProcessSplitPaymentDto): Promise<PaymentSplit> {
    const split = await this.paymentSplitRepository.findOne({
      where: { id: processDto.split_id },
      relations: ['order'],
    });

    if (!split) {
      throw new NotFoundException('Payment split not found');
    }

    if (split.status === PaymentSplitStatus.PAID) {
      throw new BadRequestException('Split already paid');
    }

    // Process payment via PaymentsService if payment method requires it
    if (processDto.payment_method && processDto.payment_method !== 'cash') {
      try {
        // Map PaymentMethodType to PaymentMethod enum used by PaymentsService
        const paymentMethodMap: Record<string, string> = {
          'credit_card': 'credit_card',
          'debit_card': 'debit_card',
          'pix': 'pix',
          'wallet': 'wallet',
          'cash': 'cash',
          'voucher': 'wallet', // voucher processed as wallet payment
        };

        const mappedPaymentMethod = paymentMethodMap[processDto.payment_method] || processDto.payment_method;

        const paymentResult = await this.paymentsService.processPayment(
          split.guest_user_id,
          {
            order_id: split.order_id,
            amount: processDto.amount,
            payment_method: mappedPaymentMethod as any,
            // Pass payment details from DTO
            pix_key: processDto.payment_details?.pix_key,
          },
        );

        this.logger.log(`Split payment processed: ${paymentResult.transaction_id}`);

        // Store transaction reference
        split.payment_transaction_id = paymentResult.transaction_id;
      } catch (error) {
        const err = error as Error;
        this.logger.error(`Split payment failed: ${err.message}`);
        throw new BadRequestException(`Payment processing failed: ${err.message}`);
      }
    }

    // Update split
    split.amount_paid = processDto.amount;
    split.status =
      split.amount_paid >= parseFloat(split.amount_due.toString())
        ? PaymentSplitStatus.PAID
        : PaymentSplitStatus.PARTIALLY_PAID;

    if (split.status === PaymentSplitStatus.PAID) {
      split.paid_at = new Date();
    }

    const updated = await this.paymentSplitRepository.save(split);

    // Update order guest status
    const orderGuestStatus = split.status === PaymentSplitStatus.PAID
      ? OrderGuestStatus.PAYMENT_COMPLETED
      : OrderGuestStatus.PAYMENT_PENDING;

    await this.orderGuestsRepository.update(
      {
        order_id: split.order_id,
        guest_user_id: split.guest_user_id,
      },
      {
        amount_paid: processDto.amount,
        payment_completed: split.status === PaymentSplitStatus.PAID,
        payment_completed_at: split.paid_at || undefined,
        status: orderGuestStatus,
      },
    );

    // Check if all splits are paid
    await this.checkOrderPaymentComplete(split.order_id);

    return updated;
  }

  /**
   * Check if all splits are paid and complete order
   */
  private async checkOrderPaymentComplete(orderId: string): Promise<void> {
    const splits = await this.paymentSplitRepository.find({
      where: { order_id: orderId },
    });

    const allPaid = splits.every((s) => s.status === PaymentSplitStatus.PAID);

    if (allPaid) {
      await this.ordersRepository.update(orderId, {
        status: OrderStatus.COMPLETED,
        completed_at: new Date(),
      });
    }
  }

  /**
   * Get payment status summary for an order
   */
  async getPaymentStatus(orderId: string): Promise<any> {
    const splits = await this.getOrderSplits(orderId);
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const totalDue = splits.reduce((sum, s) => sum + parseFloat(s.amount_due.toString()), 0);
    const totalPaid = splits.reduce((sum, s) => sum + parseFloat(s.amount_paid.toString()), 0);
    const remaining = totalDue - totalPaid;

    return {
      order_id: orderId,
      total_due: totalDue,
      total_paid: totalPaid,
      remaining,
      splits: splits.map((s) => ({
        guest_user_id: s.guest_user_id,
        guest_name: s.guest_user?.full_name || 'Guest',
        amount_due: s.amount_due,
        amount_paid: s.amount_paid,
        status: s.status,
        paid_at: s.paid_at,
      })),
      all_paid: remaining <= 0,
    };
  }
}
