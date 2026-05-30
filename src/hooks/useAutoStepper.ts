"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  /** Milliseconds between each auto-advance tick. */
  intervalMs?: number;
  /** Whether the animation should start playing on mount. */
  autoPlay?: boolean;
  /** Whether to restart from 0 after reaching the end. */
  loop?: boolean;
  /** Extra pause (ms) held at the final frame before looping. */
  loopPauseMs?: number;
}

interface Result {
  /** Current counter value, ranges 0..max. */
  value: number;
  /** True while the counter sits at max (end of sequence). */
  done: boolean;
  /** True while the timer is actively advancing. */
  playing: boolean;
  /** Start/resume the animation (restarts if already finished). */
  play: () => void;
  /** Pause the animation. */
  pause: () => void;
  /** Toggle between play and pause. */
  toggle: () => void;
  /** Reset back to 0 and resume playing. */
  reset: () => void;
}

/**
 * Drives a self-advancing counter (0..max) for auto-playing concept
 * animations. Provides play/pause/reset controls and optional looping so
 * visualizers can run on their own without manual clicking.
 */
export default function useAutoStepper(max: number, options: Options = {}): Result {
  const {
    intervalMs = 1200,
    autoPlay = true,
    loop = true,
    loopPauseMs = 900,
  } = options;

  const [value, setValue] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (max <= 0) return;

    if (value >= max) {
      if (!loop) return;
      timer.current = setTimeout(() => setValue(0), loopPauseMs);
      return clear;
    }

    timer.current = setTimeout(() => setValue((v) => v + 1), intervalMs);
    return clear;
  }, [playing, value, max, loop, intervalMs, loopPauseMs, clear]);

  useEffect(() => clear, [clear]);

  const play = useCallback(() => {
    setValue((v) => (v >= max ? 0 : v));
    setPlaying(true);
  }, [max]);

  const pause = useCallback(() => setPlaying(false), []);

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p) setValue((v) => (v >= max ? 0 : v));
      return !p;
    });
  }, [max]);

  const reset = useCallback(() => {
    setValue(0);
    setPlaying(true);
  }, []);

  return { value, done: value >= max, playing, play, pause, toggle, reset };
}
