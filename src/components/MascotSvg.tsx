"use client";

interface MascotProps {
  className?: string;
  /** idle (default) | happy | cheer — adds a celebratory bounce. */
  mood?: "idle" | "happy" | "cheer";
}

export default function MascotSvg({ className = "", mood = "idle" }: MascotProps) {
  const moodClass =
    mood === "cheer" ? "fx-bounce-soft" : mood === "happy" ? "fx-bounce-loop" : "";
  return (
    <svg
      className={`${className} ${moodClass}`.trim()}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body coil */}
      <path
        d="M100,280 Q150,330 200,280 T300,280 T260,180 T140,160"
        stroke="#58cc02"
        strokeWidth="48"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Belly stripe */}
      <path
        d="M110,265 Q150,310 190,265"
        stroke="#ffc700"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
      />
      {/* Eyes */}
      <circle cx="160" cy="130" r="32" fill="#ffffff" stroke="#3c3c3c" strokeWidth="6" />
      <circle cx="240" cy="130" r="32" fill="#ffffff" stroke="#3c3c3c" strokeWidth="6" />
      <circle cx="168" cy="130" r="14" fill="#3c3c3c" />
      <circle cx="232" cy="130" r="14" fill="#3c3c3c" />
      {/* Blush */}
      <ellipse cx="128" cy="165" rx="14" ry="8" fill="#cc348d" opacity="0.6" />
      <ellipse cx="272" cy="165" rx="14" ry="8" fill="#cc348d" opacity="0.6" />
      {/* Smile */}
      <path
        d="M185,170 Q200,185 215,170"
        stroke="#3c3c3c"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* Tongue */}
      <path
        d="M200,178 L200,195 Q195,200 192,192 M200,195 Q205,200 208,192"
        stroke="#cc348d"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Graduate Cap */}
      <path d="M160,86 L200,15 L240,86 Z" fill="#a570ff" stroke="#3c3c3c" strokeWidth="5" />
      <path
        d="M130,86 Q200,98 270,86"
        stroke="#a570ff"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
