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
 * NOWEE Brand Logo
 *
 * The mark is two overlapping circles — one warm orange, one teal —
 * forming a vesica piscis at their intersection.
 * Symbolizes connection, shared moments, and the meeting point
 * between people and experiences.
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

  const Mark = () => (
    <svg
      width={markSize}
      height={markSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
      aria-label="NOWEE mark"
    >
      {/* Left circle — Primary (warm orange) */}
      <circle
        cx="24"
        cy="32"
        r="18"
        className="fill-primary"
        opacity="0.9"
      />
      {/* Right circle — Secondary (teal) */}
      <circle
        cx="40"
        cy="32"
        r="18"
        className="fill-secondary"
        opacity="0.75"
      />
      {/* Intersection glow — blend of both */}
      <clipPath id="nowee-clip-left">
        <circle cx="24" cy="32" r="18" />
      </clipPath>
      <circle
        cx="40"
        cy="32"
        r="18"
        clipPath="url(#nowee-clip-left)"
        fill="white"
        opacity="0.35"
      />
    </svg>
  );

  const Wordmark = () => (
    <span
      className="text-foreground tracking-tight"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${height}px`,
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 600,
        letterSpacing: "-0.02em",
      }}
    >
      now
      <span
        className="text-primary"
        style={{ fontWeight: 700 }}
      >
        ee
      </span>
    </span>
  );

  if (variant === "mark") {
    return (
      <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOWEE">
        <Mark />
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOWEE">
        <Wordmark />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{ gap: `${gap}px` }}
      role="img"
      aria-label="NOWEE"
    >
      <Mark />
      <Wordmark />
    </div>
  );
};

export default NoweeLogo;
