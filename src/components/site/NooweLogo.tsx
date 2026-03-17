import React, { forwardRef } from 'react';

interface NooweLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'dark' | 'light';
}

const sizes = {
  sm: { font: 22, dot: 5 },
  md: { font: 28, dot: 6.5 },
  lg: { font: 42, dot: 9 },
};

const NooweLogo = forwardRef<HTMLSpanElement, NooweLogoProps>(
  ({ size = 'md', className = '', variant = 'dark' }, ref) => {
    const { font, dot } = sizes[size];
    const textColor = variant === 'light' ? 'text-white' : 'text-foreground';

    return (
      <span
        ref={ref}
        className={`inline-flex items-baseline select-none ${className}`}
        style={{ gap: font * 0.04 }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: font,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
          className={textColor}
        >
          no
        </span>
        <span className="relative inline-flex items-center" style={{ width: dot * 2.8, height: font * 0.55, alignSelf: 'center' }}>
          <span
            className="absolute rounded-full"
            style={{
              width: dot,
              height: dot,
              background: 'linear-gradient(135deg, #FF5E3A, #FF8A65)',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              boxShadow: '0 0 8px rgba(255, 94, 58, 0.3)',
            }}
          />
          <span
            className="absolute rounded-full"
            style={{
              width: dot,
              height: dot,
              background: 'linear-gradient(135deg, #0D4F4F, #1A7A7A)',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              boxShadow: '0 0 8px rgba(13, 79, 79, 0.3)',
            }}
          />
        </span>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: font,
            fontWeight: 700,
            letterSpacing: '-0.03em',
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
