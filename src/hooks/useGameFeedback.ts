"use client";

import { useCallback } from "react";
import { useSound } from "@/components/festivity/SoundProvider";
import { useReward, type Badge } from "@/components/festivity/RewardProvider";
import { popConfetti, burstConfetti } from "@/lib/client/celebrate";
import {
  useActivityContext,
  reportActivityComplete,
  reportActivityWork,
} from "@/components/lesson/ActivityContext";

interface RewardOpts {
  xp?: number;
  label?: string;
  badge?: Badge;
}

/** Extra payload for `solved()` to persist the student's actual work. */
interface SolveOpts extends RewardOpts {
  /** Game-specific work payload (answers, labels, path, computed values...). */
  data?: Record<string, unknown>;
  /** Optional 0-100 quality/correctness score for teacher review. */
  score?: number;
  /** Game type label stored alongside the work (e.g. "quiz", "maze"). */
  game?: string;
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
  const { lessonSlug, activityId } = useActivityContext();

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
    (opts: SolveOpts = {}) => {
      play("win");
      burstConfetti();
      if (opts.xp) awardXp(opts.xp, opts.label);
      if (opts.badge) unlockBadge(opts.badge);
      // When this game is an activity inside a lesson, persist its completion
      // (server reads the authoritative XP from the lesson manifest).
      if (lessonSlug && activityId) {
        reportActivityComplete(lessonSlug, activityId);
        // Also persist the student's actual work, when the game provides it.
        if (opts.data) {
          reportActivityWork(
            lessonSlug,
            activityId,
            opts.game ?? activityId,
            opts.data,
            opts.score ?? 0
          );
        }
      }
    },
    [play, awardXp, unlockBadge, lessonSlug, activityId]
  );

  return { click, correct, wrong, solved };
}
