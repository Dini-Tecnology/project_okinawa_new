import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QrCodeController } from './qr-code.controller';
import { QrCodeService } from './qr-code.service';
import { QrCodeSecurityService } from './qr-code-security.service';
import { TableQrCode } from '../tables/entities/table-qr-code.entity';
import { TableSession } from '../tables/entities/table-session.entity';
import { QrScanLog } from '../tables/entities/qr-scan-log.entity';
import { RestaurantTable } from '../tables/entities/restaurant-table.entity';
import { EventsGateway } from '@/modules/events/events.realtime';

describe('QrCodeController', () => {
  let controller: QrCodeController;
  const mockService = { generateTableQR: jest.fn(), generateMenuQR: jest.fn() };
  const mockSecurityService = { generateSignature: jest.fn(), validateQRUrl: jest.fn() };
  const mockQrCodeRepository = { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), update: jest.fn() };
  const mockSessionRepository = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const mockScanLogRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodeController],
      providers: [
        { provide: QrCodeService, useValue: mockService },
        { provide: QrCodeSecurityService, useValue: mockSecurityService },
        { provide: getRepositoryToken(TableQrCode), useValue: mockQrCodeRepository },
        { provide: getRepositoryToken(TableSession), useValue: mockSessionRepository },
        { provide: getRepositoryToken(QrScanLog), useValue: mockScanLogRepository },
        { provide: getRepositoryToken(RestaurantTable), useValue: { findOne: jest.fn(), find: jest.fn(), save: jest.fn() } },
        { provide: EventsGateway, useValue: { emitToRestaurant: jest.fn() } },
      ],
    })
      .overrideGuard(require('@/modules/auth/guards/jwt-auth.guard').JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('@/modules/auth/guards/roles.guard').RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<QrCodeController>(QrCodeController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
