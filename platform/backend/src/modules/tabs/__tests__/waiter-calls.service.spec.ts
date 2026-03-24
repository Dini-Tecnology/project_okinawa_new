import { WaiterCallsService } from '../waiter-calls.service';

const createMockRepository = () => ({
  create: jest.fn((data: any) => ({ id: 'test-id', ...data })),
  save: jest.fn((data: any) => Promise.resolve({ id: 'test-id', ...data })),
  findOne: jest.fn(),
  find: jest.fn(),
});

describe('WaiterCallsService', () => {
  let service: WaiterCallsService;
  let waiterCallRepository: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    waiterCallRepository = createMockRepository();
    service = new WaiterCallsService(waiterCallRepository as any);
  });

  describe('createCall', () => {
    it('should create a waiter call with pending status', async () => {
      const userId = 'user-123';
      const dto = {
        restaurant_id: 'rest-123',
        table_id: 'table-5',
        tab_id: 'tab-123',
        reason: 'waiter',
        notes: 'Need menu please',
      };

      await service.createCall(userId, dto as any);

      expect(waiterCallRepository.create).toHaveBeenCalledWith({
        ...dto,
        user_id: userId,
        status: 'pending',
      });
      expect(waiterCallRepository.save).toHaveBeenCalled();
    });

    it('should create a bill request call', async () => {
      const userId = 'user-123';
      const dto = {
        restaurant_id: 'rest-123',
        table_id: 'table-5',
        reason: 'bill',
      };

      const result = await service.createCall(userId, dto as any);

      expect(result.reason).toBe('bill');
      expect(result.status).toBe('pending');
    });
  });

  describe('acknowledgeCall', () => {
    it('should acknowledge a pending call', async () => {
      const call = {
        id: 'call-123',
        status: 'pending',
      };

      waiterCallRepository.findOne.mockResolvedValue(call);

      const result = await service.acknowledgeCall('call-123', 'staff-123');

      expect(waiterCallRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'acknowledged',
          acknowledged_by: 'staff-123',
          acknowledged_at: expect.any(Date),
        }),
      );
    });

    it('should throw if call not found', async () => {
      waiterCallRepository.findOne.mockResolvedValue(null);

      await expect(service.acknowledgeCall('invalid-id', 'staff-123')).rejects.toThrow(
        'Waiter call not found',
      );
    });
  });

  describe('resolveCall', () => {
    it('should resolve an acknowledged call', async () => {
      const call = {
        id: 'call-123',
        status: 'acknowledged',
      };

      waiterCallRepository.findOne.mockResolvedValue(call);

      const result = await service.resolveCall('call-123');

      expect(waiterCallRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'resolved',
          resolved_at: expect.any(Date),
        }),
      );
    });

    it('should throw if call not found', async () => {
      waiterCallRepository.findOne.mockResolvedValue(null);

      await expect(service.resolveCall('invalid-id')).rejects.toThrow('Waiter call not found');
    });
  });

  describe('getPendingCalls', () => {
    it('should return pending calls ordered by creation time', async () => {
      const pendingCalls = [
        { id: 'call-1', status: 'pending', created_at: new Date('2024-01-01T12:00:00') },
        { id: 'call-2', status: 'pending', created_at: new Date('2024-01-01T12:05:00') },
      ];

      waiterCallRepository.find.mockResolvedValue(pendingCalls);

      const result = await service.getPendingCalls('rest-123');

      expect(waiterCallRepository.find).toHaveBeenCalledWith({
        where: { restaurant_id: 'rest-123', status: 'pending' },
        relations: ['user', 'table'],
        order: { created_at: 'ASC' },
      });
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no pending calls', async () => {
      waiterCallRepository.find.mockResolvedValue([]);

      const result = await service.getPendingCalls('rest-123');

      expect(result).toEqual([]);
    });
  });

  describe('getCallsByTable', () => {
    it('should return recent calls for a table', async () => {
      const tableCalls = [
        { id: 'call-1', table_id: 'table-5', created_at: new Date() },
        { id: 'call-2', table_id: 'table-5', created_at: new Date() },
      ];

      waiterCallRepository.find.mockResolvedValue(tableCalls);

      const result = await service.getCallsByTable('table-5');

      expect(waiterCallRepository.find).toHaveBeenCalledWith({
        where: { table_id: 'table-5' },
        order: { created_at: 'DESC' },
        take: 10,
      });
      expect(result).toHaveLength(2);
    });
  });
});
