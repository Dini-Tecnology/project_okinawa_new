import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Wallet } from './entities/wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentSplit } from './entities/payment-split.entity';
import { OrderItem } from '@/modules/orders/entities/order-item.entity';
import { OrderGuest } from '@/modules/orders/entities/order-guest.entity';
import { PaymentSplitService } from './payment-split.service';
import { PaymentSplitController } from './payment-split.controller';
import { LoyaltyModule } from '@/modules/loyalty/loyalty.module';
import { EventsModule } from '@/modules/events/events.module';
import { FinancialModule } from '@/modules/financial/financial.module';
import { OrdersModule } from '@/modules/orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wallet,
      WalletTransaction,
      PaymentMethod,
      PaymentSplit,
      OrderItem,
      OrderGuest,
    ]),
    OrdersModule,
    LoyaltyModule,
    EventsModule,
    FinancialModule,
  ],
  controllers: [PaymentsController, PaymentSplitController],
  providers: [PaymentsService, PaymentSplitService],
  exports: [PaymentsService, PaymentSplitService],
})
export class PaymentsModule {}
