import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { PaginationDto, paginate, toPaginationDto } from '@/common/dto/pagination.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  async addFavorite(userId: string, addFavoriteDto: AddFavoriteDto) {
    // Check if already favorited
    const existing = await this.favoriteRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: addFavoriteDto.restaurant_id,
      },
    });

    if (existing) {
      throw new ConflictException('Restaurant already in favorites');
    }

    const favorite = this.favoriteRepository.create({
      user_id: userId,
      restaurant_id: addFavoriteDto.restaurant_id,
      notes: addFavoriteDto.notes,
    });

    return this.favoriteRepository.save(favorite);
  }

  async getFavorites(userId: string, pagination?: PaginationDto) {
    const dto = toPaginationDto(pagination);

    const [items, total] = await this.favoriteRepository.findAndCount({
      where: { user_id: userId },
      relations: ['restaurant'],
      order: { created_at: 'DESC' },
      skip: dto.offset,
      take: dto.limit,
    });

    return paginate(items, total, dto);
  }

  async removeFavorite(userId: string, restaurantId: string) {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);
    return { message: 'Favorite removed successfully' };
  }

  async isFavorite(userId: string, restaurantId: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
      },
    });

    return !!favorite;
  }

  async updateNotes(userId: string, restaurantId: string, notes: string) {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    favorite.notes = notes;
    return this.favoriteRepository.save(favorite);
  }

  async update(userId: string, restaurantId: string, updateFavoriteDto: UpdateFavoriteDto) {
    const favorite = await this.favoriteRepository.findOne({
      where: {
        user_id: userId,
        restaurant_id: restaurantId,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    Object.assign(favorite, updateFavoriteDto);
    return this.favoriteRepository.save(favorite);
  }
}
