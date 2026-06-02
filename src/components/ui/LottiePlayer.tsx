"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { CSSProperties } from "react";

// lottie-react pulls in lottie-web, which touches `window`/`document`, so it
// must only load on the client. next/dynamic with ssr:false guarantees that.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface Props {
  /** Public URL of the Lottie JSON, e.g. "/lottie/snake.json". */
  src: string;
  className?: string;
  style?: CSSProperties;
  loop?: boolean;
  autoplay?: boolean;
  /** Accessible label; when omitted the animation is treated as decorative. */
  label?: string;
  /** Optional fallback (e.g. an emoji or <img>) shown until the JSON loads. */
  fallback?: React.ReactNode;
}

/**
 * Lightweight wrapper that renders a Lottie animation fetched from /public.
 *
 * The JSON is fetched at runtime (not bundled) so large animations don't bloat
 * the JS payload. It honours `prefers-reduced-motion` by freezing on the first
 * frame, and renders nothing heavy on the server (SSR-safe).
 */
export default function LottiePlayer({
  src,
  className,
  style,
  loop = true,
  autoplay = true,
  label,
  fallback = null,
}: Props) {
  const [data, setData] = useState<unknown>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    );
  }, []);

  useEffect(() => {
    let active = true;
    fetch(src)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (active) setData(json);
      })
      .catch(() => {
        /* keep fallback on failure */
      });
    return () => {
      active = false;
    };
  }, [src]);

  if (!data) {
    return (
      <span className={className} style={style} aria-hidden={!label}>
        {fallback}
      </span>
    );
  }

  return (
    <Lottie
      animationData={data}
      loop={reduced ? false : loop}
      autoplay={reduced ? false : autoplay}
      className={className}
      style={style}
      aria-hidden={!label}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}
