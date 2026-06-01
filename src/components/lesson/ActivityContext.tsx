"use client";

import { createContext, useContext, type ReactNode } from "react";

interface ActivityCtx {
  lessonSlug?: string;
  activityId?: string;
}

const Ctx = createContext<ActivityCtx>({});

export function useActivityContext(): ActivityCtx {
  return useContext(Ctx);
}

/**
 * Merges its value onto the surrounding context. The lesson page sets
 * `lessonSlug` once at the top; each `::game` then layers on its own
 * `activityId`, so `useGameFeedback().solved()` can report completion without
 * any per-game prop plumbing.
 */
export function ActivityProvider({
  value,
  children,
}: {
  value: ActivityCtx;
  children: ReactNode;
}) {
  const outer = useContext(Ctx);
  return <Ctx.Provider value={{ ...outer, ...value }}>{children}</Ctx.Provider>;
}

// Module-level guard so a given activity reports completion at most once per
// page load even if `solved()` fires repeatedly.
const reported = new Set<string>();

export function reportActivityComplete(lessonSlug: string, activityId: string) {
  const key = `${lessonSlug}::${activityId}`;
  if (reported.has(key)) return;
  reported.add(key);
  void fetch("/api/activities/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonSlug, activityId }),
  }).catch(() => {
    // Allow a retry on a later solve if the network call failed.
    reported.delete(key);
  });
}

/**
 * Persists the student's actual WORK for a game (answers, labels, chosen path,
 * computed values, training data, etc.) into GameSubmission so teachers can
 * review it. Fire-and-forget: a failed save never blocks the game. Each call
 * stores a new attempt, so games should call this once per solve.
 */
export function reportActivityWork(
  lessonSlug: string,
  activityId: string,
  game: string,
  data: Record<string, unknown>,
  score = 0
) {
  void fetch("/api/activities/work", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonSlug, activityId, game, data, score }),
  }).catch(() => { });
}
