import React, { forwardRef } from 'react';

interface NooweLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'dark' | 'light';
}

const sizes = {
  sm: { font: 20, gap: 2 },
  md: { font: 26, gap: 3 },
  lg: { font: 38, gap: 4 },
};

const NooweLogo = forwardRef<HTMLSpanElement, NooweLogoProps>(
  ({ size = 'md', className = '', variant = 'dark' }, ref) => {
    const { font, gap } = sizes[size];
    const dotSize = font * 0.18;
    const textColor = variant === 'light' ? 'text-white' : 'text-foreground';

    return (
      <span
        ref={ref}
        className={`inline-flex items-center select-none ${className}`}
        style={{ gap }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: font,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
          className={textColor}
        >
          n
        </span>
        <span className="relative flex items-center" style={{ width: dotSize * 3.2, height: font * 0.7 }}>
          <span
            className="absolute rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: '#FF5E3A',
              left: dotSize * 0.4,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              width: dotSize,
              height: dotSize,
              backgroundColor: '#0D4F4F',
              right: dotSize * 0.4,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
        </span>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: font,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
          className={textColor}
        >
          we
        </span>
      </span>
    );
  }
);

NooweLogo.displayName = 'NooweLogo';
export default NooweLogo;
