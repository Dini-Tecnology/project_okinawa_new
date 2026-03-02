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


  // "OO" inline symbol with the same visual block as text letters
  const InlineMark = () => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 60 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="22" cy="17" r="15" className="stroke-primary" strokeWidth="3.2" fill="none" />
      <circle cx="38" cy="17" r="15" className="stroke-secondary" strokeWidth="3.2" fill="none" />

      {/* Interlock: left ring crosses above in top overlap */}
      <clipPath id={`noowe-clip-${size}`}>
        <rect x="27.2" y="0" width="6" height="17" />
      </clipPath>
      <circle
        cx="22"
        cy="17"
        r="15"
        className="stroke-primary"
        strokeWidth="3.2"
        fill="none"
        clipPath={`url(#noowe-clip-${size})`}
      />
    </svg>
  );

  const Wordmark = () => (
    <span
      className="text-foreground tracking-tight inline-flex items-center"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${height}px`,
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.02em",
      }}
    >
      <span>N</span>
      <span
        className="inline-block flex-shrink-0"
        style={{
          width: "1.28em",
          height: "1em",
          margin: "0 -0.015em",
          transform: "translateY(0.01em)",
        }}
      >
        <InlineMark />
      </span>
      <span>WE</span>
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
