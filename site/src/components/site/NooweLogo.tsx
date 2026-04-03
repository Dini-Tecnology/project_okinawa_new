import React, { forwardRef } from 'react';
import nooweLogo from '@/assets/noowe-logo-svg-cropped.png';

interface NooweLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'dark' | 'light';
  iconOnly?: boolean;
}

const sizes = {
  sm: { h: 28 },
  md: { h: 36 },
  lg: { h: 52 },
};

const NooweLogo = forwardRef<HTMLSpanElement, NooweLogoProps>(
  ({ size = 'md', className = '' }, ref) => {
    const { h } = sizes[size];

    return (
      <span ref={ref} className={`inline-flex items-center ${className}`}>
        <img src={nooweLogo} alt="NOOWE" style={{ height: h, width: 'auto', maxWidth: 'none' }} draggable={false} />
      </span>
    );
  }
);

NooweLogo.displayName = 'NooweLogo';
export default NooweLogo;
