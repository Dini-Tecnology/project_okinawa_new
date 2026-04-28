import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { UserRole } from '@/modules/user-roles/entities/user-role.entity';
import { EventsGateway } from '@/modules/events/events.realtime';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepository: Repository<Review>;
  let userRoleRepository: Repository<UserRole>;
  let eventsGateway: EventsGateway;

  const mockReview = {
    id: 'review-1',
    user_id: 'user-1',
    restaurant_id: 'restaurant-1',
    rating: 5,
    comment: 'Great food!',
    sentiment: 'positive',
    sentiment_analysis: {},
    is_verified: true,
    is_visible: true,
    helpful_count: 0,
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  const mockReviewRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockUserRoleRepository = {
    findOne: jest.fn(),
  };

  const mockEventsGateway = {
    notifyRestaurant: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getRepositoryToken(Review),
          useValue: mockReviewRepository,
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRoleRepository,
        },
        {
          provide: EventsGateway,
          useValue: mockEventsGateway,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    reviewRepository = module.get(getRepositoryToken(Review));
    userRoleRepository = module.get(getRepositoryToken(UserRole));
    eventsGateway = module.get(EventsGateway);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a review successfully', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        rating: 5,
        comment: 'Excellent service!',
        order_id: 'order-1',
      };

      mockReviewRepository.findOne.mockResolvedValue(null);
      mockReviewRepository.create.mockReturnValue(mockReview);
      mockReviewRepository.save.mockResolvedValue(mockReview);
      mockEventsGateway.notifyRestaurant.mockResolvedValue(undefined);

      const result = await service.create('user-1', createDto as any);

      expect(result).toBeDefined();
      expect(mockReviewRepository.save).toHaveBeenCalled();
      expect(mockEventsGateway.notifyRestaurant).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already reviewed', async () => {
      const createDto = {
        restaurant_id: 'restaurant-1',
        rating: 5,
        comment: 'Great!',
      };

      mockReviewRepository.findOne.mockResolvedValue(mockReview);

      await expect(service.create('user-1', createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByRestaurant', () => {
    it('should return reviews for a restaurant', async () => {
      const mockStats = { averageRating: 5, totalReviews: 1 };
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockReview], 1]);
      jest.spyOn(service as any, 'getRestaurantReviewStats').mockResolvedValue(mockStats);

      const result = await service.findByRestaurant('restaurant-1');

      expect(result).toBeDefined();
      expect(mockReviewRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should return reviews by a user', async () => {
      mockReviewRepository.find.mockResolvedValue([mockReview]);

      const result = await service.findByUser('user-1');

      expect(result).toEqual([mockReview]);
      expect(mockReviewRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a review by id', async () => {
      mockReviewRepository.findOne.mockResolvedValue(mockReview);

      const result = await service.findOne('review-1');

      expect(result).toEqual(mockReview);
    });

    it('should throw NotFoundException if review not found', async () => {
      mockReviewRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      const updateDto = {
        rating: 4,
        comment: 'Updated comment',
      };

      mockReviewRepository.findOne.mockResolvedValue(mockReview);
      mockReviewRepository.save.mockResolvedValue({
        ...mockReview,
        ...updateDto,
      });

      const result = await service.update('review-1', 'user-1', updateDto as any);

      expect(result.rating).toBe(4);
      expect(result.comment).toBe('Updated comment');
    });
  });

  describe('remove', () => {
    it('should soft delete a review', async () => {
      mockReviewRepository.findOne.mockResolvedValue(mockReview);
      mockReviewRepository.save.mockResolvedValue({
        ...mockReview,
        is_visible: false,
      });

      await service.remove('review-1', 'user-1');

      expect(mockReviewRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if review not found', async () => {
      mockReviewRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
