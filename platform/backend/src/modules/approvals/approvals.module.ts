import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsGateway } from './approvals.realtime';
import { Approval } from './entities/approval.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Approval]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION') || '7d',
        },
      }),
    }),
  ],
  controllers: [ApprovalsController],
  providers: [ApprovalsService, ApprovalsGateway],
  exports: [ApprovalsService, ApprovalsGateway],
})
export class ApprovalsModule {}
