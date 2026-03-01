import React from "react";

interface NoweeLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  variant?: "full" | "mark" | "wordmark";
  theme?: "light" | "dark" | "auto";
  className?: string;
}

const sizeMap = {
  xs: { height: 24, fontSize: 14, markSize: 20, gap: 6 },
  sm: { height: 32, fontSize: 20, markSize: 28, gap: 8 },
  md: { height: 44, fontSize: 28, markSize: 38, gap: 10 },
  lg: { height: 60, fontSize: 38, markSize: 50, gap: 12 },
  xl: { height: 80, fontSize: 52, markSize: 66, gap: 14 },
  "2xl": { height: 110, fontSize: 72, markSize: 90, gap: 18 },
};

/**
 * NOOWE Brand Logo
 *
 * The mark is two interlocking "O" rings — one warm orange, one teal —
 * linked like chain links to symbolize connection and shared experiences.
 *
 * Modern Chic. Minimal. Memorable.
 */
const NoweeLogo: React.FC<NoweeLogoProps> = ({
  size = "md",
  variant = "full",
  theme = "auto",
  className = "",
}) => {
  const { height, fontSize, markSize, gap } = sizeMap[size];

  const fontStyle: React.CSSProperties = {
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    fontSize: `${fontSize}px`,
    lineHeight: `${height}px`,
  };

  // Overlap amount between the two O's (negative margin)
  const overlap = fontSize * -0.18;

  /**
   * Interlocked OO — two "O" characters from the same font,
   * overlapping like a chain/Venn diagram.
   * Left O = primary (orange), Right O = secondary (teal).
   * A small clip trick makes them appear linked, not just overlapping.
   */
  const InterlockedOO = () => (
    <span className="inline-flex items-baseline relative" aria-hidden="true">
      {/* Left O — orange, slightly in front at top */}
      <span
        className="text-primary relative"
        style={{
          ...fontStyle,
          fontWeight: 700,
          zIndex: 2,
        }}
      >
        o
      </span>
      {/* Right O — teal, overlapping left */}
      <span
        className="text-secondary relative"
        style={{
          ...fontStyle,
          fontWeight: 700,
          marginLeft: `${overlap}px`,
          zIndex: 1,
        }}
      >
        o
      </span>
      {/* Chain-link effect: redraw a small segment of the right O on top
          so it appears to pass OVER the left O at the bottom intersection */}
      <span
        className="absolute text-secondary"
        style={{
          ...fontStyle,
          fontWeight: 700,
          left: `${fontSize + overlap}px`,
          top: 0,
          zIndex: 3,
          clipPath: `inset(55% 40% 0% 20%)`,
        }}
      >
        o
      </span>
    </span>
  );

  // Mark-only: just the interlocked OO
  if (variant === "mark") {
    return (
      <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOOWE">
        <span style={fontStyle}>
          <InterlockedOO />
        </span>
      </div>
    );
  }

  const Wordmark = () => (
    <span
      className="text-foreground tracking-tight inline-flex items-baseline"
      style={fontStyle}
    >
      n
      <InterlockedOO />
      we
    </span>
  );

  if (variant === "wordmark") {
    return (
      <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOOWE">
        <Wordmark />
      </div>
    );
  }

  // Full = unified wordmark (no separate mark + text)
  return (
    <div
      className={`inline-flex items-center ${className}`}
      role="img"
      aria-label="NOOWE"
    >
      <Wordmark />
    </div>
  );
};

export default NoweeLogo;
