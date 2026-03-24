import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialService } from './financial.service';
import { FinancialTransactionService } from './financial-transaction.service';
import { FinancialReportService } from './financial-report.service';
import { FinancialExportService } from './financial-export.service';
import { FinancialController } from './financial.controller';
import { FinancialTransaction } from './entities/financial-transaction.entity';
import { EventsModule } from '@/modules/events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialTransaction]), EventsModule],
  controllers: [FinancialController],
  providers: [
    FinancialTransactionService,
    FinancialReportService,
    FinancialExportService,
    FinancialService,
  ],
  exports: [FinancialService],
})
export class FinancialModule {}
