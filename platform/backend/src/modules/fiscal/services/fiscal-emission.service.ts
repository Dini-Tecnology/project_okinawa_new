import {
  Injectable,
  Logger,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiscalDocument } from '../entities/fiscal-document.entity';
import { FiscalConfig } from '../entities/fiscal-config.entity';
import { Order } from '../../orders/entities/order.entity';
import { OrdersService } from '../../orders/orders.service';
import {
  FiscalAdapter,
  EmitNfceParams,
  FiscalItem,
  FiscalPayment,
} from '../interfaces/fiscal-adapter.interface';
import { FISCAL_MESSAGES } from '../i18n/fiscal.i18n';
import { FiscalEventService } from './fiscal-event.service';

/**
 * FiscalEmissionService -- orchestrates fiscal document emission.
 *
 * Same pattern as GatewayRouterService in Payment Gateway.
 * Does NOT know which adapter is being used (Focus NFe or SEFAZ Direct).
 *
 * Flow:
 * 1. Load FiscalConfig for the restaurant
 * 2. If fiscal_provider='none' or is_active=false, skip
 * 3. Determine adapter: config.fiscal_provider -> Focus NFe or SEFAZ Direct
 * 4. Build EmitNfceParams from order data
 * 5. Call adapter.emitNfce(params)
 * 6. Save FiscalDocument with result
 * 7. Increment FiscalConfig.next_number
 * 8. If success: emit event 'fiscal.nfce.authorized'
 * 9. If error: emit event 'fiscal.nfce.failed', notify owner
 *
 * Payment method -> fiscal code mapping:
 * - cash       -> '01' (Dinheiro)
 * - credit_card -> '03' (Cartao de Credito)
 * - debit_card -> '04' (Cartao de Debito)
 * - pix        -> '17' (Pagamento Instantaneo / PIX)
 * - wallet     -> '05' (Credito Loja)
 * - tap_to_pay -> '03' or '04' (depends on credit or debit NFC)
 */
@Injectable()
export class FiscalEmissionService {
  private readonly logger = new Logger(FiscalEmissionService.name);

  constructor(
    @Inject('FISCAL_ADAPTER')
    private readonly adapter: FiscalAdapter,

    @InjectRepository(FiscalDocument)
    private readonly fiscalDocRepo: Repository<FiscalDocument>,

    @InjectRepository(FiscalConfig)
    private readonly fiscalConfigRepo: Repository<FiscalConfig>,

    private readonly ordersService: OrdersService,

    private readonly fiscalEvents: FiscalEventService,
  ) {}

  /**
   * Emit NFC-e for a given order.
   * Called automatically on payment confirmation (if auto_emit=true) or manually.
   */
  async emitForOrder(orderId: string): Promise<FiscalDocument | null> {
    this.logger.log(`Emitting NFC-e for order ${orderId}`);

    // 1. Load order with items (via OrdersService)
    let order: Order;
    try {
      order = await this.ordersService.findOne(orderId);
    } catch {
      throw new NotFoundException(FISCAL_MESSAGES.ORDER_NOT_FOUND);
    }

    // 2. Load fiscal config
    const config = await this.fiscalConfigRepo.findOne({
      where: { restaurant_id: order.restaurant_id },
    });
    if (!config) {
      this.logger.warn(`No fiscal config for restaurant ${order.restaurant_id}, skipping emission`);
      return null;
    }
    if (!config.is_active || config.fiscal_provider === 'none') {
      this.logger.log(`Fiscal emission disabled for restaurant ${order.restaurant_id}`);
      return null;
    }

    // 3. Check if already emitted
    const existing = await this.fiscalDocRepo.findOne({
      where: { order_id: orderId, status: 'authorized' },
    });
    if (existing) {
      throw new BadRequestException(FISCAL_MESSAGES.ALREADY_EMITTED);
    }

    // 4. Build emission params
    const params = this.buildEmitParams(order, config);

    // Pass token to adapter for authentication
    (params as any).focus_nfe_token = config.focus_nfe_token;

    // 5. Call adapter
    let fiscalDoc: FiscalDocument;
    try {
      const result = await this.adapter.emitNfce(params);

      // 6. Save FiscalDocument
      fiscalDoc = this.fiscalDocRepo.create({
        restaurant_id: order.restaurant_id,
        order_id: orderId,
        type: 'nfce',
        status: result.success ? 'authorized' : 'failed',
        provider: this.adapter.provider,
        access_key: result.access_key,
        number: result.number,
        series: result.series,
        xml: result.xml,
        qr_code_url: result.qr_code_url,
        danfe_url: result.danfe_url,
        protocol: result.protocol,
        total_amount: order.total_amount,
        items_snapshot: order.items,
        external_ref: orderId,
        error_message: result.error_message,
      });
      await this.fiscalDocRepo.save(fiscalDoc);

      // 7. Increment next_number
      if (result.success) {
        config.next_number += 1;
        await this.fiscalConfigRepo.save(config);

        // 8. Emit success event
        this.fiscalEvents.emit('fiscal.nfce.authorized', {
          orderId,
          documentId: fiscalDoc.id,
          accessKey: result.access_key,
          restaurantId: order.restaurant_id,
        });
        this.logger.log(
          `NFC-e authorized for order ${orderId} | Access Key: ${result.access_key}`,
        );
      } else {
        // 9. Emit failure event
        this.fiscalEvents.emit('fiscal.nfce.failed', {
          orderId,
          documentId: fiscalDoc.id,
          errorMessage: result.error_message,
          restaurantId: order.restaurant_id,
        });
        this.logger.warn(
          `NFC-e emission failed for order ${orderId}: ${result.error_message}`,
        );
      }

      return fiscalDoc;
    } catch (err) {
      const error = err as Error;
      // Save failed attempt
      fiscalDoc = this.fiscalDocRepo.create({
        restaurant_id: order.restaurant_id,
        order_id: orderId,
        type: 'nfce',
        status: 'failed',
        provider: this.adapter.provider,
        total_amount: order.total_amount,
        items_snapshot: order.items,
        external_ref: orderId,
        error_message: error.message,
      });
      await this.fiscalDocRepo.save(fiscalDoc);

      this.fiscalEvents.emit('fiscal.nfce.failed', {
        orderId,
        documentId: fiscalDoc.id,
        errorMessage: error.message,
        restaurantId: order.restaurant_id,
      });

      this.logger.error(
        `NFC-e emission exception for order ${orderId}: ${error.message}`,
        error.stack,
      );
      return fiscalDoc;
    }
  }

  /**
   * Cancel an existing fiscal document.
   */
  async cancelDocument(
    fiscalDocumentId: string,
    reason: string,
  ): Promise<FiscalDocument> {
    const doc = await this.fiscalDocRepo.findOne({
      where: { id: fiscalDocumentId },
    });
    if (!doc) {
      throw new NotFoundException(FISCAL_MESSAGES.DOCUMENT_NOT_FOUND);
    }
    if (doc.status !== 'authorized') {
      throw new BadRequestException(
        'Only authorized documents can be cancelled',
      );
    }

    const result = await this.adapter.cancelNfce(doc.access_key || '', reason);

    if (result.success) {
      doc.status = 'cancelled';
      doc.protocol = result.protocol || doc.protocol;
      await this.fiscalDocRepo.save(doc);

      this.fiscalEvents.emit('fiscal.nfce.cancelled', {
        documentId: doc.id,
        orderId: doc.order_id,
        restaurantId: doc.restaurant_id,
      });
      this.logger.log(`NFC-e cancelled | Document: ${doc.id}`);
    } else {
      doc.error_message = result.error_message || 'Cancel failed';
      await this.fiscalDocRepo.save(doc);
      this.logger.warn(
        `NFC-e cancel failed | Document: ${doc.id} | ${result.error_message}`,
      );
    }

    return doc;
  }

  /**
   * Get all fiscal documents for a restaurant.
   */
  async getDocuments(restaurantId: string): Promise<FiscalDocument[]> {
    return this.fiscalDocRepo.find({
      where: { restaurant_id: restaurantId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Get a single fiscal document by ID.
   */
  async getDocument(documentId: string): Promise<FiscalDocument> {
    const doc = await this.fiscalDocRepo.findOne({
      where: { id: documentId },
    });
    if (!doc) {
      throw new NotFoundException(FISCAL_MESSAGES.DOCUMENT_NOT_FOUND);
    }
    return doc;
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private buildEmitParams(
    order: Order,
    config: FiscalConfig,
  ): EmitNfceParams {
    const items: FiscalItem[] = (order.items || []).map((item) => ({
      description: (item as any).name || 'Item',
      ncm: (item as any).ncm || config.tax_defaults?.ncm_default || '00000000',
      cfop: (item as any).cfop || config.tax_defaults?.cfop || '5102',
      quantity: (item as any).quantity || 1,
      unit_price: Number((item as any).unit_price || (item as any).price || 0),
      total_price: Number((item as any).total_price || (item as any).subtotal || 0),
      unit: 'UN',
      icms: {
        origem: '0',
        ...(config.regime_tributario === 'simples_nacional'
          ? { csosn: config.tax_defaults?.icms_csosn || '102' }
          : { cst: config.tax_defaults?.icms_cst || '00' }),
      },
      pis: {
        cst: config.tax_defaults?.pis_cst || '99',
        aliquota: config.tax_defaults?.pis_aliquota || 0,
      },
      cofins: {
        cst: config.tax_defaults?.cofins_cst || '99',
        aliquota: config.tax_defaults?.cofins_aliquota || 0,
      },
    }));

    const payments: FiscalPayment[] = [
      {
        method: this.mapPaymentMethod((order.metadata as any)?.payment_method),
        amount: Number(order.total_amount),
      },
    ];

    return {
      restaurant_id: order.restaurant_id,
      cnpj: config.cnpj,
      ie: config.ie || '',
      razao_social: config.razao_social,
      nome_fantasia: config.nome_fantasia || config.razao_social,
      endereco: config.endereco as any,
      regime_tributario: config.regime_tributario as any,
      serie: config.current_series,
      numero: config.next_number,
      csc_id: config.csc_id || '',
      csc_token: config.csc_token || '',
      items,
      payments,
      total_amount: Number(order.total_amount),
      consumer_cpf: (order.metadata as any)?.consumer_cpf,
      consumer_name: (order.metadata as any)?.consumer_name,
      order_id: order.id,
      idempotency_key: `nfce_${order.id}_${Date.now()}`,
    };
  }

  /**
   * Maps internal payment method to NFC-e fiscal code.
   */
  private mapPaymentMethod(method?: string): string {
    const map: Record<string, string> = {
      cash: '01',
      credit_card: '03',
      debit_card: '04',
      pix: '17',
      wallet: '05',
      tap_to_pay: '03',
    };
    return map[method || 'cash'] || '99'; // '99' = Outros
  }
}
