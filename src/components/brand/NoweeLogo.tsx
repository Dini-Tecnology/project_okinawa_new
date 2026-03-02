import React from "react";

interface NoweeLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "full" | "mark" | "wordmark";
  theme?: "light" | "dark" | "auto";
  className?: string;
}

const sizeMap = {
  xs: { height: 24, fontSize: 14 },
  sm: { height: 32, fontSize: 20 },
  md: { height: 44, fontSize: 28 },
  lg: { height: 60, fontSize: 38 },
  xl: { height: 80, fontSize: 52 },
  "2xl": { height: 110, fontSize: 72 },
};

/**
 * NOOWE Brand Logo
 *
 * The two "O"s in the wordmark ARE the interlocking rings mark.
 * No separate logo — the symbol lives inside the name.
 *
 * Modern Chic. Minimal. Memorable.
 */
const NoweeLogo: React.FC<NoweeLogoProps> = ({
  size = "md",
  variant = "full",
  theme = "auto",
  className = "",
}) => {
  const { height, fontSize } = sizeMap[size];


  // Inline mark sized to match the font's cap-height
  const inlineMarkHeight = fontSize * 0.85;
  const inlineMarkWidth = inlineMarkHeight * 1.45; // wider to fit two rings

  const InlineMark = () => (
    <svg
      width={inlineMarkWidth}
      height={inlineMarkHeight}
      viewBox="0 0 58 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block flex-shrink-0"
      style={{ verticalAlign: "baseline", marginBottom: `${fontSize * -0.08}px` }}
    >
      <circle cx="16" cy="20" r="12" className="stroke-primary" strokeWidth="3.5" fill="none" opacity="0.95" />
      <circle cx="42" cy="20" r="12" className="stroke-secondary" strokeWidth="3.5" fill="none" opacity="0.9" />
      <clipPath id={`noowe-clip-${size}`}>
        <rect x="24" y="8" width="6" height="12" />
      </clipPath>
      <circle cx="16" cy="20" r="12" className="stroke-primary" strokeWidth="3.5" fill="none" clipPath={`url(#noowe-clip-${size})`} />
    </svg>
  );

  const Wordmark = () => (
    <span
      className="text-foreground tracking-tight inline-flex items-baseline"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${height}px`,
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.02em",
      }}
    >
      n
      <InlineMark />
      we
    </span>
  );

  // "mark" variant — just the interlocking rings
  if (variant === "mark") {
    return (
      <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOOWE">
        <InlineMark />
      </div>
    );
  }

  // Both "full" and "wordmark" now render the same: the wordmark with inline rings
  return (
    <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOOWE">
      <Wordmark />
    </div>
  );
};

export default NoweeLogo;
