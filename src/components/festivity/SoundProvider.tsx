"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type SoundName = "click" | "correct" | "wrong" | "advance" | "win";

interface SoundState {
  muted: boolean;
  toggleMute: () => void;
  play: (name: SoundName) => void;
}

const SoundContext = createContext<SoundState | null>(null);

const STORAGE_KEY = "funpython_muted";

/* Tiny external store for the mute preference. Using useSyncExternalStore keeps
   localStorage out of render/effect setState (lint-safe) and avoids hydration
   mismatches: the server snapshot is always "not muted". */
const muteListeners = new Set<() => void>();

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeMuted(cb: () => void) {
  muteListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    muteListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function setMutedPref(value: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
  muteListeners.forEach((l) => l());
}

type Note = { freq: number; at: number; dur: number; type?: OscillatorType };

const SOUNDS: Record<SoundName, { gain: number; notes: Note[] }> = {
  click: {
    gain: 0.06,
    notes: [{ freq: 520, at: 0, dur: 0.05, type: "sine" }],
  },
  advance: {
    gain: 0.08,
    notes: [
      { freq: 660, at: 0, dur: 0.07, type: "sine" },
      { freq: 880, at: 0.07, dur: 0.09, type: "sine" },
    ],
  },
  correct: {
    gain: 0.1,
    notes: [
      { freq: 523.25, at: 0, dur: 0.09, type: "triangle" },
      { freq: 659.25, at: 0.09, dur: 0.09, type: "triangle" },
      { freq: 783.99, at: 0.18, dur: 0.12, type: "triangle" },
    ],
  },
  wrong: {
    gain: 0.08,
    notes: [
      { freq: 300, at: 0, dur: 0.12, type: "sine" },
      { freq: 220, at: 0.12, dur: 0.16, type: "sine" },
    ],
  },
  win: {
    gain: 0.11,
    notes: [
      { freq: 523.25, at: 0, dur: 0.1, type: "triangle" },
      { freq: 659.25, at: 0.1, dur: 0.1, type: "triangle" },
      { freq: 783.99, at: 0.2, dur: 0.1, type: "triangle" },
      { freq: 1046.5, at: 0.3, dur: 0.22, type: "triangle" },
    ],
  },
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const muted = useSyncExternalStore(subscribeMuted, readMuted, () => false);
  const ctxRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);

  // Lazily create + resume the AudioContext on the first user gesture, as
  // required by browser autoplay policies. Runs once.
  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return;
      try {
        const Ctor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return;
        if (!ctxRef.current) ctxRef.current = new Ctor();
        void ctxRef.current.resume();
        unlockedRef.current = true;
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  const toggleMute = useCallback(() => {
    setMutedPref(!readMuted());
  }, []);

  const play = useCallback((name: SoundName) => {
    if (readMuted()) return;
    const ctx = ctxRef.current;
    if (!ctx || !unlockedRef.current) return;
    try {
      const spec = SOUNDS[name];
      const now = ctx.currentTime;
      spec.notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = n.type ?? "sine";
        osc.frequency.setValueAtTime(n.freq, now + n.at);
        gain.gain.setValueAtTime(spec.gain, now + n.at);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.at + n.dur);
        osc.start(now + n.at);
        osc.stop(now + n.at + n.dur);
      });
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <SoundContext.Provider value={{ muted, toggleMute, play }}>
      {children}
    </SoundContext.Provider>
  );
}

/**
 * Access the festivity sound system. Returns a graceful no-op fallback when no
 * SoundProvider is mounted (e.g. marketing pages), so callers never crash.
 */
export function useSound(): SoundState {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    return {
      muted: false,
      toggleMute: () => {},
      play: () => {},
    };
  }
  return ctx;
}
