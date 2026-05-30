"use client";

import PendingLink from "@/components/ui/PendingLink";

export default function MarketingCTA() {
  return (
    <section className="py-28 bg-snow">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="relative bg-duo-green-light border-4 border-almost-black rounded-[36px] shadow-[0_14px_0_var(--color-almost-black)] py-16 md:py-20 px-8 md:px-14 text-center max-w-[900px] mx-auto overflow-hidden">
          {/* decorative emojis */}
          <span aria-hidden className="absolute -top-6 -left-4 text-6xl rotate-[-18deg] opacity-90">🐍</span>
          <span aria-hidden className="absolute top-6 right-4 text-5xl rotate-12 opacity-80">⚡</span>
          <span aria-hidden className="absolute -bottom-4 left-10 text-5xl rotate-[18deg] opacity-80">🏅</span>
          <span aria-hidden className="absolute bottom-8 right-8 text-5xl rotate-[-8deg] opacity-80">🚀</span>

          <span className="inline-block mb-4 text-[11px] uppercase tracking-[0.2em] font-bold text-duo-green-dark">
            1-Day Bootcamp · 100% Gratis
          </span>
          <h2 className="font-[family-name:var(--font-feather)] text-4xl md:text-[48px] text-almost-black leading-[1.05] mb-5">
            Siap ngoding Python hari ini?
          </h2>
          <p className="text-charcoal font-bold text-lg mb-10 max-w-xl mx-auto">
            Daftar dalam 30 detik. Tidak perlu install apapun. Cukup browser & semangat belajar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <PendingLink href="/register" className="btn-3d btn-green !text-base flex-1">
              Mulai Gratis 🚀
            </PendingLink>
            <PendingLink href="/login" className="btn-3d btn-outline !text-base flex-1">
              Sudah Punya Akun
            </PendingLink>
          </div>
        </div>
      </div>
    </section>
  );
}
