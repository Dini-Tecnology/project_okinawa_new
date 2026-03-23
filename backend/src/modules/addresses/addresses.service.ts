import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  /**
   * List all addresses for a user.
   * Default address is returned first.
   */
  async findByUser(userId: string): Promise<Address[]> {
    return this.addressRepository.find({
      where: { user_id: userId },
      order: { is_default: 'DESC', created_at: 'DESC' },
    });
  }

  /**
   * Find the default address for a user.
   */
  async findDefault(userId: string): Promise<Address | null> {
    return this.addressRepository.findOne({
      where: { user_id: userId, is_default: true },
    });
  }

  /**
   * Create a new address for a user.
   * If is_default is true, clears other defaults first.
   */
  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    if (dto.is_default) {
      await this.clearDefaults(userId);
    }

    const address = this.addressRepository.create({
      ...dto,
      user_id: userId,
    });

    return this.addressRepository.save(address);
  }

  /**
   * Update an existing address.
   * Validates ownership before updating.
   */
  async update(id: string, userId: string, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOneAndValidateOwner(id, userId);

    if (dto.is_default) {
      await this.clearDefaults(userId);
    }

    Object.assign(address, dto);
    return this.addressRepository.save(address);
  }

  /**
   * Delete an address.
   * Validates ownership before deleting.
   */
  async remove(id: string, userId: string): Promise<{ message: string }> {
    const address = await this.findOneAndValidateOwner(id, userId);
    await this.addressRepository.remove(address);
    return { message: 'Address deleted successfully' };
  }

  /**
   * Set an address as the default.
   * Clears all other defaults for the user first.
   */
  async setDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findOneAndValidateOwner(id, userId);

    await this.clearDefaults(userId);

    address.is_default = true;
    return this.addressRepository.save(address);
  }

  /**
   * Find an address by ID and validate that it belongs to the user.
   */
  private async findOneAndValidateOwner(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({ where: { id } });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.user_id !== userId) {
      throw new ForbiddenException('You do not own this address');
    }

    return address;
  }

  /**
   * Clear all default addresses for a user.
   */
  private async clearDefaults(userId: string): Promise<void> {
    await this.addressRepository.update(
      { user_id: userId, is_default: true },
      { is_default: false },
    );
  }
}
