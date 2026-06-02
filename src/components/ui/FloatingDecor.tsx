"use client";

import type { ReactNode } from "react";
import LottiePlayer from "@/components/ui/LottiePlayer";

/**
 * Decorative floating doodles for the empty left/right gutters on wide screens.
 *
 * Slots may render either a static SVG from /public/decor (via `src`) or an
 * animated Lottie file from /public/lottie (via `render`). The wrapper handles
 * positioning, the float animation, gutter-only visibility (xl+) and
 * prefers-reduced-motion, so the slot content stays simple.
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
  { side: "left", top: "16%", size: 84, anim: "auth-float", delay: 0, inset: 12, render: () => <LottiePlayer src="/lottie/snake.json" className="h-full w-full" /> },
  { side: "left", top: "44%", size: 58, anim: "auth-float-slow", delay: 1.2, inset: 28, render: () => <LottiePlayer src="/lottie/star.json" className="h-full w-full" /> },
  { side: "left", top: "72%", size: 64, anim: "auth-float", delay: 0.6, inset: 16, src: "/decor/brackets.svg" },
  { side: "right", top: "20%", size: 78, anim: "auth-float-slow", delay: 0.4, inset: 14, render: () => <LottiePlayer src="/lottie/controller.json" className="h-full w-full" /> },
  { side: "right", top: "50%", size: 58, anim: "auth-float", delay: 1.5, inset: 30, src: "/decor/sparkle.svg" },
  { side: "right", top: "76%", size: 66, anim: "auth-float-slow", delay: 0.9, inset: 18, render: () => <LottiePlayer src="/lottie/puzzle.json" className="h-full w-full" /> },
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
