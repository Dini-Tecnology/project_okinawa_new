import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsGateway } from './approvals.gateway';
import { Approval } from './entities/approval.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Approval])],
  controllers: [ApprovalsController],
  providers: [ApprovalsService, ApprovalsGateway],
  exports: [ApprovalsService, ApprovalsGateway],
})
export class ApprovalsModule {}
