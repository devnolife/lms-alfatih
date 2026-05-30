"use client";

interface Props {
  /** Animation phase: 0 empty boxes, 1 number, 2 text, 3 true/false. */
  phase: number;
}

interface BoxDef {
  x: number;
  phase: number;
  color: string;
  soft: string;
  label: string;
}

const BOXES: BoxDef[] = [
  { x: 22, phase: 1, color: "#1cb0f6", soft: "#e3f4ff", label: "Angka" },
  { x: 110, phase: 2, color: "#f0a500", soft: "#fff4d6", label: "Kata" },
  { x: 198, phase: 3, color: "#58cc02", soft: "#e6f8d9", label: "Ya / Tidak" },
];

/**
 * Hand-made animated SVG that introduces the kinds of values a variable can
 * hold, using everyday words instead of jargon: a number (Angka), some text
 * (Kata), and a yes/no value (Ya / Tidak). The three boxes are shown empty
 * from the start; each one's content pops in on its phase.
 */
export default function DataTypeSvg({ phase }: Props) {
  const t = "transition-all duration-500 ease-out";

  return (
    <svg
      viewBox="0 0 300 150"
      className="mx-auto w-full max-w-[300px]"
      role="img"
      aria-label="Animasi jenis isi variabel: angka, kata, dan ya atau tidak"
    >
      {BOXES.map((b) => {
        const cx = b.x + 40;
        const on = phase >= b.phase;
        return (
          <g key={b.label}>
            {/* empty card — always visible */}
            <rect
              x={b.x}
              y="44"
              width="80"
              height="76"
              rx="12"
              fill="#ffffff"
              stroke={on ? b.color : "#e5e0ee"}
              strokeWidth="4"
              className={t}
            />
            {/* header band */}
            <path
              d={`M${b.x + 12} 44 h56 a12 12 0 0 1 12 12 v6 h-80 v-6 a12 12 0 0 1 12 -12 z`}
              fill={on ? b.soft : "#f4f1f9"}
              className={t}
            />

            {/* filled content — pops in on this box's phase */}
            <g
              className={t}
              style={{
                opacity: on ? 1 : 0,
                transform: on ? "scale(1)" : "scale(0.4)",
                transformOrigin: `${cx}px 84px`,
              }}
            >
              {b.label === "Angka" && (
                <text
                  x={cx}
                  y="92"
                  textAnchor="middle"
                  fontFamily="var(--font-feather, sans-serif)"
                  fontSize="30"
                  fill="#3c3c3c"
                >
                  7
                </text>
              )}

              {b.label === "Kata" && (
                <text
                  x={cx}
                  y="90"
                  textAnchor="middle"
                  fontFamily="var(--font-feather, sans-serif)"
                  fontSize="16"
                  fill="#3c3c3c"
                >
                  &#8220;Sinta&#8221;
                </text>
              )}

              {b.label === "Ya / Tidak" && (
                <g>
                  <circle cx={cx - 15} cy="84" r="11" fill="#58cc02" />
                  <path
                    d={`M${cx - 20} 84 l4 4 l7 -8`}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx={cx + 15} cy="84" r="11" fill="#ff6b6b" />
                  <path
                    d={`M${cx + 11} 80 l8 8 M${cx + 19} 80 l-8 8`}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>

            {/* label — grey placeholder until filled */}
            <text
              x={cx}
              y="111"
              textAnchor="middle"
              fontFamily="var(--font-feather, sans-serif)"
              fontSize="12"
              fill={on ? b.color : "#c9c2d6"}
              className={t}
            >
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
