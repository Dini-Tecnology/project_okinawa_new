import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KdsService } from './kds.service';
import { Order } from './entities/order.entity';
import { Profile } from '@/modules/users/entities/profile.entity';
import { OrderStatus } from '@common/enums';
import { KdsFormatterHelper, OrderCalculatorHelper } from './helpers';

describe('KdsService', () => {
  let service: KdsService;
  let orderRepository: Repository<Order>;
  let profileRepository: Repository<Profile>;
  let kdsFormatter: KdsFormatterHelper;

  const mockOrder = {
    id: 'order-abcdef12',
    status: OrderStatus.PENDING,
    restaurant_id: 'restaurant-1',
    waiter_id: 'waiter-1',
    created_at: new Date(),
    table: { id: 'table-1', table_number: 'T1' },
    items: [
      {
        id: 'item-1',
        menu_item: { id: 'mi-1', name: 'Pasta', category: 'main' },
        quantity: 1,
        special_instructions: null,
        customizations: null,
      },
    ],
  };

  const mockBarOrder = {
    ...mockOrder,
    id: 'order-bar00001',
    waiter_id: null,
    items: [
      {
        id: 'item-2',
        menu_item: { id: 'mi-2', name: 'Beer', category: 'beer' },
        quantity: 2,
        special_instructions: null,
        customizations: null,
      },
    ],
  };

  const mockProfile = { id: 'waiter-1', full_name: 'Jane Smith' };

  /** Reusable query builder mock */
  const buildQueryBuilder = (resolvedOrders: any[]) => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(resolvedOrders),
  });

  const mockOrderRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockProfileRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KdsService,
        OrderCalculatorHelper,
        KdsFormatterHelper,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
      ],
    }).compile();

    service = module.get<KdsService>(KdsService);
    orderRepository = module.get(getRepositoryToken(Order));
    profileRepository = module.get(getRepositoryToken(Profile));
    kdsFormatter = module.get<KdsFormatterHelper>(KdsFormatterHelper);

    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Module wiring
  // ──────────────────────────────────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Default statuses filter (no params)
  // ──────────────────────────────────────────────────────────────────────────
  it('should query with default statuses when no status is provided', async () => {
    const qb = buildQueryBuilder([]);
    mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
    mockProfileRepository.find.mockResolvedValue([]);

    await service.getKdsOrders({});

    expect(qb.where).toHaveBeenCalledWith(
      'order.status IN (:...statuses)',
      expect.objectContaining({
        statuses: expect.arrayContaining([
          OrderStatus.PENDING,
          OrderStatus.CONFIRMED,
          OrderStatus.PREPARING,
        ]),
      }),
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Kitchen type filter excludes bar categories
  // ──────────────────────────────────────────────────────────────────────────
  it('should apply NOT IN bar categories filter for kitchen type', async () => {
    const qb = buildQueryBuilder([mockOrder]);
    mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
    mockProfileRepository.find.mockResolvedValue([mockProfile]);

    await service.getKdsOrders({ type: 'kitchen', restaurant_id: 'restaurant-1' });

    expect(qb.andWhere).toHaveBeenCalledWith(
      'menu_item.category NOT IN (:...categories)',
      expect.objectContaining({ categories: expect.any(Array) }),
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Bar type filter includes only bar categories
  // ──────────────────────────────────────────────────────────────────────────
  it('should apply IN bar categories filter for bar type', async () => {
    const qb = buildQueryBuilder([mockBarOrder]);
    mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
    mockProfileRepository.find.mockResolvedValue([]);

    await service.getKdsOrders({ type: 'bar', restaurant_id: 'restaurant-1' });

    expect(qb.andWhere).toHaveBeenCalledWith(
      'menu_item.category IN (:...categories)',
      expect.objectContaining({ categories: expect.any(Array) }),
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Restaurant filter is applied when provided
  // ──────────────────────────────────────────────────────────────────────────
  it('should filter by restaurant_id when provided', async () => {
    const qb = buildQueryBuilder([mockOrder]);
    mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
    mockProfileRepository.find.mockResolvedValue([]);

    await service.getKdsOrders({ restaurant_id: 'restaurant-1' });

    expect(qb.andWhere).toHaveBeenCalledWith(
      'order.restaurant_id = :restaurantId',
      { restaurantId: 'restaurant-1' },
    );
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Restaurant filter is NOT applied when omitted
  // ──────────────────────────────────────────────────────────────────────────
  it('should not filter by restaurant_id when omitted', async () => {
    const qb = buildQueryBuilder([]);
    mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
    mockProfileRepository.find.mockResolvedValue([]);

    await service.getKdsOrders({});

    const andWhereCalls: string[] = (qb.andWhere.mock.calls as any[][]).map((c) => c[0] as string);
    expect(andWhereCalls).not.toContain('order.restaurant_id = :restaurantId');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Waiter names are resolved from profile repository
  // ──────────────────────────────────────────────────────────────────────────
  it('should resolve waiter names from profiles', async () => {
    const qb = buildQueryBuilder([mockOrder]);
    mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
    mockProfileRepository.find.mockResolvedValue([mockProfile]);

    const result = await service.getKdsOrders({ type: 'kitchen' });

    expect(mockProfileRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: expect.anything() }),
      }),
    );
    expect(result[0].waiter_name).toBe('Jane Smith');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Orders without waiter_id skip profile lookup
  // ──────────────────────────────────────────────────────────────────────────
  it('should not call profileRepository when no orders have a waiter_id', async () => {
    const orderWithoutWaiter = { ...mockOrder, waiter_id: null };
    const qb = buildQueryBuilder([orderWithoutWaiter]);
    mockOrderRepository.createQueryBuilder.mockReturnValue(qb);

    await service.getKdsOrders({});

    expect(mockProfileRepository.find).not.toHaveBeenCalled();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Returns empty array when no orders match query
  // ──────────────────────────────────────────────────────────────────────────
  it('should return empty array when there are no matching orders', async () => {
    const qb = buildQueryBuilder([]);
    mockOrderRepository.createQueryBuilder.mockReturnValue(qb);

    const result = await service.getKdsOrders({ type: 'kitchen', restaurant_id: 'restaurant-1' });

    expect(result).toEqual([]);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Results are ordered oldest first (ASC)
  // ──────────────────────────────────────────────────────────────────────────
  it('should order results by created_at ASC', async () => {
    const qb = buildQueryBuilder([]);
    mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
    mockProfileRepository.find.mockResolvedValue([]);

    await service.getKdsOrders({});

    expect(qb.orderBy).toHaveBeenCalledWith('order.created_at', 'ASC');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Custom status param overrides the default statuses array
  // ──────────────────────────────────────────────────────────────────────────
  it('should use provided status instead of default statuses', async () => {
    const qb = buildQueryBuilder([]);
    mockOrderRepository.createQueryBuilder.mockReturnValue(qb);
    mockProfileRepository.find.mockResolvedValue([]);

    await service.getKdsOrders({ status: OrderStatus.PREPARING });

    expect(qb.where).toHaveBeenCalledWith(
      'order.status IN (:...statuses)',
      { statuses: [OrderStatus.PREPARING] },
    );
  });
});
