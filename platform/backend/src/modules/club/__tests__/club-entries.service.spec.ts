import { ClubEntriesService } from '../club-entries.service';
import { ClubEntryStatus, ClubEntryPurchaseType } from '@/common/enums';

const createMockRepository = () => ({
  create: jest.fn((data: any) => ({ id: 'test-id', ...data })),
  save: jest.fn((data: any) => Promise.resolve({ id: 'test-id', ...data })),
  findOne: jest.fn(),
  find: jest.fn(),
});

describe('ClubEntriesService', () => {
  let service: ClubEntriesService;
  let entryRepository: ReturnType<typeof createMockRepository>;
  let checkInOutRepository: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    entryRepository = createMockRepository();
    checkInOutRepository = createMockRepository();
    service = new ClubEntriesService(entryRepository as any, checkInOutRepository as any);
  });

  describe('purchaseEntry', () => {
    const userId = 'user-123';
    const purchaseDto = {
      restaurant_id: 'club-123',
      event_date: new Date('2024-01-15'),
      variation_id: 'pista',
      variation_name: 'Pista + 1 Drink',
      quantity: 2,
      unit_price: 80,
      credit_amount: 30,
      purchase_type: ClubEntryPurchaseType.ADVANCE,
      transaction_id: 'txn-123',
    };

    it('should create entry with correct total price', async () => {
      await service.purchaseEntry(userId, purchaseDto);

      expect(entryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          quantity: 2,
          unit_price: 80,
          total_price: 160, // 80 * 2
          credit_amount: 60, // 30 * 2
          status: ClubEntryStatus.ACTIVE,
          qr_code: expect.stringMatching(/^ENTRY-[A-Z0-9]{16}$/),
        }),
      );
    });

    it('should default quantity to 1', async () => {
      const singleDto = { ...purchaseDto, quantity: undefined };

      await service.purchaseEntry(userId, singleDto);

      expect(entryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          quantity: 1,
          total_price: 80,
        }),
      );
    });
  });

  describe('validateEntry', () => {
    it('should validate active entry for today', async () => {
      const today = new Date();
      const entry = {
        id: 'entry-123',
        qr_code: 'ENTRY-ABC123',
        status: ClubEntryStatus.ACTIVE,
        event_date: today,
        user: { name: 'João' },
      };

      entryRepository.findOne.mockResolvedValue(entry);

      const result = await service.validateEntry({ qr_code: 'ENTRY-ABC123' });

      expect(result.valid).toBe(true);
      expect(result.entry).toBeDefined();
    });

    it('should reject already used entry', async () => {
      entryRepository.findOne.mockResolvedValue({
        id: 'entry-123',
        status: ClubEntryStatus.USED,
      });

      const result = await service.validateEntry({ qr_code: 'ENTRY-ABC123' });

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Entry already used');
    });

    it('should reject cancelled entry', async () => {
      entryRepository.findOne.mockResolvedValue({
        id: 'entry-123',
        status: ClubEntryStatus.CANCELLED,
      });

      const result = await service.validateEntry({ qr_code: 'ENTRY-ABC123' });

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Entry was cancelled');
    });

    it('should reject entry for wrong date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      entryRepository.findOne.mockResolvedValue({
        id: 'entry-123',
        status: ClubEntryStatus.ACTIVE,
        event_date: tomorrow,
      });

      const result = await service.validateEntry({ qr_code: 'ENTRY-ABC123' });

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Entry not valid for today');
    });

    it('should accept entry from yesterday if before 6am', async () => {
      // Mock time to 3am
      jest.useFakeTimers();
      const earlyMorning = new Date();
      earlyMorning.setHours(3, 0, 0, 0);
      jest.setSystemTime(earlyMorning);

      const yesterday = new Date(earlyMorning);
      yesterday.setDate(yesterday.getDate() - 1);

      entryRepository.findOne.mockResolvedValue({
        id: 'entry-123',
        status: ClubEntryStatus.ACTIVE,
        event_date: yesterday,
      });

      const result = await service.validateEntry({ qr_code: 'ENTRY-ABC123' });

      expect(result.valid).toBe(true);

      jest.useRealTimers();
    });

    it('should return not found for invalid QR code', async () => {
      entryRepository.findOne.mockResolvedValue(null);

      const result = await service.validateEntry({ qr_code: 'INVALID' });

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Entry not found');
    });
  });

  describe('useEntry', () => {
    it('should mark entry as used', async () => {
      entryRepository.findOne.mockResolvedValue({
        id: 'entry-123',
        status: ClubEntryStatus.ACTIVE,
      });

      await service.useEntry('entry-123');

      expect(entryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ClubEntryStatus.USED,
          used_at: expect.any(Date),
        }),
      );
    });

    it('should throw if entry not found', async () => {
      entryRepository.findOne.mockResolvedValue(null);

      await expect(service.useEntry('invalid-id')).rejects.toThrow('Entry not found');
    });

    it('should throw if entry not active', async () => {
      entryRepository.findOne.mockResolvedValue({
        id: 'entry-123',
        status: ClubEntryStatus.USED,
      });

      await expect(service.useEntry('entry-123')).rejects.toThrow(
        'Entry cannot be used: status is used',
      );
    });
  });

  describe('cancelEntry', () => {
    it('should cancel own active entry', async () => {
      entryRepository.findOne.mockResolvedValue({
        id: 'entry-123',
        user_id: 'user-123',
        status: ClubEntryStatus.ACTIVE,
      });

      await service.cancelEntry('entry-123', 'user-123');

      expect(entryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ClubEntryStatus.CANCELLED,
        }),
      );
    });

    it('should throw if trying to cancel someone else entry', async () => {
      entryRepository.findOne.mockResolvedValue({
        id: 'entry-123',
        user_id: 'user-123',
        status: ClubEntryStatus.ACTIVE,
      });

      await expect(service.cancelEntry('entry-123', 'other-user')).rejects.toThrow(
        'You can only cancel your own entries',
      );
    });
  });

  describe('checkIn', () => {
    it('should create check-in record', async () => {
      checkInOutRepository.findOne.mockResolvedValue(null); // No existing check-in
      entryRepository.findOne.mockResolvedValue({
        id: 'entry-123',
        status: ClubEntryStatus.ACTIVE,
      }); // For useEntry call

      await service.checkIn('user-123', {
        restaurant_id: 'club-123',
        entry_id: 'entry-123',
      });

      expect(checkInOutRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurant_id: 'club-123',
          user_id: 'user-123',
          entry_id: 'entry-123',
          check_in_at: expect.any(Date),
        }),
      );
    });

    it('should throw if already checked in', async () => {
      checkInOutRepository.findOne.mockResolvedValue({
        id: 'checkin-123',
        check_out_at: null,
      });

      await expect(
        service.checkIn('user-123', { restaurant_id: 'club-123' }),
      ).rejects.toThrow('User already checked in');
    });

    it('should mark entry as used when checking in with entry', async () => {
      checkInOutRepository.findOne.mockResolvedValue(null);
      entryRepository.findOne.mockResolvedValue({
        id: 'entry-123',
        status: ClubEntryStatus.ACTIVE,
      });

      await service.checkIn('user-123', {
        restaurant_id: 'club-123',
        entry_id: 'entry-123',
      });

      expect(entryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ClubEntryStatus.USED,
        }),
      );
    });
  });

  describe('checkOut', () => {
    it('should record check-out time', async () => {
      checkInOutRepository.findOne.mockResolvedValue({
        id: 'checkin-123',
        check_out_at: null,
      });

      await service.checkOut({ check_in_id: 'checkin-123' });

      expect(checkInOutRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          check_out_at: expect.any(Date),
        }),
      );
    });

    it('should throw if already checked out', async () => {
      checkInOutRepository.findOne.mockResolvedValue({
        id: 'checkin-123',
        check_out_at: new Date(),
      });

      await expect(service.checkOut({ check_in_id: 'checkin-123' })).rejects.toThrow(
        'User already checked out',
      );
    });

    it('should throw if check-in not found', async () => {
      checkInOutRepository.findOne.mockResolvedValue(null);

      await expect(service.checkOut({ check_in_id: 'invalid' })).rejects.toThrow(
        'Check-in record not found',
      );
    });
  });

  describe('getUserEntries', () => {
    it('should return active entries by default', async () => {
      const entries = [
        { id: 'entry-1', status: ClubEntryStatus.ACTIVE },
        { id: 'entry-2', status: ClubEntryStatus.ACTIVE },
      ];

      entryRepository.find.mockResolvedValue(entries);

      const result = await service.getUserEntries('user-123');

      expect(entryRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'user-123', status: expect.objectContaining({ _type: 'in', _value: [ClubEntryStatus.ACTIVE] }) },
        }),
      );
      expect(result).toHaveLength(2);
    });

    it('should include used entries when requested', async () => {
      entryRepository.find.mockResolvedValue([]);

      await service.getUserEntries('user-123', true);

      expect(entryRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            user_id: 'user-123',
            status: expect.objectContaining({ _type: 'in', _value: [ClubEntryStatus.ACTIVE, ClubEntryStatus.USED] }),
          },
        }),
      );
    });
  });
});
