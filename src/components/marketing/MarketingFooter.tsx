import Link from "next/link";
import Image from "next/image";
import LottiePlayer from "@/components/ui/LottiePlayer";

const cols = [
  {
    title: "Platform",
    links: [
      { href: "#fitur", label: "Fitur" },
      { href: "#kurikulum", label: "Kurikulum" },
      { href: "#sandbox", label: "Sandbox" },
      { href: "/learn", label: "Materi Belajar" },
    ],
  },
  {
    title: "Untuk",
    links: [
      { href: "/register", label: "Daftar Siswa" },
      { href: "/register", label: "Daftar Guru" },
      { href: "#guru", label: "Mode Guru" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    title: "Tentang",
    links: [
      { href: "#", label: "Kurikulum Merdeka" },
      { href: "#", label: "Kebijakan Privasi" },
      { href: "#", label: "Syarat & Ketentuan" },
      { href: "mailto:halo@funpython.id", label: "Kontak" },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t-4 border-cloud bg-snow">
      <div className="mx-auto max-w-[1180px] px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link
            href="/"
            className="flex items-center gap-2 font-[family-name:var(--font-feather)] text-[22px] font-bold text-duo-green"
          >
            <LottiePlayer
              src="/lottie/snake.json"
              className="w-10 h-10"
              fallback={
                <svg className="w-9 h-9" viewBox="0 0 100 100" aria-hidden>
                  <path
                    d="M20,50 Q35,20 50,50 T80,50"
                    stroke="#58cc02"
                    strokeWidth="14"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle cx="30" cy="45" r="5" fill="#3c3c3c" />
                </svg>
              }
            />
            FunPython
          </Link>
          <p className="mt-4 text-[13.5px] font-bold text-graphite leading-relaxed max-w-xs">
            LMS Python untuk SMP Indonesia. Dirancang sesuai{" "}
            <strong>Kurikulum Merdeka</strong>.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Fakultas Teknik Unismuh Makassar"
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
            />
            <div className="text-[11px] font-bold leading-snug text-graphite">
              <span className="block uppercase tracking-wider text-silver">
                Dipersembahkan oleh
              </span>
              Fakultas Teknik
              <br />
              Universitas Muhammadiyah Makassar
            </div>
          </div>

          <p className="mt-6 text-[11px] uppercase tracking-wider font-bold text-silver">
            🇮🇩 Dibuat di Indonesia
          </p>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="font-[family-name:var(--font-feather)] text-sm uppercase tracking-wide text-charcoal mb-4">
              {c.title}
            </h4>
            <ul className="space-y-3">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[13.5px] font-bold text-graphite hover:text-duo-green transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t-2 border-cloud py-5 text-center text-[12px] font-bold text-silver uppercase tracking-wider">
        © {new Date().getFullYear()} FunPython · Fakultas Teknik Unismuh Makassar · All systems green ●
      </div>
    </footer>
  );
}
