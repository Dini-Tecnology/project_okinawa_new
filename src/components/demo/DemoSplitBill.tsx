/**
 * DemoSplitBill — Shared premium split bill panel
 * Consistent split-payment experience across all service types
 */
import React, { useState } from 'react';
import {
  ArrowLeft, CreditCard, Users, User, Check, DollarSign,
  Receipt, type LucideIcon,
} from 'lucide-react';

// ============ TYPES ============

export interface SplitPerson {
  id: string;
  name: string;
  color: string; // tailwind bg class e.g. 'bg-primary'
  initial: string;
  amount?: number;
  paid?: boolean;
  items?: { name: string; price: number }[];
}

export interface SplitSummaryLine {
  label: string;
  value: string;
  highlight?: 'success' | 'warning';
}

export type SplitMode = 'individual' | 'equal' | 'selective' | 'fixed';

export interface SplitModeOption {
  id: SplitMode;
  name: string;
  desc: string;
  icon: LucideIcon;
}

export interface SplitBillConfig {
  /** Title shown in gradient header */
  title?: string;
  /** Subtitle */
  subtitle?: string;
  /** Total to split */
  total: string;
  /** Total label */
  totalLabel?: string;
  /** People at the table */
  people: SplitPerson[];
  /** Available split modes (default: all 4) */
  modes?: SplitModeOption[];
  /** Default split mode */
  defaultMode?: SplitMode;
  /** Summary lines shown below modes */
  summaryLines?: SplitSummaryLine[];
  /** "Your amount" to display */
  yourAmount?: string;
  /** Back handler */
  onBack: () => void;
  /** Proceed to payment */
  onProceed: () => void;
  /** CTA label */
  ctaLabel?: string;
}

// ============ DEFAULT MODES ============

const DEFAULT_MODES: SplitModeOption[] = [
  { id: 'individual', name: 'Meus Itens', desc: 'Cada um paga o que pediu', icon: User },
  { id: 'equal', name: 'Partes Iguais', desc: 'Divide igualmente', icon: Users },
  { id: 'selective', name: 'Por Item', desc: 'Escolha itens específicos', icon: Receipt },
  { id: 'fixed', name: 'Valor Fixo', desc: 'Defina quanto pagar', icon: DollarSign },
];

// ============ COMPONENT ============

const DemoSplitBill: React.FC<SplitBillConfig> = ({
  title = 'Dividir Conta',
  subtitle,
  total,
  totalLabel = 'Total da mesa',
  people,
  modes = DEFAULT_MODES,
  defaultMode = 'individual',
  summaryLines,
  yourAmount,
  onBack,
  onProceed,
  ctaLabel,
}) => {
  const [splitMode, setSplitMode] = useState<SplitMode>(defaultMode);

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
        {/* People at table */}
        <div className="bg-card rounded-2xl p-4 shadow-lg border border-border">
          <h2 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />Na mesa
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {people.map((person) => (
              <div
                key={person.id}
                className={`flex-shrink-0 p-3 rounded-2xl border-2 min-w-[85px] text-center ${
                  person.paid
                    ? 'border-success bg-success/5'
                    : person.id === 'you'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background'
                }`}
              >
                <div className={`w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center text-primary-foreground font-bold text-sm ${
                  person.paid ? 'bg-success' : person.color
                }`}>
                  {person.paid ? <Check className="w-4 h-4" /> : person.initial}
                </div>
                <p className="text-xs font-medium text-foreground truncate">{person.name.split(' ')[0]}</p>
                {person.amount !== undefined && (
                  <p className="text-[10px] text-muted-foreground font-semibold">R$ {person.amount}</p>
                )}
                {person.paid && (
                  <p className="text-[10px] text-success font-semibold">✓ Pago</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Split Modes */}
        <div className="bg-card rounded-2xl p-4 shadow-md border border-border">
          <h2 className="font-semibold text-foreground text-sm mb-3">Como dividir?</h2>
          <div className="grid grid-cols-2 gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSplitMode(mode.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  splitMode === mode.id
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    splitMode === mode.id ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <mode.icon className={`w-4 h-4 ${
                      splitMode === mode.id ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                </div>
                <p className={`text-xs font-semibold ${
                  splitMode === mode.id ? 'text-primary' : 'text-foreground'
                }`}>{mode.name}</p>
                <p className="text-[10px] text-muted-foreground">{mode.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Summary Lines */}
        {summaryLines && summaryLines.length > 0 && (
          <div className="bg-card rounded-2xl p-4 shadow-md border border-border">
            <div className="space-y-2">
              {summaryLines.map((line, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className={
                    line.highlight === 'success' ? 'text-success' :
                    line.highlight === 'warning' ? 'text-warning' :
                    'text-muted-foreground'
                  }>{line.label}</span>
                  <span className={
                    line.highlight === 'success' ? 'text-success font-medium' :
                    line.highlight === 'warning' ? 'text-warning font-medium' :
                    'text-foreground'
                  }>{line.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your amount highlight */}
        {yourAmount && (
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
            <p className="text-xs font-semibold text-foreground mb-1">Você paga:</p>
            <div className="flex justify-between font-bold text-lg">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{yourAmount}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="p-4 bg-card border-t border-border">
        <button
          onClick={onProceed}
          className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <CreditCard className="w-5 h-5" />
          {ctaLabel || 'Prosseguir para Pagamento'}
        </button>
      </div>
    </div>
  );
};

export default DemoSplitBill;
