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


  // Rings match the cap-height of the font (roughly 70% of fontSize)
  const capHeight = fontSize * 0.72;
  const ringRadius = capHeight / 2;
  const overlap = ringRadius * 0.55; // how much the two rings overlap
  const svgHeight = capHeight + 4; // small padding for stroke
  const svgWidth = ringRadius * 2 * 2 - overlap * 2 + 4; // two circles minus overlap + stroke padding
  const cy = svgHeight / 2;
  const cx1 = ringRadius + 2;
  const cx2 = svgWidth - ringRadius - 2;
  const strokeW = Math.max(2, fontSize * 0.09);

  const InlineMark = () => (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block flex-shrink-0"
      style={{ verticalAlign: "middle", marginTop: `${fontSize * -0.08}px` }}
    >
      <circle cx={cx1} cy={cy} r={ringRadius} className="stroke-primary" strokeWidth={strokeW} fill="none" opacity="0.95" />
      <circle cx={cx2} cy={cy} r={ringRadius} className="stroke-secondary" strokeWidth={strokeW} fill="none" opacity="0.9" />
      {/* Interlock: left ring passes over right ring in top half */}
      <clipPath id={`noowe-clip-${size}`}>
        <rect x={cx1 + ringRadius * 0.3} y={0} width={overlap} height={cy} />
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
