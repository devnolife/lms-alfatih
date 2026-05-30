"use client";

import { GameProvider } from "@/hooks/useGameState";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingHero from "@/components/marketing/MarketingHero";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import CurriculumSection from "@/components/marketing/CurriculumSection";
import Sandbox from "@/components/Sandbox";
import ForTeachersSection from "@/components/marketing/ForTeachersSection";
import Testimonials from "@/components/Testimonials";
import FAQSection from "@/components/marketing/FAQSection";
import MarketingCTA from "@/components/marketing/MarketingCTA";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function Home() {
  return (
    // GameProvider wraps Sandbox so its built-in XP demo still works on the
    // marketing page; real XP/lives live inside /app.
    <GameProvider>
      <MarketingHeader />
      <main>
        <MarketingHero />
        <FeaturesGrid />
        <CurriculumSection />
        <Sandbox />
        <ForTeachersSection />
        <Testimonials />
        <FAQSection />
        <MarketingCTA />
      </main>
      <MarketingFooter />
    </GameProvider>
  );
}
