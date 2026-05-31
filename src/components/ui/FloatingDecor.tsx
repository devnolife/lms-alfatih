"use client";

import type { ReactNode } from "react";

/**
 * Decorative floating doodles for the empty left/right gutters on wide screens.
 *
 * Each slot renders an SVG placeholder from /public/decor via <img>. To swap a
 * placeholder for a downloaded asset, just replace the matching file in
 * public/decor/ (keep the same name) — no code change needed.
 *
 * To use an animated format later (Lottie / dotLottie), install a player
 * (e.g. @lottiefiles/dotlottie-react) and give that slot a `render` function
 * instead of a `src`, for example:
 *
 *   {
 *     side: "left", top: "20%", size: 80, anim: "auth-float", delay: 0,
 *     render: () => <DotLottieReact src="/decor/snake.lottie" loop autoplay />,
 *   }
 *
 * The wrapper already handles positioning, the float animation, gutter-only
 * visibility (xl+) and prefers-reduced-motion, so the slot content stays simple.
 */

interface DecorSlot {
  side: "left" | "right";
  /** Vertical position as a CSS top value, e.g. "18%" or "320px". */
  top: string;
  /** Rendered size in pixels (square). */
  size: number;
  /** Float animation class: "auth-float" (faster) or "auth-float-slow". */
  anim: "auth-float" | "auth-float-slow";
  /** Animation delay in seconds, to de-sync the doodles. */
  delay: number;
  /** Horizontal inset from the viewport edge in pixels. */
  inset?: number;
  /** Placeholder image source under /public. */
  src?: string;
  /** Optional custom renderer (e.g. a Lottie player) — overrides `src`. */
  render?: () => ReactNode;
}

const SLOTS: DecorSlot[] = [
  { side: "left", top: "16%", size: 76, anim: "auth-float", delay: 0, inset: 12, src: "/decor/snake.svg" },
  { side: "left", top: "44%", size: 54, anim: "auth-float-slow", delay: 1.2, inset: 28, src: "/decor/star.svg" },
  { side: "left", top: "72%", size: 64, anim: "auth-float", delay: 0.6, inset: 16, src: "/decor/brackets.svg" },
  { side: "right", top: "20%", size: 70, anim: "auth-float-slow", delay: 0.4, inset: 14, src: "/decor/controller.svg" },
  { side: "right", top: "50%", size: 56, anim: "auth-float", delay: 1.5, inset: 30, src: "/decor/sparkle.svg" },
  { side: "right", top: "76%", size: 60, anim: "auth-float-slow", delay: 0.9, inset: 18, src: "/decor/puzzle.svg" },
];

export default function FloatingDecor() {
  return (
    <div aria-hidden className="pointer-events-none">
      {SLOTS.map((slot, i) => (
        <span
          key={i}
          className={`fixed -z-10 hidden xl:block ${slot.anim}`}
          style={{
            top: slot.top,
            [slot.side]: slot.inset ?? 16,
            width: slot.size,
            height: slot.size,
            animationDelay: `${slot.delay}s`,
          }}
        >
          {slot.render ? (
            slot.render()
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slot.src}
              alt=""
              width={slot.size}
              height={slot.size}
              className="h-full w-full select-none opacity-80 drop-shadow-sm"
              draggable={false}
            />
          )}
        </span>
      ))}
    </div>
  );
}
