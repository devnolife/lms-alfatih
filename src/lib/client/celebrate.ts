import confetti from "canvas-confetti";

/** True when the user has asked the OS to minimize motion. */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const PARTY_COLORS = [
  "#58cc02",
  "#1cb0f6",
  "#ffc700",
  "#a570ff",
  "#cc348d",
];

/**
 * Small, cheap confetti burst for routine wins (a correct answer, a solved
 * puzzle). Safe to call from event handlers only — no-ops during SSR and when
 * the user prefers reduced motion.
 */
export function popConfetti(origin?: { x?: number; y?: number }) {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  confetti({
    particleCount: 45,
    spread: 55,
    startVelocity: 28,
    scalar: 0.8,
    colors: PARTY_COLORS,
    origin: { x: origin?.x ?? 0.5, y: origin?.y ?? 0.6 },
    disableForReducedMotion: true,
  });
}

/**
 * Big celebratory burst reserved for milestones (finishing a lesson, unlocking
 * the first badge). Fires a couple of cannons from the sides.
 */
export function burstConfetti() {
  if (typeof window === "undefined" || prefersReducedMotion()) return;
  const base = {
    spread: 80,
    startVelocity: 45,
    colors: PARTY_COLORS,
    disableForReducedMotion: true,
  };
  confetti({ ...base, particleCount: 130, origin: { x: 0.5, y: 0.65 } });
  confetti({ ...base, particleCount: 60, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...base, particleCount: 60, angle: 120, origin: { x: 1, y: 0.7 } });
}
