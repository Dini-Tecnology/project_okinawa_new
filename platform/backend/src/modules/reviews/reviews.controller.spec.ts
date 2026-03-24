import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { mockAuthenticatedUser } from '@common/interfaces/authenticated-user.interface';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  const mockService = {
    create: jest.fn(),
    findByRestaurant: jest.fn(),
    getRestaurantReviewStats: jest.fn(),
    getTopReviews: jest.fn(),
    getRecentReviews: jest.fn(),
    findByUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    addOwnerResponse: jest.fn(),
    markAsHelpful: jest.fn(),
    toggleVisibility: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: mockService }],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  it('should create a review', async () => {
    const user = mockAuthenticatedUser({ id: 'user-1' });
    const dto = { restaurant_id: 'restaurant-1', rating: 5 };
    mockService.create.mockResolvedValue({ id: 'review-1', ...dto });

    const result = await controller.create(user, dto as any);

    expect(result).toBeDefined();
    expect(mockService.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('should find reviews by restaurant', async () => {
    mockService.findByRestaurant.mockResolvedValue([{ id: 'review-1' }]);

    const result = await controller.findByRestaurant('restaurant-1');

    expect(result).toBeDefined();
    expect(mockService.findByRestaurant).toHaveBeenCalled();
  });

  it('should get restaurant stats', async () => {
    mockService.getRestaurantReviewStats.mockResolvedValue({ average: 4.5 });

    const result = await controller.getRestaurantStats('restaurant-1');

    expect(result).toBeDefined();
    expect(mockService.getRestaurantReviewStats).toHaveBeenCalledWith('restaurant-1');
  });

  it('should update a review', async () => {
    const user = mockAuthenticatedUser({ id: 'user-1' });
    const dto = { comment: 'Updated' };
    mockService.update.mockResolvedValue({ id: 'review-1', ...dto });

    const result = await controller.update('review-1', user, dto as any);

    expect(result).toBeDefined();
    expect(mockService.update).toHaveBeenCalledWith('review-1', 'user-1', dto);
  });
});
