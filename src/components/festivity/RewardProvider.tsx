"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface Badge {
  id: string;
  label: string;
  emoji: string;
}

interface XpPopup {
  id: number;
  text: string;
}

interface BadgeToast {
  id: number;
  badge: Badge;
}

interface RewardState {
  /** Ephemeral XP earned this session (NOT saved to the account). */
  sessionXp: number;
  awardXp: (amount: number, label?: string) => void;
  /** Shows a badge toast once per badge id per session. */
  unlockBadge: (badge: Badge) => void;
  // Consumed by RewardLayer:
  popups: XpPopup[];
  toasts: BadgeToast[];
  dismissPopup: (id: number) => void;
  dismissToast: (id: number) => void;
}

const RewardContext = createContext<RewardState | null>(null);

export function RewardProvider({ children }: { children: ReactNode }) {
  const [sessionXp, setSessionXp] = useState(0);
  const [popups, setPopups] = useState<XpPopup[]>([]);
  const [toasts, setToasts] = useState<BadgeToast[]>([]);
  const idRef = useRef(0);
  const unlockedRef = useRef<Set<string>>(new Set());

  const dismissPopup = useCallback((id: number) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const awardXp = useCallback((amount: number, label?: string) => {
    setSessionXp((prev) => prev + amount);
    const id = ++idRef.current;
    const text = label ?? `+${amount} XP latihan`;
    setPopups((prev) => [...prev, { id, text }]);
  }, []);

  const unlockBadge = useCallback((badge: Badge) => {
    if (unlockedRef.current.has(badge.id)) return;
    unlockedRef.current.add(badge.id);
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, badge }]);
  }, []);

  return (
    <RewardContext.Provider
      value={{
        sessionXp,
        awardXp,
        unlockBadge,
        popups,
        toasts,
        dismissPopup,
        dismissToast,
      }}
    >
      {children}
    </RewardContext.Provider>
  );
}

/**
 * Access the ephemeral reward system. Returns a no-op fallback when no
 * RewardProvider is mounted so callers never crash.
 */
export function useReward(): RewardState {
  const ctx = useContext(RewardContext);
  if (!ctx) {
    return {
      sessionXp: 0,
      awardXp: () => {},
      unlockBadge: () => {},
      popups: [],
      toasts: [],
      dismissPopup: () => {},
      dismissToast: () => {},
    };
  }
  return ctx;
}
