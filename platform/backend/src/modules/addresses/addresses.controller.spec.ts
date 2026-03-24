import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('AddressesController', () => {
  let controller: AddressesController;

  const mockAddressesService = {
    findByUser: jest.fn(),
    findDefault: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    setDefault: jest.fn(),
  };

  const mockAddress = {
    id: 'addr-1',
    user_id: 'user-1',
    restaurant_id: null,
    label: 'Casa',
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 4',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    postal_code: '01310-100',
    country: 'BR',
    latitude: -23.5505,
    longitude: -46.6333,
    is_default: false,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  const mockUser = mockAuthenticatedUser({ sub: 'user-1', id: 'user-1', email: 'user@example.com' });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [
        {
          provide: AddressesService,
          useValue: mockAddressesService,
        },
      ],
    }).compile();

    controller = module.get<AddressesController>(AddressesController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all addresses for the current user', async () => {
      const addresses = [mockAddress, { ...mockAddress, id: 'addr-2', label: 'Trabalho' }];
      mockAddressesService.findByUser.mockResolvedValue(addresses);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual(addresses);
      expect(mockAddressesService.findByUser).toHaveBeenCalledWith('user-1');
    });

    it('should return empty array when user has no addresses', async () => {
      mockAddressesService.findByUser.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
      expect(mockAddressesService.findByUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('create', () => {
    it('should create a new address for the current user', async () => {
      const createDto = {
        label: 'Casa',
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01310-100',
      };

      mockAddressesService.create.mockResolvedValue({ ...mockAddress, ...createDto });

      const result = await controller.create(mockUser, createDto as any);

      expect(result).toMatchObject(createDto);
      expect(mockAddressesService.create).toHaveBeenCalledWith('user-1', createDto);
    });

    it('should create a default address and clear other defaults', async () => {
      const createDto = {
        label: 'Principal',
        street: 'Av. Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01310-100',
        is_default: true,
      };

      mockAddressesService.create.mockResolvedValue({ ...mockAddress, ...createDto });

      const result = await controller.create(mockUser, createDto as any);

      expect(result.is_default).toBe(true);
      expect(mockAddressesService.create).toHaveBeenCalledWith('user-1', createDto);
    });
  });

  describe('update', () => {
    it('should update an existing address', async () => {
      const updateDto = { city: 'Rio de Janeiro', state: 'RJ' };
      const updatedAddress = { ...mockAddress, ...updateDto };
      mockAddressesService.update.mockResolvedValue(updatedAddress);

      const result = await controller.update('addr-1', mockUser, updateDto as any);

      expect(result).toEqual(updatedAddress);
      expect(mockAddressesService.update).toHaveBeenCalledWith('addr-1', 'user-1', updateDto);
    });

    it('should propagate NotFoundException from service', async () => {
      mockAddressesService.update.mockRejectedValue(new NotFoundException('Address not found'));

      await expect(controller.update('nonexistent', mockUser, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate ForbiddenException when user does not own the address', async () => {
      mockAddressesService.update.mockRejectedValue(
        new ForbiddenException('You do not own this address'),
      );

      await expect(controller.update('addr-1', mockUser, {} as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete an address and return success message', async () => {
      mockAddressesService.remove.mockResolvedValue({ message: 'Address deleted successfully' });

      const result = await controller.remove('addr-1', mockUser);

      expect(result).toEqual({ message: 'Address deleted successfully' });
      expect(mockAddressesService.remove).toHaveBeenCalledWith('addr-1', 'user-1');
    });

    it('should propagate NotFoundException when address does not exist', async () => {
      mockAddressesService.remove.mockRejectedValue(new NotFoundException('Address not found'));

      await expect(controller.remove('nonexistent', mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should propagate ForbiddenException when user does not own the address', async () => {
      mockAddressesService.remove.mockRejectedValue(
        new ForbiddenException('You do not own this address'),
      );

      await expect(controller.remove('addr-1', mockUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('setDefault', () => {
    it('should set an address as the default', async () => {
      const defaultAddress = { ...mockAddress, is_default: true };
      mockAddressesService.setDefault.mockResolvedValue(defaultAddress);

      const result = await controller.setDefault('addr-1', mockUser);

      expect(result).toEqual(defaultAddress);
      expect(result.is_default).toBe(true);
      expect(mockAddressesService.setDefault).toHaveBeenCalledWith('addr-1', 'user-1');
    });

    it('should propagate NotFoundException when address does not exist', async () => {
      mockAddressesService.setDefault.mockRejectedValue(
        new NotFoundException('Address not found'),
      );

      await expect(controller.setDefault('nonexistent', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
