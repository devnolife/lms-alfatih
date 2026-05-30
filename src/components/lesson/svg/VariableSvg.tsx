"use client";

interface Props {
  /** Animation phase: 0 box, 1 label, 2 value drops in, 3 saved. */
  phase: number;
  /** Variable name shown on the label tag. */
  name?: string;
  /** Value that is stored in the box. */
  value?: string;
}

/**
 * Hand-made animated SVG that explains a variable as a labelled box that
 * stores a value. The box appears, a name label attaches, the value drops
 * cleanly into the box, and a saved badge pops on the corner. Driven by a
 * numeric `phase` so a parent can play it as a step-by-step intro animation.
 */
export default function VariableSvg({
  phase,
  name = "nama",
  value = "Sinta",
}: Props) {
  const show = (from: number) => (phase >= from ? 1 : 0);
  const t = "transition-all duration-700 ease-out";

  return (
    <svg
      viewBox="0 0 300 150"
      className="mx-auto w-full max-w-[300px]"
      role="img"
      aria-label={`Animasi variabel ${name} menyimpan nilai ${value}`}
    >
      {/* Floor shadow */}
      <ellipse cx="155" cy="138" rx="78" ry="7" fill="#00000010" />

      {/* The box, drawn from phase 0 */}
      <g
        className={t}
        style={{
          opacity: show(0),
          transform: phase >= 0 ? "scale(1)" : "scale(0.92)",
          transformOrigin: "155px 91px",
        }}
      >
        <rect
          x="90"
          y="58"
          width="130"
          height="66"
          rx="12"
          fill="#f3ecff"
          stroke="#a570ff"
          strokeWidth="5"
        />
        {/* mouth / opening */}
        <rect x="90" y="58" width="130" height="16" rx="10" fill="#e7d9ff" />
        <rect x="120" y="63" width="70" height="6" rx="3" fill="#a570ff" />
      </g>

      {/* Label tag with the variable name — phase 1 */}
      <g
        className={t}
        style={{
          opacity: show(1),
          transform: phase >= 1 ? "translateX(0)" : "translateX(-22px)",
        }}
      >
        <line x1="90" y1="90" x2="72" y2="90" stroke="#843fff" strokeWidth="4" />
        <rect x="8" y="76" width="64" height="28" rx="8" fill="#843fff" />
        <text
          x="40"
          y="95"
          textAnchor="middle"
          fontFamily="var(--font-feather, sans-serif)"
          fontSize="16"
          fill="#ffffff"
        >
          {name}
        </text>
      </g>

      {/* Value card dropping into the box — phase 2 (clipped to box body) */}
      <clipPath id="varBoxClip">
        <rect x="90" y="68" width="130" height="56" rx="10" />
      </clipPath>
      <g clipPath="url(#varBoxClip)">
        <g
          className={t}
          style={{
            opacity: show(2),
            transform: phase >= 2 ? "translateY(0)" : "translateY(-44px)",
          }}
        >
          <rect
            x="118"
            y="84"
            width="74"
            height="32"
            rx="9"
            fill="#ffffff"
            stroke="#ffc700"
            strokeWidth="5"
          />
          <text
            x="155"
            y="106"
            textAnchor="middle"
            fontFamily="var(--font-feather, sans-serif)"
            fontSize="16"
            fill="#3c3c3c"
          >
            {value}
          </text>
        </g>
      </g>

      {/* Saved badge on the box corner — phase 3 */}
      <g
        className={t}
        style={{
          opacity: show(3),
          transform: phase >= 3 ? "scale(1)" : "scale(0.3)",
          transformOrigin: "216px 58px",
        }}
      >
        <circle
          cx="216"
          cy="58"
          r="14"
          fill="#58cc02"
          stroke="#ffffff"
          strokeWidth="3"
        />
        <path
          d="M209 58 l5 5 l9 -11"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
