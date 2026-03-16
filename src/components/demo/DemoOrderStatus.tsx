/**
 * DemoOrderStatus — Shared premium order tracking panel
 * Follows the aesthetic of OrderStatusScreenV2 (Mobile Preview V2)
 * Supports custom steps per service type while maintaining visual consistency
 */
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Check, Clock, ChefHat, UtensilsCrossed, Bell,
  MessageCircle, Loader2, CheckCircle, Zap, Search,
  Package, Truck, MapPin, Scale, Flame, Wine,
  type LucideIcon,
} from 'lucide-react';
import { useDemoI18n } from './DemoI18n';

// ============ TYPES ============

export interface OrderStatusStep {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface OrderStatusItem {
  id: string | number;
  name: string;
  status: 'ready' | 'preparing' | 'queued' | 'pending';
  eta: string;
  chef?: string;
  quantity?: number;
}

export interface OrderStatusConfig {
  /** Title shown in header */
  title?: string;
  /** Subtitle (e.g. "Mesa 12 • Bistrô Noowe") */
  subtitle?: string;
  /** Order number/code */
  orderCode?: string;
  /** ETA range text */
  etaRange?: string;
  /** Progress percentage 0-100 */
  progress?: number;
  /** Pipeline steps (customizable per service type) */
  steps: OrderStatusStep[];
  /** Current active step index (0-based) */
  activeStep: number;
  /** Items being tracked */
  items: OrderStatusItem[];
  /** Back navigation handler */
  onBack: () => void;
  /** Optional action button at the bottom */
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  /** Optional: show pickup code instead of waiter button */
  pickupCode?: string;
  /** Optional: show table info */
  tableInfo?: {
    label: string;
    sublabel: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  /** Help options shown when bell is tapped */
  helpOptions?: string[];
}

// ============ PRESET STEPS PER SERVICE TYPE ============

export const ORDER_STEPS = {
  fineDining: [
    { id: 'received', label: 'Recebido', icon: CheckCircle },
    { id: 'preparing', label: 'Preparando', icon: ChefHat },
    { id: 'ready', label: 'Pronto', icon: UtensilsCrossed },
    { id: 'delivered', label: 'Entregue', icon: Check },
  ] as OrderStatusStep[],

  quickService: [
    { id: 'received', label: 'Recebido', icon: CheckCircle },
    { id: 'preparing', label: 'Preparando', icon: ChefHat },
    { id: 'quality', label: 'Conferência', icon: Search },
    { id: 'ready', label: 'Pronto', icon: Zap },
  ] as OrderStatusStep[],

  fastCasual: [
    { id: 'received', label: 'Recebido', icon: CheckCircle },
    { id: 'base', label: 'Base', icon: Flame },
    { id: 'toppings', label: 'Montagem', icon: UtensilsCrossed },
    { id: 'quality', label: 'Qualidade', icon: Search },
    { id: 'ready', label: 'Pronto', icon: Zap },
  ] as OrderStatusStep[],

  cafeBakery: [
    { id: 'received', label: 'Recebido', icon: CheckCircle },
    { id: 'preparing', label: 'Preparando', icon: ChefHat },
    { id: 'ready', label: 'Pronto', icon: Check },
  ] as OrderStatusStep[],

  buffet: [
    { id: 'checked-in', label: 'Check-in', icon: CheckCircle },
    { id: 'weighing', label: 'Pesando', icon: Scale },
    { id: 'extras', label: 'Extras', icon: ChefHat },
    { id: 'complete', label: 'Completo', icon: Check },
  ] as OrderStatusStep[],

  driveThru: [
    { id: 'received', label: 'Recebido', icon: CheckCircle },
    { id: 'preparing', label: 'Preparando', icon: ChefHat },
    { id: 'ready', label: 'Pronto', icon: Package },
    { id: 'window', label: 'Janela', icon: Truck },
  ] as OrderStatusStep[],

  foodTruck: [
    { id: 'received', label: 'Recebido', icon: CheckCircle },
    { id: 'preparing', label: 'Preparando', icon: ChefHat },
    { id: 'ready', label: 'Pronto', icon: Zap },
  ] as OrderStatusStep[],

  chefsTable: [
    { id: 'received', label: 'Recebido', icon: CheckCircle },
    { id: 'plating', label: 'Empratando', icon: ChefHat },
    { id: 'sommelier', label: 'Sommelier', icon: Wine },
    { id: 'served', label: 'Servido', icon: UtensilsCrossed },
  ] as OrderStatusStep[],

  casualDining: [
    { id: 'received', label: 'Recebido', icon: CheckCircle },
    { id: 'preparing', label: 'Preparando', icon: ChefHat },
    { id: 'ready', label: 'Pronto', icon: UtensilsCrossed },
    { id: 'delivered', label: 'Entregue', icon: Check },
  ] as OrderStatusStep[],

  pubBar: [
    { id: 'received', label: 'Recebido', icon: CheckCircle },
    { id: 'preparing', label: 'Preparando', icon: ChefHat },
    { id: 'ready', label: 'Pronto', icon: Check },
  ] as OrderStatusStep[],

  club: [
    { id: 'received', label: 'Recebido', icon: CheckCircle },
    { id: 'preparing', label: 'Preparando', icon: ChefHat },
    { id: 'ready', label: 'Pronto', icon: Check },
  ] as OrderStatusStep[],
};

// ============ STATUS LABELS ============

const STATUS_CONFIG: Record<string, { label: string; badgeCls: string; dotCls: string }> = {
  ready: {
    label: 'Pronto',
    badgeCls: 'bg-success/10 text-success',
    dotCls: 'border-success/30 shadow-sm shadow-success/10',
  },
  preparing: {
    label: 'Preparando',
    badgeCls: 'bg-primary/10 text-primary',
    dotCls: 'border-primary/30 shadow-sm shadow-primary/10',
  },
  queued: {
    label: 'Na fila',
    badgeCls: 'bg-muted text-muted-foreground',
    dotCls: 'border-border',
  },
  pending: {
    label: 'Na fila',
    badgeCls: 'bg-muted text-muted-foreground',
    dotCls: 'border-border',
  },
};

// ============ COMPONENT ============

const DemoOrderStatus: React.FC<OrderStatusConfig> = ({
  title = 'Status do Pedido',
  subtitle,
  orderCode,
  etaRange = '12-18 min',
  progress = 65,
  steps,
  activeStep,
  items,
  onBack,
  actionButton,
  pickupCode,
  tableInfo,
  helpOptions = ['Dúvidas sobre o pedido', 'Solicitar algo especial', 'Reportar problema'],
}) => {
  const { translateText } = useDemoI18n();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ── Header with gradient ── */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-accent px-4 pt-4 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary-foreground">{title}</h1>
            {subtitle && (
              <p className="text-primary-foreground/80 text-sm">{subtitle}</p>
            )}
          </div>
          {orderCode && (
            <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <span className="text-xs font-bold text-primary-foreground tracking-wider">{orderCode}</span>
            </div>
          )}
        </div>

        {/* ── Progress Pipeline ── */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < activeStep;
              const isActive = index === activeStep;
              const isPending = index > activeStep;
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isActive
                        ? 'bg-white shadow-lg scale-110'
                        : isCompleted
                          ? 'bg-white/30'
                          : 'bg-white/10'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-primary-foreground" />
                      ) : (
                        <Icon className={`w-5 h-5 ${
                          isActive ? 'text-primary' : 'text-primary-foreground/50'
                        }`} />
                      )}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-medium text-center leading-tight ${
                      isActive ? 'text-primary-foreground' : 'text-primary-foreground/60'
                    }`}>
                      {translateText(step.label)}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-white/50' : 'bg-white/15'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto -mt-4">
        {/* ETA Card */}
        <div className="mx-4 bg-card rounded-3xl p-4 shadow-lg border border-border mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">{translateText('Tempo estimado')}</p>
              <p className="text-3xl font-bold text-foreground">{etaRange}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Pickup Code Card (for counter-pickup services) */}
        {pickupCode && (
          <div className="mx-4 bg-card rounded-2xl p-4 shadow-md border border-border mb-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{translateText('Código de retirada')}</p>
            <p className="font-display text-3xl font-bold tracking-widest text-primary">{pickupCode}</p>
          </div>
        )}

        {/* Items Status */}
        <div className="px-4 mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {translateText('Seus itens')}
          </h2>
          <div className="space-y-3">
            {items.map((item) => {
              const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.queued;
              return (
                <div
                  key={item.id}
                  className={`bg-card rounded-2xl p-4 border transition-all ${config.dotCls}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                      {item.quantity && item.quantity > 1 && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          x{item.quantity}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${config.badgeCls}`}>
                      {translateText(config.label)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    {item.chef && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ChefHat className="w-3.5 h-3.5" />
                        {translateText(item.chef)}
                      </span>
                    )}
                    <span className="text-primary font-medium ml-auto">~{item.eta}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Table Info */}
        {tableInfo && (
          <div className="mx-4 mb-4 p-4 rounded-2xl bg-muted/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{translateText(tableInfo.label)}</p>
              <p className="text-xs text-muted-foreground">{translateText(tableInfo.sublabel)}</p>
            </div>
            {tableInfo.actionLabel && tableInfo.onAction && (
              <button
                onClick={tableInfo.onAction}
                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold"
              >
                {translateText(tableInfo.actionLabel)}
              </button>
            )}
          </div>
        )}

        {/* Help / Call Waiter */}
        <div className="px-4 pb-6">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full p-4 rounded-2xl bg-foreground flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-muted-foreground/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-background" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-background font-semibold text-sm">{translateText('Precisa de ajuda?')}</p>
              <p className="text-muted-foreground text-xs">{translateText('Chamar equipe discretamente')}</p>
            </div>
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
          </button>

          {showHelp && (
            <div className="mt-3 p-3 bg-card rounded-2xl border border-border space-y-2">
              {helpOptions.map((opt, i) => (
                <button
                  key={i}
                  className="w-full py-3 rounded-xl bg-muted text-foreground font-medium text-sm hover:bg-muted/80 transition-colors"
                >
                  {translateText(opt)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        {actionButton && (
          <div className="px-4 pb-6">
            <button
              onClick={actionButton.onClick}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl shadow-glow flex items-center justify-center gap-2"
            >
              {actionButton.icon && <actionButton.icon className="w-5 h-5" />}
              {translateText(actionButton.label)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoOrderStatus;
