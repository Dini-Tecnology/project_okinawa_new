import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_OPTIONS: { mode: ViewportMode; label: string; icon: React.FC<{ className?: string }> }[] = [
  { mode: 'mobile', label: 'Mobile', icon: Smartphone },
  { mode: 'tablet', label: 'Tablet', icon: Tablet },
  { mode: 'desktop', label: 'Desktop', icon: Monitor },
];

interface ViewportSwitchProps {
  value: ViewportMode;
  onChange: (mode: ViewportMode) => void;
}

export function ViewportSwitch({ value, onChange }: ViewportSwitchProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-0.5">
      {VIEWPORT_OPTIONS.map(({ mode, label, icon: Icon }) => {
        const isActive = value === mode;
        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            aria-pressed={isActive}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            }`}
            title={label}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
