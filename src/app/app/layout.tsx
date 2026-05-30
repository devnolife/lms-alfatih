import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import type { ReactNode } from "react";
import PendingLink from "@/components/ui/PendingLink";
import LogoutButton from "@/components/ui/LogoutButton";
import LearningExperienceProvider from "@/components/festivity/LearningExperienceProvider";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");

  return (
    <LearningExperienceProvider>
    <div className="min-h-screen flex flex-col">
      <header className="border-b-2 border-[var(--color-cloud)] bg-white">
        <div className="max-w-[1140px] mx-auto flex items-center justify-between px-6 h-16">
          <Link
            href="/app"
            className="text-xl"
            style={{ fontFamily: "var(--font-feather)", color: "var(--color-duo-green)" }}
          >
            🐍 FunPython
          </Link>
          <nav className="flex items-center gap-6 text-sm font-bold uppercase tracking-wide">
            <PendingLink href="/app" className="inline-flex items-center text-[var(--color-charcoal)] hover:text-[var(--color-duo-green)]">Home</PendingLink>
            <PendingLink href="/learn" className="inline-flex items-center text-[var(--color-charcoal)] hover:text-[var(--color-duo-green)]">Belajar</PendingLink>
            <PendingLink href="/app/classes" className="inline-flex items-center text-[var(--color-charcoal)] hover:text-[var(--color-duo-green)]">Kelas</PendingLink>
            <PendingLink href="/app/games" className="inline-flex items-center text-[var(--color-charcoal)] hover:text-[var(--color-duo-green)]">🎮 Game</PendingLink>
            {(user.role === "TEACHER" || user.role === "ADMIN") && (
              <PendingLink href="/dashboard" className="inline-flex items-center text-[var(--color-charcoal)] hover:text-[var(--color-duo-green)]">Dashboard</PendingLink>
            )}
            <span className="text-[var(--color-graphite)]">
              ⭐ {user.xp} XP
            </span>
            <span className="text-[var(--color-graphite)]">
              ❤️ {user.lives}
            </span>
            <LogoutButton className="text-[var(--color-error)] hover:underline" />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
    </LearningExperienceProvider>
  );
}
