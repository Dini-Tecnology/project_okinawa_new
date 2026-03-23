import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaitlistEntry } from './entities';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { WaitlistGateway } from './waitlist.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([WaitlistEntry])],
  controllers: [WaitlistController],
  providers: [WaitlistService, WaitlistGateway],
  exports: [WaitlistService, WaitlistGateway],
})
export class RestaurantWaitlistModule {}
