import { TabsService } from '../tabs.service';
import { TabStatus, TabType, TabMemberRole, TabMemberStatus, OrderItemStatus } from '@/common/enums';

// Mock repositories
const createMockRepository = () => ({
  create: jest.fn((data: any) => ({ id: 'test-id', ...data })),
  save: jest.fn((data: any) => Promise.resolve({ id: 'test-id', ...data })),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    distinctOn: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
  })),
});

describe('TabsService', () => {
  let service: TabsService;
  let tabRepository: ReturnType<typeof createMockRepository>;
  let tabMemberRepository: ReturnType<typeof createMockRepository>;
  let tabItemRepository: ReturnType<typeof createMockRepository>;
  let tabPaymentRepository: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    tabRepository = createMockRepository();
    tabMemberRepository = createMockRepository();
    tabItemRepository = createMockRepository();
    tabPaymentRepository = createMockRepository();

    service = new TabsService(
      tabRepository as any,
      tabMemberRepository as any,
      tabItemRepository as any,
      tabPaymentRepository as any,
    );
  });

  describe('createTab', () => {
    const userId = 'user-123';
    const createDto = {
      restaurant_id: 'rest-123',
      table_id: 'table-123',
      type: TabType.GROUP,
      cover_charge_credit: 50,
      preauth_amount: 200,
    };

    it('should create a new tab successfully', async () => {
      tabRepository.findOne.mockResolvedValue(null); // No existing tab
      tabRepository.save.mockResolvedValue({
        id: 'tab-123',
        ...createDto,
        host_user_id: userId,
        status: TabStatus.OPEN,
      });
      tabRepository.findOne.mockResolvedValueOnce(null).mockResolvedValue({
        id: 'tab-123',
        ...createDto,
        members: [],
        items: [],
        payments: [],
      });

      const result = await service.createTab(userId, createDto);

      expect(tabRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurant_id: createDto.restaurant_id,
          host_user_id: userId,
          type: TabType.GROUP,
          status: TabStatus.OPEN,
        }),
      );
      expect(tabMemberRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          role: TabMemberRole.HOST,
          status: TabMemberStatus.ACTIVE,
        }),
      );
    });

    it('should throw if user already has an open tab', async () => {
      tabRepository.findOne.mockResolvedValue({ id: 'existing-tab' });

      await expect(service.createTab(userId, createDto)).rejects.toThrow(
        'You already have an open tab at this restaurant',
      );
    });

    it('should generate invite token for group tabs', async () => {
      tabRepository.findOne.mockResolvedValueOnce(null);
      const savedTab = {
        id: 'tab-123',
        invite_token: expect.any(String),
        type: TabType.GROUP,
      };
      tabRepository.save.mockResolvedValue(savedTab);
      tabRepository.findOne.mockResolvedValue({
        ...savedTab,
        members: [],
        items: [],
        payments: [],
      });

      await service.createTab(userId, createDto);

      expect(tabRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          invite_token: expect.any(String),
        }),
      );
    });
  });

  describe('joinTab', () => {
    const userId = 'user-456';
    const joinDto = {
      invite_token: 'valid-token',
      credit_contribution: 25,
    };

    it('should allow joining an open group tab', async () => {
      tabRepository.findOne.mockResolvedValue({
        id: 'tab-123',
        type: TabType.GROUP,
        status: TabStatus.OPEN,
        members: [],
        cover_charge_credit: 50,
      });

      await service.joinTab(userId, joinDto);

      expect(tabMemberRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          role: TabMemberRole.MEMBER,
          status: TabMemberStatus.ACTIVE,
          credit_contribution: 25,
        }),
      );
    });

    it('should throw if tab is closed', async () => {
      tabRepository.findOne.mockResolvedValue(null);

      await expect(service.joinTab(userId, joinDto)).rejects.toThrow(
        'Tab not found or already closed',
      );
    });

    it('should throw if trying to join individual tab', async () => {
      tabRepository.findOne.mockResolvedValue({
        id: 'tab-123',
        type: TabType.INDIVIDUAL,
        status: TabStatus.OPEN,
        members: [],
      });

      await expect(service.joinTab(userId, joinDto)).rejects.toThrow(
        'Cannot join an individual tab',
      );
    });

    it('should throw if already a member', async () => {
      tabRepository.findOne.mockResolvedValue({
        id: 'tab-123',
        type: TabType.GROUP,
        status: TabStatus.OPEN,
        members: [{ user_id: userId, status: TabMemberStatus.ACTIVE }],
      });

      await expect(service.joinTab(userId, joinDto)).rejects.toThrow(
        'Already a member of this tab',
      );
    });

    it('should throw if max members reached', async () => {
      const maxMembers = Array(10)
        .fill(null)
        .map((_, i) => ({ user_id: `user-${i}`, status: TabMemberStatus.ACTIVE }));

      tabRepository.findOne.mockResolvedValue({
        id: 'tab-123',
        type: TabType.GROUP,
        status: TabStatus.OPEN,
        members: maxMembers,
      });

      await expect(service.joinTab(userId, joinDto)).rejects.toThrow(
        'Tab has reached maximum number of members',
      );
    });
  });

  describe('addItem', () => {
    const userId = 'user-123';
    const tabId = 'tab-123';
    const addItemDto = {
      menu_item_id: 'item-123',
      quantity: 2,
      unit_price: 15.5,
      discount_amount: 0,
    };

    it('should add item to tab successfully', async () => {
      const mockTab = {
        id: tabId,
        status: TabStatus.OPEN,
        members: [{ user_id: userId, status: TabMemberStatus.ACTIVE, amount_consumed: 0 }],
        items: [],
      };

      tabRepository.findOne.mockResolvedValue(mockTab);
      tabItemRepository.find.mockResolvedValue([]);

      await service.addItem(tabId, userId, addItemDto);

      expect(tabItemRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tab_id: tabId,
          menu_item_id: addItemDto.menu_item_id,
          ordered_by_user_id: userId,
          quantity: 2,
          unit_price: 15.5,
          total_price: 31,
          status: OrderItemStatus.PENDING,
        }),
      );
    });

    it('should throw if tab is not open', async () => {
      tabRepository.findOne.mockResolvedValue({
        id: tabId,
        status: TabStatus.CLOSED,
        members: [{ user_id: userId, status: TabMemberStatus.ACTIVE }],
      });

      await expect(service.addItem(tabId, userId, addItemDto)).rejects.toThrow('Tab is not open');
    });

    it('should throw if user is not a member', async () => {
      tabRepository.findOne.mockResolvedValue({
        id: tabId,
        status: TabStatus.OPEN,
        members: [],
      });

      await expect(service.addItem(tabId, userId, addItemDto)).rejects.toThrow(
        'You are not an active member of this tab',
      );
    });

    it('should apply discount correctly', async () => {
      const dtoWithDiscount = { ...addItemDto, discount_amount: 5, discount_reason: 'Happy Hour' };
      const mockTab = {
        id: tabId,
        status: TabStatus.OPEN,
        members: [{ user_id: userId, status: TabMemberStatus.ACTIVE, amount_consumed: 0 }],
      };

      tabRepository.findOne.mockResolvedValue(mockTab);
      tabItemRepository.find.mockResolvedValue([]);

      await service.addItem(tabId, userId, dtoWithDiscount);

      expect(tabItemRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          total_price: 26, // (2 * 15.5) - 5
          discount_amount: 5,
          discount_reason: 'Happy Hour',
        }),
      );
    });
  });

  describe('processPayment', () => {
    const userId = 'user-123';
    const tabId = 'tab-123';
    const paymentDto = {
      amount: 50,
      tip_amount: 10,
      payment_method: 'credit_card',
      transaction_id: 'txn-123',
    };

    it('should process payment successfully', async () => {
      const mockTab = {
        id: tabId,
        status: TabStatus.OPEN,
        total_amount: 100,
        cover_charge_credit: 0,
        deposit_credit: 0,
        amount_paid: 0,
        tip_amount: 0,
        members: [{ user_id: userId, amount_paid: 0 }],
      };

      tabRepository.findOne.mockResolvedValue(mockTab);

      await service.processPayment(tabId, userId, paymentDto);

      expect(tabPaymentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tab_id: tabId,
          user_id: userId,
          amount: 50,
          tip_amount: 10,
        }),
      );
    });

    it('should close tab when fully paid', async () => {
      const mockTab = {
        id: tabId,
        status: TabStatus.OPEN,
        total_amount: 50,
        cover_charge_credit: 0,
        deposit_credit: 0,
        amount_paid: 0,
        tip_amount: 0,
        members: [{ user_id: userId, amount_paid: 0 }],
      };

      tabRepository.findOne.mockResolvedValue(mockTab);

      await service.processPayment(tabId, userId, paymentDto);

      expect(tabRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TabStatus.CLOSED,
          closed_at: expect.any(Date),
        }),
      );
    });

    it('should throw if tab is already closed', async () => {
      tabRepository.findOne.mockResolvedValue({
        id: tabId,
        status: TabStatus.CLOSED,
        members: [],
      });

      await expect(service.processPayment(tabId, userId, paymentDto)).rejects.toThrow(
        'Tab is already closed',
      );
    });
  });

  describe('getSplitOptions', () => {
    it('should calculate equal split correctly', async () => {
      const mockTab = {
        id: 'tab-123',
        total_amount: 120,
        cover_charge_credit: 20,
        deposit_credit: 0,
        amount_paid: 0,
        members: [
          { user_id: 'user-1', status: TabMemberStatus.ACTIVE, amount_consumed: 40, amount_paid: 0 },
          { user_id: 'user-2', status: TabMemberStatus.ACTIVE, amount_consumed: 40, amount_paid: 0 },
          { user_id: 'user-3', status: TabMemberStatus.ACTIVE, amount_consumed: 40, amount_paid: 0 },
        ],
      };

      tabRepository.findOne.mockResolvedValue(mockTab);

      const result = await service.getSplitOptions('tab-123');

      expect(result.split_options.equal.per_person).toBe(100 / 3); // (120 - 20) / 3
      expect(result.split_options.equal.members).toBe(3);
      expect(result.amount_after_credits).toBe(100);
    });

    it('should calculate consumption-based split correctly', async () => {
      const mockTab = {
        id: 'tab-123',
        total_amount: 100,
        cover_charge_credit: 0,
        deposit_credit: 0,
        amount_paid: 20,
        members: [
          { user_id: 'user-1', status: TabMemberStatus.ACTIVE, amount_consumed: 60, amount_paid: 20 },
          { user_id: 'user-2', status: TabMemberStatus.ACTIVE, amount_consumed: 40, amount_paid: 0 },
        ],
      };

      tabRepository.findOne.mockResolvedValue(mockTab);

      const result = await service.getSplitOptions('tab-123');

      expect(result.split_options.by_consumption).toEqual([
        { user_id: 'user-1', amount_consumed: 60, amount_paid: 20, amount_due: 40 },
        { user_id: 'user-2', amount_consumed: 40, amount_paid: 0, amount_due: 40 },
      ]);
    });
  });

  describe('leaveTab', () => {
    it('should allow member to leave if paid', async () => {
      const mockTab = {
        id: 'tab-123',
        members: [
          { user_id: 'host-123', role: TabMemberRole.HOST, status: TabMemberStatus.ACTIVE },
          {
            user_id: 'user-456',
            role: TabMemberRole.MEMBER,
            status: TabMemberStatus.ACTIVE,
            amount_consumed: 30,
            amount_paid: 30,
          },
        ],
      };

      tabRepository.findOne.mockResolvedValue(mockTab);

      await service.leaveTab('tab-123', 'user-456');

      expect(tabMemberRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TabMemberStatus.LEFT,
          left_at: expect.any(Date),
        }),
      );
    });

    it('should throw if host tries to leave', async () => {
      const mockTab = {
        id: 'tab-123',
        members: [{ user_id: 'host-123', role: TabMemberRole.HOST, status: TabMemberStatus.ACTIVE }],
      };

      tabRepository.findOne.mockResolvedValue(mockTab);

      await expect(service.leaveTab('tab-123', 'host-123')).rejects.toThrow(
        'Host cannot leave the tab',
      );
    });

    it('should throw if member has unpaid consumption', async () => {
      const mockTab = {
        id: 'tab-123',
        members: [
          { user_id: 'host-123', role: TabMemberRole.HOST, status: TabMemberStatus.ACTIVE },
          {
            user_id: 'user-456',
            role: TabMemberRole.MEMBER,
            status: TabMemberStatus.ACTIVE,
            amount_consumed: 50,
            amount_paid: 20,
          },
        ],
      };

      tabRepository.findOne.mockResolvedValue(mockTab);

      await expect(service.leaveTab('tab-123', 'user-456')).rejects.toThrow(
        'You must pay your consumption before leaving',
      );
    });
  });
});
