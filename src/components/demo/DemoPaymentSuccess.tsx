/**
 * DemoPaymentSuccess — Shared premium payment confirmation
 * Consistent success state across all 11 service types
 */
import React from 'react';
import { Check, Gift, Award, type LucideIcon } from 'lucide-react';

export interface SuccessLineItem {
  label: string;
  value: string;
  highlight?: 'success' | 'warning' | 'primary';
}

export interface SuccessStat {
  label: string;
  value: string;
}

export interface PaymentSuccessConfig {
  /** Main icon in the circle (default: Check) */
  icon?: LucideIcon;
  /** Gradient colors for the icon circle */
  gradientFrom?: string;
  gradientTo?: string;
  shadowColor?: string;
  /** Heading text */
  heading?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Summary line items */
  summaryItems?: SuccessLineItem[];
  /** Loyalty reward text */
  loyaltyReward?: { points: string; description: string };
  /** Badge text (e.g. "Selo de família ganho!") */
  badge?: { icon?: LucideIcon; text: string };
  /** Stats row (e.g. time, drinks, etc) */
  stats?: SuccessStat[];
  /** Primary action button */
  primaryAction?: { label: string; onClick: () => void; icon?: LucideIcon };
  /** Secondary action button */
  secondaryAction?: { label: string; onClick: () => void; icon?: LucideIcon };
}

const DemoPaymentSuccess: React.FC<PaymentSuccessConfig> = ({
  icon: Icon = Check,
  gradientFrom = 'from-success',
  gradientTo = 'to-success/80',
  shadowColor = 'shadow-success/30',
  heading = 'Pagamento Confirmado!',
  subtitle,
  summaryItems,
  loyaltyReward,
  badge,
  stats,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Success Icon */}
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center mb-5 shadow-xl ${shadowColor}`}>
          <Icon className="w-12 h-12 text-primary-foreground" />
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground mb-1">{heading}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>}

        {/* Summary Card */}
        {summaryItems && summaryItems.length > 0 && (
          <div className="w-full p-4 rounded-2xl bg-card border border-border mb-4">
            {summaryItems.map((item, i) => (
              <div key={i} className={`flex justify-between text-sm ${i > 0 ? 'mt-1' : ''}`}>
                <span className={
                  item.highlight === 'success' ? 'text-success' :
                  item.highlight === 'warning' ? 'text-warning' :
                  item.highlight === 'primary' ? 'text-primary' :
                  'text-muted-foreground'
                }>{item.label}</span>
                <span className={`font-semibold ${
                  item.highlight === 'success' ? 'text-success' :
                  item.highlight === 'warning' ? 'text-warning' :
                  item.highlight === 'primary' ? 'text-primary' :
                  'text-foreground'
                }`}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Loyalty Reward */}
        {loyaltyReward && (
          <div className="w-full p-4 rounded-2xl bg-primary/5 border border-primary/20 mb-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{loyaltyReward.points}</p>
              <p className="text-xs text-muted-foreground">{loyaltyReward.description}</p>
            </div>
          </div>
        )}

        {/* Badge */}
        {badge && (
          <div className="w-full p-3 rounded-xl bg-muted/30 border border-border mb-3 flex items-center gap-3">
            {badge.icon ? <badge.icon className="w-4 h-4 text-accent shrink-0" /> : <Award className="w-4 h-4 text-accent shrink-0" />}
            <p className="text-xs text-muted-foreground">{badge.text}</p>
          </div>
        )}

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <div className={`w-full grid grid-cols-${Math.min(stats.length, 4)} gap-2 mb-4`}>
            {stats.map((stat, i) => (
              <div key={i} className="p-3 rounded-xl bg-muted/30 text-center">
                <p className="text-sm font-bold text-foreground">{stat.value}</p>
                <p className="text-[9px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="w-full space-y-3 mt-2">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-2xl shadow-xl shadow-primary/25 flex items-center justify-center gap-2"
            >
              {primaryAction.icon && <primaryAction.icon className="w-4 h-4" />}
              {primaryAction.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="w-full py-3 border border-border rounded-xl font-semibold text-sm text-foreground flex items-center justify-center gap-2"
            >
              {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4" />}
              {secondaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoPaymentSuccess;
