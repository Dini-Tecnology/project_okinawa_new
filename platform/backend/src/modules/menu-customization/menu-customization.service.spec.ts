import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MenuCustomizationService } from './menu-customization.service';
import { MenuItemCustomizationGroup as CustomizationGroup, CustomizationOption } from '../menu-items/entities/menu-item-customization-group.entity';

describe('MenuCustomizationService', () => {
  let service: MenuCustomizationService;

  const mockOptions: CustomizationOption[] = [
    { id: 'opt-1', name: 'Sem cebola', price: 0, available: true },
    { id: 'opt-2', name: 'Extra queijo', price: 3, available: true },
    { id: 'opt-3', name: 'Sem glúten', price: 5, available: false },
  ];

  const mockGroup: CustomizationGroup = {
    id: 'group-1',
    menu_item_id: 'menu-item-1',
    name: 'Personalizações',
    min_select: 0,
    max_select: 2,
    is_required: false,
    sort_order: 1,
    options: mockOptions,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    menu_item: null as any,
  };

  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuCustomizationService,
        {
          provide: getRepositoryToken(CustomizationGroup),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<MenuCustomizationService>(MenuCustomizationService);

    jest.clearAllMocks();
  });

  describe('findByMenuItem', () => {
    it('should return all customization groups for a menu item ordered by sort_order', async () => {
      const groups = [
        mockGroup,
        { ...mockGroup, id: 'group-2', sort_order: 2, name: 'Tamanho' },
      ];
      mockRepo.find.mockResolvedValue(groups);

      const result = await service.findByMenuItem('menu-item-1');

      expect(result).toEqual(groups);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { menu_item_id: 'menu-item-1' },
        order: { sort_order: 'ASC' },
      });
    });

    it('should return empty array when menu item has no customization groups', async () => {
      mockRepo.find.mockResolvedValue([]);

      const result = await service.findByMenuItem('menu-item-no-groups');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a customization group by ID', async () => {
      mockRepo.findOne.mockResolvedValue(mockGroup);

      const result = await service.findOne('group-1');

      expect(result).toEqual(mockGroup);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 'group-1' } });
    });

    it('should throw NotFoundException when group does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'Customization group nonexistent not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new customization group', async () => {
      const createDto = {
        menu_item_id: 'menu-item-1',
        name: 'Extras',
        min_select: 0,
        max_select: 3,
        is_required: false,
        sort_order: 0,
        options: [{ id: 'opt-new', name: 'Bacon', price: 2, available: true }],
      };

      mockRepo.create.mockReturnValue({ ...mockGroup, ...createDto });
      mockRepo.save.mockResolvedValue({ ...mockGroup, ...createDto });

      const result = await service.create(createDto);

      expect(result).toMatchObject(createDto);
      expect(mockRepo.create).toHaveBeenCalledWith(createDto);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should create a required customization group', async () => {
      const createDto = {
        menu_item_id: 'menu-item-2',
        name: 'Ponto da carne',
        min_select: 1,
        max_select: 1,
        is_required: true,
        sort_order: 0,
        options: [
          { id: 'opt-a', name: 'Mal passado', price: 0, available: true },
          { id: 'opt-b', name: 'Ao ponto', price: 0, available: true },
          { id: 'opt-c', name: 'Bem passado', price: 0, available: true },
        ],
      };

      const createdGroup = { ...mockGroup, ...createDto };
      mockRepo.create.mockReturnValue(createdGroup);
      mockRepo.save.mockResolvedValue(createdGroup);

      const result = await service.create(createDto);

      expect(result.is_required).toBe(true);
      expect(result.options).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should update a customization group', async () => {
      const updateDto = { name: 'Novo Nome', max_select: 3 };
      mockRepo.findOne.mockResolvedValue({ ...mockGroup });
      mockRepo.save.mockResolvedValue({ ...mockGroup, ...updateDto });

      const result = await service.update('group-1', updateDto);

      expect(result.name).toBe('Novo Nome');
      expect(result.max_select).toBe(3);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when group does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'Novo' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('should allow partial update without modifying other fields', async () => {
      const originalGroup = { ...mockGroup };
      mockRepo.findOne.mockResolvedValue(originalGroup);
      mockRepo.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update('group-1', { name: 'Apenas Nome' });

      expect(result.name).toBe('Apenas Nome');
      expect(result.menu_item_id).toBe(originalGroup.menu_item_id);
      expect(result.options).toEqual(originalGroup.options);
    });
  });

  describe('updateOptions', () => {
    it('should update the options of a customization group', async () => {
      const newOptions: CustomizationOption[] = [
        { id: 'opt-new-1', name: 'Opção Nova', price: 1, available: true },
      ];
      const groupBeforeUpdate = { ...mockGroup };
      mockRepo.findOne.mockResolvedValue(groupBeforeUpdate);
      mockRepo.save.mockResolvedValue({ ...groupBeforeUpdate, options: newOptions });

      const result = await service.updateOptions('group-1', newOptions);

      expect(result.options).toEqual(newOptions);
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ options: newOptions }),
      );
    });

    it('should throw NotFoundException when group does not exist for options update', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateOptions('nonexistent', []),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow setting options to an empty array', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockGroup });
      mockRepo.save.mockResolvedValue({ ...mockGroup, options: [] });

      const result = await service.updateOptions('group-1', []);

      expect(result.options).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should remove a customization group', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockGroup });
      mockRepo.remove.mockResolvedValue(undefined);

      await service.remove('group-1');

      expect(mockRepo.remove).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'group-1' }),
      );
    });

    it('should throw NotFoundException when group does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });

    it('should return void on successful removal', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockGroup });
      mockRepo.remove.mockResolvedValue(undefined);

      const result = await service.remove('group-1');

      expect(result).toBeUndefined();
    });
  });
});
