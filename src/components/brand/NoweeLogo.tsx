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
 * The two "o"s form a custom vesica piscis / lens shape —
 * two overlapping circles where the intersection glows
 * with a primary→secondary gradient. Modern, chic, memorable.
 */
const NoweeLogo: React.FC<NoweeLogoProps> = ({
  size = "md",
  variant = "full",
  theme = "auto",
  className = "",
}) => {
  const { height, fontSize } = sizeMap[size];
  const uid = `noowe-${size}`;

  // The "oo" mark: two overlapping circles with a glowing lens intersection
  const InlineMark = () => {
    const r = fontSize * 0.38; // circle radius
    const gap = r * 0.72; // overlap amount (center-to-center = 2*r - gap... we use offset)
    const cx1 = r + 1;
    const cx2 = cx1 + r * 1.05; // slight overlap
    const cy = r + 1;
    const w = cx2 + r + 2;
    const h = r * 2 + 2;
    const stroke = Math.max(1.5, fontSize * 0.07);

    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          transform: `translateY(${fontSize * 0.04}px)`,
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Gradient for the intersection lens */}
          <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>

          {/* Clip to isolate the intersection (vesica piscis) */}
          <clipPath id={`${uid}-clip1`}>
            <circle cx={cx1} cy={cy} r={r} />
          </clipPath>
          <clipPath id={`${uid}-clip2`}>
            <circle cx={cx2} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Left circle — primary stroke */}
        <circle
          cx={cx1}
          cy={cy}
          r={r - stroke / 2}
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Right circle — secondary stroke */}
        <circle
          cx={cx2}
          cy={cy}
          r={r - stroke / 2}
          stroke="hsl(var(--secondary))"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Intersection fill — gradient lens shape */}
        <g clipPath={`url(#${uid}-clip1)`}>
          <circle
            cx={cx2}
            cy={cy}
            r={r}
            fill={`url(#${uid}-grad)`}
            opacity={0.18}
          />
        </g>

        {/* Redraw the overlapping arcs on top for crisp edges */}
        {/* Left circle's arc that falls inside right circle */}
        <g clipPath={`url(#${uid}-clip2)`}>
          <circle
            cx={cx1}
            cy={cy}
            r={r - stroke / 2}
            stroke={`url(#${uid}-grad)`}
            strokeWidth={stroke}
            fill="none"
          />
        </g>
        {/* Right circle's arc that falls inside left circle */}
        <g clipPath={`url(#${uid}-clip1)`}>
          <circle
            cx={cx2}
            cy={cy}
            r={r - stroke / 2}
            stroke={`url(#${uid}-grad)`}
            strokeWidth={stroke}
            fill="none"
          />
        </g>
      </svg>
    );
  };

  const Wordmark = () => (
    <span
      className="text-foreground inline-flex items-center"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: `${height}px`,
        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
        fontWeight: 500,
        letterSpacing: "-0.03em",
        textTransform: "lowercase",
      }}
    >
      <span style={{ letterSpacing: "-0.01em" }}>n</span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          margin: `0 ${fontSize * -0.08}px`,
        }}
      >
        <InlineMark />
      </span>
      <span style={{ letterSpacing: "-0.01em" }}>we</span>
    </span>
  );

  if (variant === "mark") {
    return (
      <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOOWE">
        <InlineMark />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`} role="img" aria-label="NOOWE">
      <Wordmark />
    </div>
  );
};

export default NoweeLogo;
