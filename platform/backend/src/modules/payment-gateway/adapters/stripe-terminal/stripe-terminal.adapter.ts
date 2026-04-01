import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GatewayAdapter,
  ProcessPaymentParams,
  PaymentResult,
  RefundResult,
  PaymentStatus,
} from '../../interfaces/gateway-adapter.interface';
import { GatewayConfig } from '../../entities/gateway-config.entity';
import { GatewayTransaction } from '../../entities/gateway-transaction.entity';

/**
 * Adapter for Stripe Terminal — Tap to Pay.
 * Turns the waiter's phone into an NFC payment terminal.
 *
 * ─── Dependencies (Mobile) ───────────────────────────────────────────
 * - @stripe/stripe-terminal-react-native (npm package)
 * - iOS: Tap to Pay on iPhone entitlement (Apple Developer Program)
 * - Android: NFC capability, minSDK 30
 *
 * ─── Tap to Pay Flow ─────────────────────────────────────────────────
 * 1. Backend creates ConnectionToken -> POST /v1/terminal/connection_tokens
 * 2. Mobile initializes StripeTerminalProvider with tokenProvider
 * 3. Mobile discovers local reader (discoverReaders, type: tapToPay)
 * 4. Mobile connects to reader (connectReader)
 * 5. Backend creates PaymentIntent -> POST /v1/payment_intents
 * 6. Mobile collects payment (collectPaymentMethod) -> "tap your card" screen
 * 7. Mobile confirms (confirmPaymentIntent)
 * 8. Backend receives webhook payment_intent.succeeded
 *
 * ─── Stripe Endpoints Used ───────────────────────────────────────────
 * - POST /v1/terminal/connection_tokens -> Generate connection token
 * - POST /v1/terminal/locations        -> Register restaurant location
 * - POST /v1/payment_intents           -> Create intent for Tap to Pay
 * - POST /v1/payment_intents/:id/capture -> Capture payment
 * - POST /v1/refunds                   -> Refund
 *
 * IMPORTANT: Stripe Terminal requires a Stripe account with Terminal enabled.
 * Tap to Pay on iPhone requires Apple Developer Program + entitlement.
 *
 * ADAPTER STUB — All API calls in this adapter are stubs returning mock data.
 * To complete integration:
 * 1. Obtain API credentials from the provider
 * 2. Install the provider's SDK (if applicable)
 * 3. Replace each stub method with real API calls
 * See docs/integration-guide.md for detailed instructions.
 */
@Injectable()
export class StripeTerminalAdapter implements GatewayAdapter {
  readonly provider = 'stripe_terminal' as const;
  private readonly logger = new Logger(StripeTerminalAdapter.name);

  constructor(
    @InjectRepository(GatewayConfig)
    private readonly configRepository: Repository<GatewayConfig>,
    @InjectRepository(GatewayTransaction)
    private readonly transactionRepository: Repository<GatewayTransaction>,
  ) {}

  /**
   * Get Stripe Terminal config for a restaurant.
   */
  private async getConfig(restaurantId: string): Promise<GatewayConfig | null> {
    return this.configRepository.findOne({
      where: {
        restaurant_id: restaurantId,
        provider: 'stripe_terminal',
        is_active: true,
      },
    });
  }

  /**
   * Create a Stripe Terminal connection token.
   * Required by the mobile SDK to initialize the terminal.
   */
  async createConnectionToken(restaurantId: string): Promise<string> {
    const config = await this.getConfig(restaurantId);

    if (!config) {
      this.logger.warn(
        `Stripe Terminal not configured for restaurant ${restaurantId}`,
      );
      throw new Error('Stripe Terminal not configured for this restaurant');
    }

    this.logger.log(
      `[ADAPTER_STUB] Stripe Terminal connection token | ` +
        `POST https://api.stripe.com/v1/terminal/connection_tokens | ` +
        `secretKey=${config.credentials?.secret_key ? '***configured' : 'MISSING'} | ` +
        `locationId=${config.credentials?.location_id || 'NOT_SET'} | ` +
        `restaurantId=${restaurantId}`,
    );

    // Simulated response
    const simulatedSecret = `pst_test_sim_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    this.logger.log(
      `[SIMULATED] Stripe Terminal connection token created | ` +
        `restaurantId=${restaurantId}`,
    );

    return simulatedSecret;
  }

  /**
   * Create a Stripe PaymentIntent for Tap to Pay.
   * The mobile SDK uses the client_secret to collect and confirm the payment.
   */
  async createPaymentIntent(
    params: ProcessPaymentParams,
  ): Promise<{ client_secret: string; payment_intent_id: string }> {
    const config = await this.getConfig(params.restaurant_id);

    if (!config) {
      throw new Error('Stripe Terminal not configured for this restaurant');
    }

    this.logger.log(
      `[ADAPTER_STUB] Stripe Terminal PaymentIntent | ` +
        `POST https://api.stripe.com/v1/payment_intents | ` +
        `amount=${params.amount} | ` +
        `currency=brl | ` +
        `payment_method_types=['card_present'] | ` +
        `capture_method=automatic | ` +
        `orderId=${params.order_id} | ` +
        `restaurantId=${params.restaurant_id}`,
    );

    // Simulated response
    const simulatedId = `pi_sim_${Date.now()}`;
    const simulatedSecret = `${simulatedId}_secret_sim_${Math.random().toString(36).substring(2, 11)}`;

    this.logger.log(
      `[SIMULATED] Stripe Terminal PaymentIntent created | ` +
        `intentId=${simulatedId} | ` +
        `amount_cents=${params.amount}`,
    );

    return {
      client_secret: simulatedSecret,
      payment_intent_id: simulatedId,
    };
  }

  /**
   * Process payment via Stripe Terminal.
   *
   * For Tap to Pay, the actual card reading happens on the mobile device.
   * This method creates the PaymentIntent and returns the client_secret.
   * The mobile SDK handles collectPaymentMethod and confirmPaymentIntent.
   * The webhook payment_intent.succeeded confirms success.
   */
  async processPayment(params: ProcessPaymentParams): Promise<PaymentResult> {
    // Check idempotency
    const existingTx = await this.transactionRepository.findOne({
      where: { idempotency_key: params.idempotency_key },
    });
    if (existingTx) {
      this.logger.warn(
        `Duplicate payment detected: idempotency_key=${params.idempotency_key}`,
      );
      return {
        success: existingTx.status === 'completed',
        transaction_id: existingTx.id,
        external_id: existingTx.external_id || '',
        status: existingTx.status as 'completed' | 'pending' | 'failed',
        client_secret: existingTx.metadata?.client_secret,
      };
    }

    // Create GatewayTransaction record
    const correlationId = `stripe_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const gatewayTx = this.transactionRepository.create({
      restaurant_id: params.restaurant_id,
      order_id: params.order_id,
      provider: 'stripe_terminal',
      payment_method: 'tap_to_pay',
      amount_cents: params.amount,
      status: 'pending',
      idempotency_key: params.idempotency_key,
      correlation_id: correlationId,
      metadata: params.metadata || {},
    });
    await this.transactionRepository.save(gatewayTx);

    try {
      const { client_secret, payment_intent_id } =
        await this.createPaymentIntent(params);

      // Update transaction with Stripe data
      gatewayTx.external_id = payment_intent_id;
      gatewayTx.metadata = {
        ...gatewayTx.metadata,
        client_secret,
        payment_intent_id,
        simulated: true,
      };
      await this.transactionRepository.save(gatewayTx);

      return {
        success: true,
        transaction_id: gatewayTx.id,
        external_id: payment_intent_id,
        status: 'pending', // Pending until mobile confirms
        client_secret,
      };
    } catch (error) {
      const err = error as Error;
      gatewayTx.status = 'failed';
      gatewayTx.error_code = 'STRIPE_ERROR';
      gatewayTx.error_message = err.message;
      await this.transactionRepository.save(gatewayTx);

      return {
        success: false,
        transaction_id: gatewayTx.id,
        external_id: '',
        status: 'failed',
        error_code: 'STRIPE_ERROR',
        error_message: err.message,
      };
    }
  }

  /**
   * Refund a Stripe Terminal payment.
   */
  async refundPayment(
    transactionId: string,
    amount?: number,
  ): Promise<RefundResult> {
    const gatewayTx = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!gatewayTx) {
      return {
        success: false,
        refund_id: '',
        refunded_amount: 0,
        status: 'failed',
        error_code: 'TRANSACTION_NOT_FOUND',
        error_message: `Transaction ${transactionId} not found`,
      };
    }

    const refundAmount = amount || gatewayTx.amount_cents;

    if (gatewayTx.refunded_amount_cents + refundAmount > gatewayTx.amount_cents) {
      return {
        success: false,
        refund_id: '',
        refunded_amount: 0,
        status: 'failed',
        error_code: 'REFUND_EXCEEDS_AMOUNT',
        error_message: 'Refund amount exceeds original payment',
      };
    }

    this.logger.log(
      `[ADAPTER_STUB] Stripe Terminal refund | ` +
        `POST https://api.stripe.com/v1/refunds | ` +
        `payment_intent=${gatewayTx.external_id} | ` +
        `amount=${refundAmount} | ` +
        `transactionId=${transactionId}`,
    );

    gatewayTx.refunded_amount_cents += refundAmount;
    gatewayTx.status =
      gatewayTx.refunded_amount_cents >= gatewayTx.amount_cents
        ? 'refunded'
        : 'partially_refunded';
    await this.transactionRepository.save(gatewayTx);

    const simulatedRefundId = `re_sim_${Date.now()}`;

    this.logger.log(
      `[SIMULATED] Stripe Terminal refund completed | ` +
        `refundId=${simulatedRefundId} | ` +
        `amount_cents=${refundAmount} | ` +
        `status=${gatewayTx.status}`,
    );

    return {
      success: true,
      refund_id: simulatedRefundId,
      refunded_amount: refundAmount,
      status: gatewayTx.status as 'refunded' | 'partially_refunded',
    };
  }

  /**
   * Get payment status from Stripe.
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    const gatewayTx = await this.transactionRepository.findOne({
      where: { id: transactionId },
    });

    if (!gatewayTx) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    this.logger.log(
      `[ADAPTER_STUB] Stripe Terminal status | ` +
        `GET https://api.stripe.com/v1/payment_intents/${gatewayTx.external_id} | ` +
        `transactionId=${transactionId}`,
    );

    return {
      transaction_id: gatewayTx.id,
      external_id: gatewayTx.external_id || '',
      status: gatewayTx.status as any,
      amount: gatewayTx.amount_cents,
      refunded_amount: gatewayTx.refunded_amount_cents,
      payment_method: gatewayTx.payment_method as any,
      updated_at: gatewayTx.updated_at,
    };
  }
}
