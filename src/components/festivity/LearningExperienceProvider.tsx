"use client";

import type { ReactNode } from "react";
import { SoundProvider } from "@/components/festivity/SoundProvider";
import { RewardProvider } from "@/components/festivity/RewardProvider";
import RewardLayer from "@/components/festivity/RewardLayer";
import MuteToggle from "@/components/festivity/MuteToggle";

/**
 * Wraps the learning areas (/app, /learn) with the festivity layer: sounds,
 * ephemeral rewards, the floating reward feedback, and the mute toggle. Mounted
 * only where learning happens — NOT in the root layout — so static/marketing
 * pages stay light.
 */
export default function LearningExperienceProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SoundProvider>
      <RewardProvider>
        {children}
        <RewardLayer />
        <MuteToggle />
      </RewardProvider>
    </SoundProvider>
  );
}
