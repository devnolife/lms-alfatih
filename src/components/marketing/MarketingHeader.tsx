"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PendingLink from "@/components/ui/PendingLink";
import LottiePlayer from "@/components/ui/LottiePlayer";

const navLinks = [
  { href: "#fitur", label: "Fitur" },
  { href: "#kurikulum", label: "Kurikulum" },
  { href: "#sandbox", label: "Coba Sandbox" },
  { href: "#guru", label: "Untuk Guru" },
  { href: "#faq", label: "FAQ" },
];

export default function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-snow/95 backdrop-blur transition-shadow ${scrolled ? "border-b-4 border-cloud" : "border-b-4 border-transparent"
        }`}
    >
      <div className="mx-auto max-w-[1140px] px-6 flex items-center justify-between h-20">
        <Link
          href="/"
          className="flex items-center gap-3 font-[family-name:var(--font-feather)] text-[26px] font-bold text-duo-green no-underline hover:scale-105 transition-transform"
        >
          <LottiePlayer
            src="/lottie/snake.json"
            className="w-12 h-12 drop-shadow-sm"
            fallback={
              <svg className="w-11 h-11 drop-shadow-sm" viewBox="0 0 100 100" aria-hidden>
                <path
                  d="M20,50 Q35,20 50,50 T80,50"
                  stroke="#58cc02"
                  strokeWidth="14"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="30" cy="45" r="5" fill="#3c3c3c" />
                <path d="M26,38 Q25,32 30,30" stroke="#ffc700" strokeWidth="3" fill="none" />
                <path d="M12,48 L4,48 L8,42 Z" fill="#cc348d" />
              </svg>
            }
          />
          <span>
            python <span className="text-sky-blue">is</span> fun
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] font-bold uppercase tracking-wide text-graphite hover:text-duo-green transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <PendingLink
            href="/login"
            className="hidden sm:inline-flex items-center text-[13px] font-bold uppercase tracking-wide text-sky-blue-dark hover:underline"
          >
            Masuk
          </PendingLink>
          <PendingLink
            href="/register"
            className="btn-3d btn-green !py-2.5 !px-5 !text-[13px]"
          >
            Daftar Gratis
          </PendingLink>
        </div>
      </div>
    </header>
  );
}
