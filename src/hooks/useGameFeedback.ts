"use client";

import { useCallback } from "react";
import { useSound } from "@/components/festivity/SoundProvider";
import { useReward, type Badge } from "@/components/festivity/RewardProvider";
import { popConfetti, burstConfetti } from "@/lib/client/celebrate";

interface RewardOpts {
  xp?: number;
  label?: string;
  badge?: Badge;
}

/**
 * Festivity feedback for mini-games. Call these from explicit user actions /
 * state transitions only (NOT during render) so effects fire exactly once per
 * round:
 * - `click()`    — a block/option was tapped
 * - `correct()`  — routine win: soft sound + small confetti + XP popup
 * - `wrong()`    — gentle "try again" sound
 * - `solved()`   — milestone: win fanfare + big confetti + XP + optional badge
 */
export function useGameFeedback() {
  const { play } = useSound();
  const { awardXp, unlockBadge } = useReward();

  const click = useCallback(() => {
    play("click");
  }, [play]);

  const correct = useCallback(
    (opts: RewardOpts = {}) => {
      play("correct");
      popConfetti();
      if (opts.xp) awardXp(opts.xp, opts.label);
      if (opts.badge) unlockBadge(opts.badge);
    },
    [play, awardXp, unlockBadge]
  );

  const wrong = useCallback(() => {
    play("wrong");
  }, [play]);

  const solved = useCallback(
    (opts: RewardOpts = {}) => {
      play("win");
      burstConfetti();
      if (opts.xp) awardXp(opts.xp, opts.label);
      if (opts.badge) unlockBadge(opts.badge);
    },
    [play, awardXp, unlockBadge]
  );

  return { click, correct, wrong, solved };
}
