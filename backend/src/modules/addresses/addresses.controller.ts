import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all addresses for the current user' })
  @ApiResponse({ status: 200, description: 'Returns list of user addresses' })
  findAll(@CurrentUser() user: any) {
    return this.addressesService.findByUser(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid address data' })
  create(@CurrentUser() user: any, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @ApiResponse({ status: 403, description: 'Not the owner of this address' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @ApiResponse({ status: 403, description: 'Not the owner of this address' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.addressesService.remove(id, user.sub);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set an address as default' })
  @ApiResponse({ status: 200, description: 'Address set as default' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @ApiResponse({ status: 403, description: 'Not the owner of this address' })
  setDefault(@Param('id') id: string, @CurrentUser() user: any) {
    return this.addressesService.setDefault(id, user.sub);
  }
}
