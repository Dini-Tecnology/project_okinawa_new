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


  // Two filled overlapping circles like Mastercard — primary (orange) + secondary (teal)
  const InlineMark = () => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 44 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Left O — filled orange */}
      <circle cx="15" cy="15" r="14" className="fill-primary" opacity="0.95" />
      {/* Right O — filled teal */}
      <circle cx="29" cy="15" r="14" className="fill-secondary" opacity="0.85" />
      {/* Overlap blend — darker mix in the intersection */}
      <clipPath id={`noowe-overlap-${size}`}>
        <circle cx="29" cy="15" r="14" />
      </clipPath>
      <circle
        cx="15"
        cy="15"
        r="14"
        fill="hsl(var(--primary) / 0.45)"
        clipPath={`url(#noowe-overlap-${size})`}
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
          width: "1.3em",
          height: "0.78em",
          margin: "0 -0.02em",
          transform: "translateY(0.04em)",
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
