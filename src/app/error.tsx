"use client";

import { useEffect } from "react";
import LottiePlayer from "@/components/ui/LottiePlayer";

/**
 * Friendly root error boundary. Catches errors thrown while rendering pages and
 * nested layouts (e.g. a temporary database outage in `getCurrentUser`) and
 * shows a kid-friendly retry screen instead of a raw stack trace.
 */
export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="dotted-bg flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="w-full max-w-md rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-8 shadow-[0_6px_0_var(--color-cloud)]">
        <div className="mb-3 text-6xl">
          <LottiePlayer
            src="/lottie/error.json"
            className="mx-auto h-32 w-32"
            fallback={<span>🐍</span>}
          />
        </div>
        <h1
          className="mb-2 text-2xl text-[var(--color-charcoal)]"
          style={{ fontFamily: "var(--font-feather)" }}
        >
          Aduh, ada gangguan!
        </h1>
        <p className="mb-6 text-sm font-medium text-[var(--color-graphite)]">
          Sepertinya koneksi ke server sedang bermasalah. Tenang, ini bukan
          salahmu — coba lagi sebentar lagi, ya.
        </p>
        <button
          onClick={reset}
          className="w-full rounded-xl bg-[var(--color-duo-green)] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)]"
        >
          ↻ Coba Lagi
        </button>
      </div>
    </div>
  );
}
