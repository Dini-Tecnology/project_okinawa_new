import React, { forwardRef } from 'react';

interface NooweLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'dark' | 'light';
}

const sizes = {
  sm: { font: 18, markH: 15 },
  md: { font: 24, markH: 20 },
  lg: { font: 34, markH: 28 },
};

const NooweLogo = forwardRef<HTMLSpanElement, NooweLogoProps>(({ size = 'md', className = '', variant = 'dark' }, ref) => {
  const { font, markH } = sizes[size];
  const cx = markH / 2;
  const r = markH * 0.40;
  const offset = r * 0.38;
  const sw = r * 0.24;
  const textColor = variant === 'light' ? 'text-white' : 'text-foreground';

  return (
    <span ref={ref} className={`inline-flex items-center select-none ${className}`} style={{ gap: 1 }}>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: font,
          fontWeight: 500,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
        className={textColor}
      >
        n
      </span>
      <svg
        width={markH * 1.1}
        height={markH}
        viewBox={`0 0 ${markH * 1.1} ${markH}`}
        className="flex-shrink-0"
        style={{ margin: '0 -1px', position: 'relative', top: 1 }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`noowe-grad-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF5E3A" />
            <stop offset="100%" stopColor="#0D4F4F" />
          </linearGradient>
        </defs>
        <circle cx={cx - offset + markH * 0.05} cy={cx} r={r} fill="none" stroke={`url(#noowe-grad-${size})`} strokeWidth={sw} />
        <circle cx={cx + offset + markH * 0.05} cy={cx} r={r} fill="none" stroke={`url(#noowe-grad-${size})`} strokeWidth={sw} />
      </svg>
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: font,
          fontWeight: 500,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
        className={textColor}
      >
        we
      </span>
    </span>
  );
});

NooweLogo.displayName = 'NooweLogo';
export default NooweLogo;
