import Link from "next/link";
import LottiePlayer from "@/components/ui/LottiePlayer";

export default function NotFound() {
  return (
    <div className="dotted-bg flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="w-full max-w-md rounded-3xl border-2 border-[var(--color-cloud)] bg-white p-8 shadow-[0_6px_0_var(--color-cloud)]">
        <div className="mb-3">
          <LottiePlayer
            src="/lottie/search.json"
            className="mx-auto h-32 w-32"
            fallback={<span className="text-6xl">🔍</span>}
          />
        </div>
        <h1
          className="mb-2 text-2xl text-[var(--color-charcoal)]"
          style={{ fontFamily: "var(--font-feather)" }}
        >
          Halaman Tidak Ditemukan
        </h1>
        <p className="mb-6 text-sm font-medium text-[var(--color-graphite)]">
          Sepertinya halaman yang kamu cari tidak ada atau sudah dipindahkan.
          Jangan khawatir, yuk kembali ke beranda!
        </p>
        <Link
          href="/"
          className="inline-block w-full rounded-xl bg-[var(--color-duo-green)] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_0_var(--color-duo-green-dark)]"
        >
          ← Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
