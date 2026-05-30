import type { ReactNode } from "react";
import Link from "next/link";
import AuthBrandPanel from "./AuthBrandPanel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-snow lg:grid lg:grid-cols-[1.05fr_1fr]">
      <AuthBrandPanel />

      {/* Form side */}
      <main className="relative flex flex-col items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 dotted-bg opacity-40 lg:opacity-60" />

        <div className="relative z-10 w-full max-w-md auth-rise">
          {/* Mobile logo */}
          <Link
            href="/"
            className="lg:hidden mb-6 flex items-center justify-center gap-2 text-2xl font-bold"
            style={{ fontFamily: "var(--font-feather)", color: "var(--color-duo-green)" }}
          >
            🐍 FunPython
          </Link>

          <div className="rounded-3xl border-2 border-cloud bg-snow p-8 shadow-[0_8px_0_var(--color-cloud)]">
            {children}
          </div>

          <p
            className="mt-6 text-center text-silver"
            style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em" }}
          >
            Dengan melanjutkan, kamu setuju pada{" "}
            <span className="text-graphite">Ketentuan Layanan</span> kami.
          </p>
        </div>
      </main>
    </div>
  );
}
