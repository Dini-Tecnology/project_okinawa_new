import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('FavoritesController', () => {
  let controller: FavoritesController;
  const mockService = {
    addFavorite: jest.fn(),
    getFavorites: jest.fn(),
    isFavorite: jest.fn(),
    updateNotes: jest.fn(),
    removeFavorite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [{ provide: FavoritesService, useValue: mockService }],
    }).overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard).useValue({ canActivate: () => true }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
    jest.clearAllMocks();
  });

  it('should add favorite', async () => {
    mockService.addFavorite.mockResolvedValue({ id: 'fav-1' });
    const result = await controller.addFavorite(mockAuthenticatedUser({ id: 'user-1' }), { restaurant_id: 'restaurant-1' } as any);
    expect(result).toBeDefined();
  });

  it('should get favorites', async () => {
    mockService.getFavorites.mockResolvedValue([{ id: 'fav-1' }]);
    const pagination = { page: 1, limit: 10 };
    const result = await controller.getFavorites(mockAuthenticatedUser({ id: 'user-1' }), pagination as any);
    expect(result).toBeDefined();
  });

  it('should check if favorite', async () => {
    mockService.isFavorite.mockResolvedValue(true);
    const result = await controller.isFavorite(mockAuthenticatedUser({ id: 'user-1' }), 'restaurant-1');
    expect(result.is_favorite).toBe(true);
  });
});
