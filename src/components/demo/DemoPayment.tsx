/**
 * DemoPayment — Shared premium payment panel
 * Follows the aesthetic of DemoOrderStatus (gradient header, card layout)
 * Supports all service types with consistent visual language
 */
import React, { useState } from 'react';
import {
  ArrowLeft, CreditCard, QrCode, Smartphone, Wallet, Check,
  Award, Clock, Zap, Gift, type LucideIcon,
} from 'lucide-react';
import { useDemoI18n } from './DemoI18n';

// ============ TYPES ============

export interface PaymentLineItem {
  label: string;
  value: string;
  highlight?: 'success' | 'warning' | 'accent';
}

export interface PaymentLoyalty {
  /** e.g. "340 pontos disponíveis" */
  title: string;
  /** e.g. "Use 200 pts = R$ 10 de desconto" */
  subtitle: string;
  /** e.g. "Usar" */
  actionLabel?: string;
}

export interface PaymentConfig {
  /** Title shown in gradient header */
  title?: string;
  /** Subtitle (e.g. "Mesa 7 · Bistrô Noowe") */
  subtitle?: string;
  /** Total amount displayed prominently */
  total: string;
  /** Label above total e.g. "Total da mesa" */
  totalLabel?: string;
  /** Summary line items */
  items: PaymentLineItem[];
  /** Show loyalty badge */
  loyalty?: PaymentLoyalty;
  /** Show tip selector */
  showTip?: boolean;
  /** Default tip percentage */
  defaultTip?: number;
  /** Tip base value for calculation */
  tipBase?: number;
  /** Show all 6 payment methods or simplified 2 */
  fullMethodGrid?: boolean;
  /** Extra info banner below methods */
  infoBanner?: { icon: LucideIcon; text: string; variant?: 'success' | 'primary' | 'warning' };
  /** CTA label */
  ctaLabel?: string;
  /** Back navigation handler */
  onBack: () => void;
  /** Confirm payment handler */
  onConfirm: () => void;
  /** Optional estimated time */
  estimatedTime?: string;
}

// ============ PAYMENT METHODS ============

const FULL_METHODS = [
  { id: 'pix', name: 'PIX', icon: QrCode },
  { id: 'credit', name: 'Crédito', icon: CreditCard },
  { id: 'apple', name: 'Apple Pay', icon: Smartphone },
  { id: 'google', name: 'Google Pay', icon: Smartphone },
  { id: 'tap', name: 'TAP to Pay', icon: Zap },
  { id: 'wallet', name: 'Carteira', icon: Wallet },
];

const SIMPLE_METHODS = [
  { id: 'card', name: 'Cartão vinculado', detail: '•••• 4242 · Visa', icon: CreditCard },
  { id: 'pix', name: 'PIX', detail: 'Pagamento instantâneo', icon: QrCode },
];

// ============ COMPONENT ============

const DemoPayment: React.FC<PaymentConfig> = ({
  title = 'Pagamento',
  subtitle,
  total,
  totalLabel = 'Total',
  items,
  loyalty,
  showTip = false,
  defaultTip = 10,
  tipBase = 0,
  fullMethodGrid = true,
  infoBanner,
  ctaLabel,
  onBack,
  onConfirm,
  estimatedTime,
}) => {
  const { translateText } = useDemoI18n();
  const [selectedPayment, setSelectedPayment] = useState(fullMethodGrid ? 'pix' : 'card');
  const [tipPercent, setTipPercent] = useState(defaultTip);
  const [usedPoints, setUsedPoints] = useState(false);

  const tipAmount = showTip && tipBase > 0 ? Math.round(tipBase * tipPercent / 100) : 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Gradient Header ── */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-accent px-4 pt-4 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary-foreground">{title}</h1>
            {subtitle && <p className="text-primary-foreground/80 text-sm">{subtitle}</p>}
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary-foreground">{total}</p>
            <p className="text-[10px] text-primary-foreground/70">{totalLabel}</p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto -mt-4 px-4 pb-4 space-y-4">
        {/* Loyalty */}
        {loyalty && (
          <div className="bg-card rounded-2xl p-4 shadow-lg border border-border flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{translateText(loyalty.title)}</p>
              <p className="text-xs text-muted-foreground">{translateText(loyalty.subtitle)}</p>
            </div>
            {loyalty.actionLabel && (
              <button
                onClick={() => setUsedPoints(!usedPoints)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  usedPoints
                    ? 'bg-success/20 text-success'
                    : 'bg-accent/20 text-accent'
                }`}
              >
                {usedPoints ? `✓ ${translateText('Usado')}` : translateText(loyalty.actionLabel)}
              </button>
            )}
          </div>
        )}

        {/* Tip Selector */}
        {showTip && (
          <div className="bg-card rounded-2xl p-4 shadow-md border border-border">
            <h2 className="font-semibold text-foreground text-sm mb-3">{translateText('Gorjeta')}</h2>
            <div className="flex gap-2">
              {[0, 10, 15, 20].map((p) => (
                <button
                  key={p}
                  onClick={() => setTipPercent(p)}
                  className={`flex-1 py-3 rounded-xl border-2 text-center transition-all ${
                    tipPercent === p
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background'
                  }`}
                >
                  <p className={`text-sm font-bold ${tipPercent === p ? 'text-primary' : 'text-foreground'}`}>
                    {p === 0 ? translateText('Sem') : `${p}%`}
                  </p>
                  {p > 0 && tipBase > 0 && (
                    <p className="text-[9px] text-muted-foreground">
                      R$ {Math.round(tipBase * p / 100)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="bg-card rounded-2xl p-4 shadow-md border border-border">
          <h2 className="font-semibold text-foreground text-sm mb-3">{translateText('Forma de pagamento')}</h2>
          {fullMethodGrid ? (
            <div className="grid grid-cols-3 gap-2">
              {FULL_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    selectedPayment === method.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background'
                  }`}
                >
                  <method.icon className={`w-5 h-5 mx-auto mb-1 ${
                    selectedPayment === method.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <span className={`text-xs font-medium ${
                    selectedPayment === method.id ? 'text-primary' : 'text-muted-foreground'
                  }`}>{method.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {SIMPLE_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    selectedPayment === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background'
                  }`}
                >
                  <method.icon className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">{method.name}</p>
                    <p className="text-[10px] text-muted-foreground">{method.detail}</p>
                  </div>
                  {selectedPayment === method.id && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        {infoBanner && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 ${
            infoBanner.variant === 'success'
              ? 'bg-success/10 border-success/20'
              : infoBanner.variant === 'warning'
                ? 'bg-warning/10 border-warning/20'
                : 'bg-primary/5 border-primary/20'
          }`}>
            <infoBanner.icon className={`w-4 h-4 shrink-0 ${
              infoBanner.variant === 'success'
                ? 'text-success'
                : infoBanner.variant === 'warning'
                  ? 'text-warning'
                  : 'text-primary'
            }`} />
            <span className={`text-xs font-medium ${
              infoBanner.variant === 'success'
                ? 'text-success'
                : infoBanner.variant === 'warning'
                  ? 'text-warning'
                  : 'text-primary'
            }`}>{infoBanner.text}</span>
          </div>
        )}

        {/* Estimated time */}
        {estimatedTime && (
          <div className="p-3 rounded-xl bg-muted/30 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Preparo estimado: <strong>{estimatedTime}</strong></span>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-card rounded-2xl p-4 shadow-md border border-border">
          <h3 className="font-semibold text-foreground text-sm mb-3">Resumo</h3>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className={
                  item.highlight === 'success' ? 'text-success' :
                  item.highlight === 'warning' ? 'text-warning' :
                  item.highlight === 'accent' ? 'text-accent' :
                  'text-muted-foreground'
                }>{item.label}</span>
                <span className={
                  item.highlight === 'success' ? 'text-success font-medium' :
                  item.highlight === 'warning' ? 'text-warning font-medium' :
                  item.highlight === 'accent' ? 'text-accent font-medium' :
                  'text-foreground'
                }>{item.value}</span>
              </div>
            ))}
            {showTip && tipPercent > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gorjeta ({tipPercent}%)</span>
                <span>R$ {tipAmount}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 mt-1 flex justify-between">
              <span className="font-semibold text-foreground">{totalLabel}</span>
              <span className="font-bold text-xl text-primary">{total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="p-4 bg-card border-t border-border">
        <button
          onClick={onConfirm}
          className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {ctaLabel || `Pagar ${total}`}
        </button>
      </div>
    </div>
  );
};

export default DemoPayment;
