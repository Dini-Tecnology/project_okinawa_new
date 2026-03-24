import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Tab, TabMember, TabItem, TabPayment } from './entities';
import { TabStatus, TabType, TabMemberRole, TabMemberStatus, OrderItemStatus } from '@/common/enums';
import { PaymentSplitStatus } from '@/modules/payments/entities/payment-split.entity';
import { CreateTabDto, AddTabItemDto, JoinTabDto, ProcessTabPaymentDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TabsService {
  constructor(
    @InjectRepository(Tab)
    private tabRepository: Repository<Tab>,
    @InjectRepository(TabMember)
    private tabMemberRepository: Repository<TabMember>,
    @InjectRepository(TabItem)
    private tabItemRepository: Repository<TabItem>,
    @InjectRepository(TabPayment)
    private tabPaymentRepository: Repository<TabPayment>,
  ) {}

  /**
   * Create a new tab (individual or group)
   */
  async createTab(userId: string, dto: CreateTabDto): Promise<Tab> {
    // Check for existing open tab for this user at this restaurant
    const existingTab = await this.tabRepository.findOne({
      where: {
        restaurant_id: dto.restaurant_id,
        host_user_id: userId,
        status: TabStatus.OPEN,
      },
    });

    if (existingTab) {
      throw new BadRequestException('You already have an open tab at this restaurant');
    }

    // Create the tab
    const tab = this.tabRepository.create({
      restaurant_id: dto.restaurant_id,
      table_id: dto.table_id,
      host_user_id: userId,
      type: dto.type || TabType.INDIVIDUAL,
      status: TabStatus.OPEN,
      cover_charge_credit: dto.cover_charge_credit || 0,
      deposit_credit: dto.deposit_credit || 0,
      preauth_amount: dto.preauth_amount,
      preauth_transaction_id: dto.preauth_transaction_id,
      invite_token: dto.type === TabType.GROUP ? uuidv4() : undefined,
    } as DeepPartial<Tab>);

    const savedTab = await this.tabRepository.save(tab as Tab);

    // Add host as first member
    await this.tabMemberRepository.save({
      tab_id: savedTab.id,
      user_id: userId,
      role: TabMemberRole.HOST,
      status: TabMemberStatus.ACTIVE,
      credit_contribution: (dto.cover_charge_credit || 0) + (dto.deposit_credit || 0),
    });

    return this.findById(savedTab.id);
  }

  /**
   * Find tab by ID with relations
   */
  async findById(id: string): Promise<Tab> {
    const tab = await this.tabRepository.findOne({
      where: { id },
      relations: ['members', 'members.user', 'items', 'items.menu_item', 'payments'],
    });

    if (!tab) {
      throw new NotFoundException('Tab not found');
    }

    return tab;
  }

  /**
   * Join an existing group tab
   */
  async joinTab(userId: string, dto: JoinTabDto): Promise<TabMember> {
    const tab = await this.tabRepository.findOne({
      where: { invite_token: dto.invite_token, status: TabStatus.OPEN },
      relations: ['members'],
    });

    if (!tab) {
      throw new NotFoundException('Tab not found or already closed');
    }

    if (tab.type !== TabType.GROUP) {
      throw new BadRequestException('Cannot join an individual tab');
    }

    // Check if already a member
    const existingMember = tab.members.find(m => m.user_id === userId);
    if (existingMember) {
      if (existingMember.status === TabMemberStatus.ACTIVE) {
        throw new BadRequestException('Already a member of this tab');
      }
      // Rejoin if left
      existingMember.status = TabMemberStatus.ACTIVE;
      existingMember.left_at = null as unknown as Date;
      return this.tabMemberRepository.save(existingMember);
    }

    // Check max members (could be configured per restaurant)
    const MAX_MEMBERS = 10;
    const activeMembers = tab.members.filter(m => m.status === TabMemberStatus.ACTIVE);
    if (activeMembers.length >= MAX_MEMBERS) {
      throw new BadRequestException('Tab has reached maximum number of members');
    }

    const member = this.tabMemberRepository.create({
      tab_id: tab.id,
      user_id: userId,
      role: TabMemberRole.MEMBER,
      status: TabMemberStatus.ACTIVE,
      credit_contribution: dto.credit_contribution || 0,
    });

    // Update tab credits
    if (dto.credit_contribution) {
      tab.cover_charge_credit = Number(tab.cover_charge_credit) + dto.credit_contribution;
      await this.tabRepository.save(tab);
    }

    return this.tabMemberRepository.save(member);
  }

  /**
   * Leave a tab
   */
  async leaveTab(tabId: string, userId: string): Promise<void> {
    const tab = await this.findById(tabId);
    const member = tab.members.find(m => m.user_id === userId);

    if (!member) {
      throw new NotFoundException('You are not a member of this tab');
    }

    if (member.role === TabMemberRole.HOST) {
      throw new BadRequestException('Host cannot leave the tab. Close it instead.');
    }

    // Check if member has unpaid consumption
    if (member.amount_consumed > member.amount_paid) {
      throw new BadRequestException('You must pay your consumption before leaving');
    }

    member.status = TabMemberStatus.LEFT;
    member.left_at = new Date();
    await this.tabMemberRepository.save(member);
  }

  /**
   * Remove a member from tab (host only)
   */
  async removeMember(tabId: string, hostUserId: string, memberUserId: string): Promise<void> {
    const tab = await this.findById(tabId);

    // Verify host
    const host = tab.members.find(m => m.user_id === hostUserId && m.role === TabMemberRole.HOST);
    if (!host) {
      throw new ForbiddenException('Only the host can remove members');
    }

    const member = tab.members.find(m => m.user_id === memberUserId);
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === TabMemberRole.HOST) {
      throw new BadRequestException('Cannot remove the host');
    }

    // Check if member has unpaid consumption
    if (member.amount_consumed > member.amount_paid) {
      throw new BadRequestException('Member must pay their consumption before being removed');
    }

    member.status = TabMemberStatus.REMOVED;
    member.left_at = new Date();
    await this.tabMemberRepository.save(member);
  }

  /**
   * Add item to tab
   */
  async addItem(tabId: string, userId: string, dto: AddTabItemDto): Promise<TabItem> {
    const tab = await this.findById(tabId);

    if (tab.status !== TabStatus.OPEN) {
      throw new BadRequestException('Tab is not open');
    }

    // Verify user is a member
    const member = tab.members.find(m => m.user_id === userId && m.status === TabMemberStatus.ACTIVE);
    if (!member) {
      throw new ForbiddenException('You are not an active member of this tab');
    }

    const totalPrice = dto.quantity * dto.unit_price - (dto.discount_amount || 0);

    const item = this.tabItemRepository.create({
      tab_id: tabId,
      menu_item_id: dto.menu_item_id,
      ordered_by_user_id: userId,
      quantity: dto.quantity,
      unit_price: dto.unit_price,
      discount_amount: dto.discount_amount || 0,
      discount_reason: dto.discount_reason,
      total_price: totalPrice,
      status: OrderItemStatus.PENDING,
      customizations: dto.customizations,
      special_instructions: dto.special_instructions,
      is_round_repeat: dto.is_round_repeat || false,
    });

    const savedItem = await this.tabItemRepository.save(item);

    // Update tab subtotal
    await this.updateTabTotals(tabId);

    // Update member consumption tracking
    member.amount_consumed = Number(member.amount_consumed) + totalPrice;
    await this.tabMemberRepository.save(member);

    return savedItem;
  }

  /**
   * Repeat last round (reorder last items for each member)
   */
  async repeatRound(tabId: string, userId: string): Promise<TabItem[]> {
    const tab = await this.findById(tabId);

    if (tab.status !== TabStatus.OPEN) {
      throw new BadRequestException('Tab is not open');
    }

    // Get the most recent items for each member
    const lastItems = await this.tabItemRepository
      .createQueryBuilder('item')
      .where('item.tab_id = :tabId', { tabId })
      .distinctOn(['item.ordered_by_user_id', 'item.menu_item_id'])
      .orderBy('item.ordered_by_user_id')
      .addOrderBy('item.menu_item_id')
      .addOrderBy('item.created_at', 'DESC')
      .getMany();

    const newItems: TabItem[] = [];

    for (const item of lastItems) {
      const newItem = this.tabItemRepository.create({
        tab_id: tabId,
        menu_item_id: item.menu_item_id,
        ordered_by_user_id: userId, // The person requesting the round pays
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        status: OrderItemStatus.PENDING,
        is_round_repeat: true,
      });

      newItems.push(await this.tabItemRepository.save(newItem));
    }

    await this.updateTabTotals(tabId);

    return newItems;
  }

  /**
   * Request to close the tab
   */
  async requestClose(tabId: string, userId: string): Promise<Tab> {
    const tab = await this.findById(tabId);

    // Verify user is a member
    const member = tab.members.find(m => m.user_id === userId && m.status === TabMemberStatus.ACTIVE);
    if (!member) {
      throw new ForbiddenException('You are not an active member of this tab');
    }

    tab.status = TabStatus.PENDING_PAYMENT;
    return this.tabRepository.save(tab);
  }

  /**
   * Process payment for tab
   */
  async processPayment(tabId: string, userId: string, dto: ProcessTabPaymentDto): Promise<TabPayment> {
    const tab = await this.findById(tabId);

    if (tab.status === TabStatus.CLOSED) {
      throw new BadRequestException('Tab is already closed');
    }

    const payment = this.tabPaymentRepository.create({
      tab_id: tabId,
      user_id: userId,
      amount: dto.amount,
      tip_amount: dto.tip_amount || 0,
      payment_method: dto.payment_method,
      transaction_id: dto.transaction_id,
      status: PaymentSplitStatus.PAID,
      payment_details: dto.payment_details,
    });

    const savedPayment = await this.tabPaymentRepository.save(payment);

    // Update member payment tracking
    const member = tab.members.find(m => m.user_id === userId);
    if (member) {
      member.amount_paid = Number(member.amount_paid) + dto.amount + (dto.tip_amount || 0);
      await this.tabMemberRepository.save(member);
    }

    // Update tab totals
    tab.amount_paid = Number(tab.amount_paid) + dto.amount + (dto.tip_amount || 0);
    tab.tip_amount = Number(tab.tip_amount) + (dto.tip_amount || 0);

    // Check if fully paid
    const totalAfterCredits = tab.total_amount - tab.cover_charge_credit - tab.deposit_credit;
    if (tab.amount_paid >= totalAfterCredits) {
      tab.status = TabStatus.CLOSED;
      tab.closed_at = new Date();
    }

    await this.tabRepository.save(tab);

    return savedPayment;
  }

  /**
   * Get split options for the tab
   */
  async getSplitOptions(tabId: string): Promise<any> {
    const tab = await this.findById(tabId);
    const activeMembers = tab.members.filter(m => m.status === TabMemberStatus.ACTIVE);
    const memberCount = activeMembers.length;

    const totalAfterCredits = Number(tab.total_amount) - Number(tab.cover_charge_credit) - Number(tab.deposit_credit);

    return {
      total_amount: tab.total_amount,
      credits: {
        cover_charge: tab.cover_charge_credit,
        deposit: tab.deposit_credit,
        total: Number(tab.cover_charge_credit) + Number(tab.deposit_credit),
      },
      amount_after_credits: totalAfterCredits,
      amount_paid: tab.amount_paid,
      amount_remaining: totalAfterCredits - Number(tab.amount_paid),
      split_options: {
        equal: {
          per_person: totalAfterCredits / memberCount,
          members: memberCount,
        },
        by_consumption: activeMembers.map(m => ({
          user_id: m.user_id,
          amount_consumed: m.amount_consumed,
          amount_paid: m.amount_paid,
          amount_due: Math.max(0, Number(m.amount_consumed) - Number(m.amount_paid)),
        })),
      },
    };
  }

  /**
   * Update tab totals
   */
  private async updateTabTotals(tabId: string): Promise<void> {
    const items = await this.tabItemRepository.find({
      where: { tab_id: tabId },
    });

    const subtotal = items.reduce((sum, item) => sum + Number(item.total_price), 0);
    const discounts = items.reduce((sum, item) => sum + Number(item.discount_amount || 0), 0);

    await this.tabRepository.update(tabId, {
      subtotal,
      discount_amount: discounts,
      total_amount: subtotal,
    });
  }

  /**
   * Find open tabs by user
   */
  async findUserTabs(userId: string): Promise<Tab[]> {
    return this.tabRepository
      .createQueryBuilder('tab')
      .innerJoin('tab.members', 'member')
      .where('member.user_id = :userId', { userId })
      .andWhere('member.status = :status', { status: TabMemberStatus.ACTIVE })
      .andWhere('tab.status != :closed', { closed: TabStatus.CLOSED })
      .leftJoinAndSelect('tab.members', 'members')
      .leftJoinAndSelect('tab.restaurant', 'restaurant')
      .getMany();
  }

  /**
   * Find tabs by restaurant (for staff)
   */
  async findRestaurantTabs(restaurantId: string, status?: TabStatus): Promise<Tab[]> {
    const query = this.tabRepository
      .createQueryBuilder('tab')
      .where('tab.restaurant_id = :restaurantId', { restaurantId })
      .leftJoinAndSelect('tab.members', 'members')
      .leftJoinAndSelect('tab.table', 'table');

    if (status) {
      query.andWhere('tab.status = :status', { status });
    }

    return query.orderBy('tab.created_at', 'DESC').getMany();
  }
}
