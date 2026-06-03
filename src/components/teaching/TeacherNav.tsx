"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PendingLink from "@/components/ui/PendingLink";
import LogoutButton from "@/components/ui/LogoutButton";

const TABS = [
  { href: "/dashboard", label: "Kelas Saya", emoji: "🏫", exact: true },
  { href: "/dashboard/submissions", label: "Hasil Siswa", emoji: "📊" },
  { href: "/dashboard/materials", label: "Materi & Presentasi", emoji: "📚" },
];

export default function TeacherNav({ displayName }: { displayName: string }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#141a2a] text-white">
      <div className="mx-auto max-w-[1180px] px-5">
        {/* Top row: brand + account */}
        <div className="flex h-14 items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg"
            style={{ fontFamily: "var(--font-feather)" }}
          >
            <span>🐍 FunPython</span>
            <span className="rounded-md bg-[var(--color-duo-green)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#0f1117]">
              Mode Guru
            </span>
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-white/60 sm:inline">
              {displayName}
            </span>
            <PendingLink
              href="/app"
              className="rounded-lg border border-white/15 px-3 py-1.5 font-bold text-white/80 transition hover:bg-white/10"
              title="Lihat tampilan seperti yang dilihat siswa"
            >
              👁️ Lihat sebagai Siswa
            </PendingLink>
            <LogoutButton className="font-bold uppercase tracking-wide text-[var(--color-bubblegum)] hover:underline" />
          </div>
        </div>

        {/* Tab row */}
        <nav className="-mb-px flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const active = isActive(tab.href, tab.exact);
            return (
              <PendingLink
                key={tab.href}
                href={tab.href}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-bold transition ${active
                    ? "border-[var(--color-duo-green)] text-white"
                    : "border-transparent text-white/55 hover:text-white/85"
                  }`}
              >
                <span aria-hidden>{tab.emoji}</span>
                {tab.label}
              </PendingLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
