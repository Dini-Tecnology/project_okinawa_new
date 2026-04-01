import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MenuCustomizationController } from './menu-customization.controller';
import { MenuCustomizationService } from './menu-customization.service';
import { CustomizationOption } from '../menu-items/entities/menu-item-customization-group.entity';

describe('MenuCustomizationController', () => {
  let controller: MenuCustomizationController;

  const mockMenuCustomizationService = {
    findByMenuItem: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateOptions: jest.fn(),
    remove: jest.fn(),
  };

  const mockOptions: CustomizationOption[] = [
    { id: 'opt-1', name: 'Sem cebola', price: 0, available: true },
    { id: 'opt-2', name: 'Extra queijo', price: 3, available: true },
  ];

  const mockGroup = {
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuCustomizationController],
      providers: [
        {
          provide: MenuCustomizationService,
          useValue: mockMenuCustomizationService,
        },
      ],
    }).compile();

    controller = module.get<MenuCustomizationController>(MenuCustomizationController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByMenuItem', () => {
    it('should return all customization groups for a menu item', async () => {
      const groups = [mockGroup, { ...mockGroup, id: 'group-2', name: 'Tamanho', sort_order: 2 }];
      mockMenuCustomizationService.findByMenuItem.mockResolvedValue(groups);

      const result = await controller.findByMenuItem('menu-item-1');

      expect(result).toEqual(groups);
      expect(mockMenuCustomizationService.findByMenuItem).toHaveBeenCalledWith('menu-item-1');
    });

    it('should return empty array when no groups found', async () => {
      mockMenuCustomizationService.findByMenuItem.mockResolvedValue([]);

      const result = await controller.findByMenuItem('menu-item-empty');

      expect(result).toEqual([]);
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

      mockMenuCustomizationService.create.mockResolvedValue({ ...mockGroup, ...createDto });

      const result = await controller.create(createDto as any);

      expect(result).toMatchObject(createDto);
      expect(mockMenuCustomizationService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update an existing customization group', async () => {
      const updateDto = { name: 'Updated Name', max_select: 5 };
      const updatedGroup = { ...mockGroup, ...updateDto };
      mockMenuCustomizationService.update.mockResolvedValue(updatedGroup);

      const result = await controller.update('group-1', updateDto as any);

      expect(result).toEqual(updatedGroup);
      expect(mockMenuCustomizationService.update).toHaveBeenCalledWith('group-1', updateDto);
    });

    it('should propagate NotFoundException from service', async () => {
      mockMenuCustomizationService.update.mockRejectedValue(
        new NotFoundException('Customization group nonexistent not found'),
      );

      await expect(controller.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOptions', () => {
    it('should update the options array of a customization group', async () => {
      const newOptions: CustomizationOption[] = [
        { id: 'opt-updated', name: 'Nova Opção', price: 2, available: true },
      ];
      const updatedGroup = { ...mockGroup, options: newOptions };
      mockMenuCustomizationService.updateOptions.mockResolvedValue(updatedGroup);

      const result = await controller.updateOptions('group-1', newOptions);

      expect(result.options).toEqual(newOptions);
      expect(mockMenuCustomizationService.updateOptions).toHaveBeenCalledWith('group-1', newOptions);
    });

    it('should propagate NotFoundException when group does not exist', async () => {
      mockMenuCustomizationService.updateOptions.mockRejectedValue(
        new NotFoundException('Customization group nonexistent not found'),
      );

      await expect(controller.updateOptions('nonexistent', [])).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a customization group', async () => {
      mockMenuCustomizationService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('group-1');

      expect(result).toBeUndefined();
      expect(mockMenuCustomizationService.remove).toHaveBeenCalledWith('group-1');
    });

    it('should propagate NotFoundException when group does not exist', async () => {
      mockMenuCustomizationService.remove.mockRejectedValue(
        new NotFoundException('Customization group nonexistent not found'),
      );

      await expect(controller.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
