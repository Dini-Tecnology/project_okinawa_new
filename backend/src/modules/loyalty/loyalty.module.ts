import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyProgram } from './entities/loyalty-program.entity';
import { StampCard } from './entities/stamp-card.entity';
import { EventsModule } from '@/modules/events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltyProgram, StampCard]), EventsModule],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
