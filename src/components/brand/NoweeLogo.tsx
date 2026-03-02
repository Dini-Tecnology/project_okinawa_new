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


  // Rings match the x-height of lowercase letters (~42% of fontSize for Space Grotesk)
  const xHeight = fontSize * 0.36;
  const ringRadius = xHeight / 2;
  const overlap = ringRadius * 0.5;
  const strokeW = Math.max(1.5, fontSize * 0.07);
  const pad = strokeW; // padding for stroke
  const svgHeight = xHeight + pad * 2;
  const svgWidth = ringRadius * 4 - overlap * 2 + pad * 2;
  const cy = svgHeight / 2;
  const cx1 = ringRadius + pad;
  const cx2 = svgWidth - ringRadius - pad;

  const InlineMark = () => (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block flex-shrink-0"
      style={{ verticalAlign: "middle" }}
    >
      <circle cx={cx1} cy={cy} r={ringRadius} className="stroke-primary" strokeWidth={strokeW} fill="none" />
      <circle cx={cx2} cy={cy} r={ringRadius} className="stroke-secondary" strokeWidth={strokeW} fill="none" />
      {/* Interlock: left ring passes over right ring in top half */}
      <clipPath id={`noowe-clip-${size}`}>
        <rect x={cx1 + ringRadius * 0.35} y={0} width={overlap} height={cy} />
      </clipPath>
      <circle cx={cx1} cy={cy} r={ringRadius} className="stroke-primary" strokeWidth={strokeW} fill="none" clipPath={`url(#noowe-clip-${size})`} />
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
