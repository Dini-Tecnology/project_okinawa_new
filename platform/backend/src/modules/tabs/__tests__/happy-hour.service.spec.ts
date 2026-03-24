// @ts-nocheck
import { HappyHourService } from '../happy-hour.service';
import { DayOfWeek } from '@/common/enums';

const createMockRepository = () => ({
  create: jest.fn((data) => ({ id: 'test-id', ...data })),
  save: jest.fn((data) => Promise.resolve({ id: 'test-id', ...data })),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
});

describe('HappyHourService', () => {
  let service: HappyHourService;
  let scheduleRepository: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    scheduleRepository = createMockRepository();
    service = new HappyHourService(scheduleRepository as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createSchedule', () => {
    it('should create a new happy hour schedule', async () => {
      const dto = {
        restaurant_id: 'rest-123',
        name: 'Happy Hour Classico',
        days: [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI],
        start_time: '17:00',
        end_time: '20:00',
        discount_type: 'percentage' as const,
        discount_value: 30,
        applies_to: 'all' as const,
        is_active: true,
      };

      await service.createSchedule(dto);

      expect(scheduleRepository.create).toHaveBeenCalledWith(dto);
      expect(scheduleRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateSchedule', () => {
    it('should update an existing schedule', async () => {
      const existingSchedule = {
        id: 'sched-123',
        name: 'Old Name',
        discount_value: 20,
      };

      scheduleRepository.findOne.mockResolvedValue(existingSchedule);

      const updateDto = { name: 'New Name', discount_value: 30 };
      await service.updateSchedule('sched-123', updateDto);

      expect(scheduleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Name',
          discount_value: 30,
        }),
      );
    });

    it('should throw if schedule not found', async () => {
      scheduleRepository.findOne.mockResolvedValue(null);

      await expect(service.updateSchedule('invalid-id', {})).rejects.toThrow('Schedule not found');
    });
  });

  describe('getActivePromotions', () => {
    it('should return active promotions for current day and time', async () => {
      // Mock current time: Wednesday at 18:00
      jest.useFakeTimers();
      const mockDate = new Date('2024-01-10T18:00:00'); // Wednesday
      jest.setSystemTime(mockDate);

      const schedules = [
        {
          id: 'sched-1',
          name: 'Weekday Happy Hour',
          days: [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI],
          start_time: '17:00',
          end_time: '20:00',
          is_active: true,
        },
        {
          id: 'sched-2',
          name: 'Weekend Special',
          days: [DayOfWeek.SAT, DayOfWeek.SUN],
          start_time: '12:00',
          end_time: '18:00',
          is_active: true,
        },
      ];

      scheduleRepository.find.mockResolvedValue(schedules);

      const result = await service.getActivePromotions('rest-123');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Weekday Happy Hour');
    });

    it('should return empty if outside happy hour time', async () => {
      // Mock current time: Wednesday at 21:00 (after happy hour)
      jest.useFakeTimers();
      const mockDate = new Date('2024-01-10T21:00:00');
      jest.setSystemTime(mockDate);

      const schedules = [
        {
          id: 'sched-1',
          name: 'Weekday Happy Hour',
          days: [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI],
          start_time: '17:00',
          end_time: '20:00',
          is_active: true,
        },
      ];

      scheduleRepository.find.mockResolvedValue(schedules);

      const result = await service.getActivePromotions('rest-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate percentage discount correctly', async () => {
      jest.useFakeTimers();
      const mockDate = new Date('2024-01-10T18:00:00'); // Wednesday at 18:00
      jest.setSystemTime(mockDate);

      scheduleRepository.find.mockResolvedValue([
        {
          id: 'sched-1',
          name: 'Happy Hour 30% OFF',
          days: [DayOfWeek.WED],
          start_time: '17:00',
          end_time: '20:00',
          discount_type: 'percentage',
          discount_value: 30,
          applies_to: 'all',
          is_active: true,
        },
      ]);

      const result = await service.calculateDiscount('rest-123', 'item-123', 'cat-123', 100);

      expect(result.discountedPrice).toBe(70);
      expect(result.discountAmount).toBe(30);
      expect(result.discountReason).toBe('Happy Hour 30% OFF');
    });

    it('should calculate fixed discount correctly', async () => {
      jest.useFakeTimers();
      const mockDate = new Date('2024-01-10T18:00:00');
      jest.setSystemTime(mockDate);

      scheduleRepository.find.mockResolvedValue([
        {
          id: 'sched-1',
          name: 'R$5 OFF',
          days: [DayOfWeek.WED],
          start_time: '17:00',
          end_time: '20:00',
          discount_type: 'fixed',
          discount_value: 5,
          applies_to: 'all',
          is_active: true,
        },
      ]);

      const result = await service.calculateDiscount('rest-123', 'item-123', 'cat-123', 25);

      expect(result.discountedPrice).toBe(20);
      expect(result.discountAmount).toBe(5);
    });

    it('should return no discount if no active promotions', async () => {
      scheduleRepository.find.mockResolvedValue([]);

      const result = await service.calculateDiscount('rest-123', 'item-123', 'cat-123', 100);

      expect(result.discountedPrice).toBe(100);
      expect(result.discountAmount).toBe(0);
      expect(result.discountReason).toBeNull();
    });

    it('should apply discount only to specified categories', async () => {
      jest.useFakeTimers();
      const mockDate = new Date('2024-01-10T18:00:00');
      jest.setSystemTime(mockDate);

      scheduleRepository.find.mockResolvedValue([
        {
          id: 'sched-1',
          name: 'Drinks Special',
          days: [DayOfWeek.WED],
          start_time: '17:00',
          end_time: '20:00',
          discount_type: 'percentage',
          discount_value: 50,
          applies_to: 'categories',
          category_ids: ['drinks-category'],
          is_active: true,
        },
      ]);

      // Item in drinks category - should get discount
      const drinksResult = await service.calculateDiscount(
        'rest-123',
        'item-123',
        'drinks-category',
        20,
      );
      expect(drinksResult.discountAmount).toBe(10);

      // Item in food category - no discount
      const foodResult = await service.calculateDiscount(
        'rest-123',
        'item-456',
        'food-category',
        20,
      );
      expect(foodResult.discountAmount).toBe(0);
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule', async () => {
      await service.deleteSchedule('sched-123');

      expect(scheduleRepository.delete).toHaveBeenCalledWith('sched-123');
    });
  });

  describe('getRestaurantSchedules', () => {
    it('should return active schedules for restaurant', async () => {
      const mockSchedules = [
        { id: 'sched-1', name: 'Morning', start_time: '10:00' },
        { id: 'sched-2', name: 'Evening', start_time: '18:00' },
      ];

      scheduleRepository.find.mockResolvedValue(mockSchedules);

      const result = await service.getRestaurantSchedules('rest-123');

      expect(scheduleRepository.find).toHaveBeenCalledWith({
        where: { restaurant_id: 'rest-123', is_active: true },
        order: { start_time: 'ASC' },
      });
      expect(result).toEqual(mockSchedules);
    });
  });
});
