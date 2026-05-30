import type { ReactNode } from "react";
import LearningExperienceProvider from "@/components/festivity/LearningExperienceProvider";

/**
 * The /learn segment lives outside the /app shell, so it gets its own
 * festivity layer (sounds, rewards, mute toggle) here. Auth is already enforced
 * by proxy.ts for the /learn prefix.
 */
export default function LearnLayout({ children }: { children: ReactNode }) {
  return <LearningExperienceProvider>{children}</LearningExperienceProvider>;
}
