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


  // "OO" shaped to match Space Grotesk 600 weight — slightly squared superellipse
  // with thick stroke matching the font's visual weight
  const sw = 5.5; // stroke width to match semibold font weight

  const InlineMark = () => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 62 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Left O — Primary (orange), superellipse shape like Space Grotesk O */}
      <rect
        x={sw / 2 + 1}
        y={sw / 2}
        width={26}
        height={34 - sw}
        rx="11"
        ry="13"
        className="stroke-primary"
        strokeWidth={sw}
        fill="none"
      />
      {/* Right O — Secondary (teal) */}
      <rect
        x={62 - 26 - sw / 2 - 1}
        y={sw / 2}
        width={26}
        height={34 - sw}
        rx="11"
        ry="13"
        className="stroke-secondary"
        strokeWidth={sw}
        fill="none"
      />

      {/* Interlock: left O passes OVER right O in the top-half of the overlap */}
      <clipPath id={`noowe-clip-${size}`}>
        <rect x="22" y="0" width="9" height="17" />
      </clipPath>
      <rect
        x={sw / 2 + 1}
        y={sw / 2}
        width={26}
        height={34 - sw}
        rx="11"
        ry="13"
        className="stroke-primary"
        strokeWidth={sw}
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
