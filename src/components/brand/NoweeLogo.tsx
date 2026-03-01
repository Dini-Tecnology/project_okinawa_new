import React from "react";

interface NoweeLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeMap = {
  xs: 28,
  sm: 38,
  md: 52,
  lg: 72,
  xl: 100,
  "2xl": 140,
};

/**
 * NOOWE Brand Logo — Unified Typographic Mark
 *
 * The word "NOOWE" rendered as a single piece where
 * the two O's are interlocking rings woven into the
 * letterforms. Typography IS the mark.
 *
 * Modern Chic. Minimal. Memorable.
 */
const NoweeLogo: React.FC<NoweeLogoProps> = ({
  size = "md",
  className = "",
}) => {
  const height = sizeMap[size];
  // Aspect ratio ~4.2:1
  const width = Math.round(height * 4.2);

  return (
    <div
      className={`inline-flex items-center ${className}`}
      role="img"
      aria-label="NOOWE"
    >
      <svg
        width={width}
        height={height}
        viewBox="0 0 420 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          {/* Clip to make left O pass in front of right O at top */}
          <clipPath id="noowe-interlock">
            <rect x="168" y="20" width="18" height="30" />
          </clipPath>
        </defs>

        {/* ── N ── */}
        {/* Clean geometric N with slight taper */}
        <path
          d="M12 78V22h6l42 42V22h8v56h-6L20 36v42h-8z"
          className="fill-foreground"
        />

        {/* ── First O — Primary ring ── */}
        <circle
          cx="118"
          cy="50"
          r="28"
          className="stroke-primary"
          strokeWidth="8"
          fill="none"
        />

        {/* ── Second O — Secondary ring ── */}
        <circle
          cx="178"
          cy="50"
          r="28"
          className="stroke-secondary"
          strokeWidth="8"
          fill="none"
        />

        {/* ── Interlock: first O passes OVER second O at top ── */}
        <circle
          cx="118"
          cy="50"
          r="28"
          className="stroke-primary"
          strokeWidth="8"
          fill="none"
          clipPath="url(#noowe-interlock)"
        />

        {/* ── W ── */}
        <path
          d="M224 22l20 56h-1l18-44 18 44h-1l20-56h9l-25 56h-8l-14-38-14 38h-8L213 22h11z"
          className="fill-foreground"
        />

        {/* ── E ── */}
        <path
          d="M340 22h48v8h-40v16h36v8h-36v18h42v8h-50V22z"
          className="fill-foreground"
        />
      </svg>
    </div>
  );
};

export default NoweeLogo;
