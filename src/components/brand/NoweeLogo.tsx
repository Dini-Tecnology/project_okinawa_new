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


  const Wordmark = () => (
    <span
      className="text-foreground tracking-tight inline-flex items-center"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${height}px`,
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.02em",
        textTransform: "lowercase",
      }}
    >
      <span>n</span>
      <span className="text-primary inline-block" style={{ marginRight: "-0.16em" }}>
        o
      </span>
      <span className="text-secondary inline-block" style={{ marginRight: "-0.02em" }}>
        o
      </span>
      <span>we</span>
    </span>
  );

  // Brand rule: no detached symbol; logo is always the full wordmark.
  return (
    <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOOWE">
      <Wordmark />
    </div>
  );
};

export default NoweeLogo;
