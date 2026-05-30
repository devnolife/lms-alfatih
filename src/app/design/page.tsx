import type { Metadata } from "next";
import Link from "next/link";
import MascotSvg from "@/components/MascotSvg";
import BackButton from "@/components/ui/BackButton";

export const metadata: Metadata = {
  title: "Design System — FunPython",
  description:
    "Panduan gaya & design system FunPython, diturunkan dari bahasa desain Duolingo (warna, tipografi, spasi, dan komponen).",
};

const colors: { name: string; value: string; role: string; dark?: boolean }[] = [
  { name: "Duo Green", value: "#58cc02", role: "CTA utama, logo, headline brand" },
  { name: "Sky Blue", value: "#1cb0f6", role: "Aksi sekunder, tautan teks" },
  { name: "Duo Green Light", value: "#d7ffb8", role: "Tint latar state aktif/sorot" },
  { name: "Sunshine Yellow", value: "#ffc700", role: "Aksen hangat pada ilustrasi" },
  { name: "Grape Soda", value: "#a570ff", role: "Aksen sejuk pada ilustrasi" },
  { name: "Bubblegum Pink", value: "#cc348d", role: "Detail ramah pada ilustrasi" },
  { name: "Snow White", value: "#ffffff", role: "Latar halaman, teks tombol", dark: true },
  { name: "Cloud Gray", value: "#e5e5e5", role: "Border sekunder & pemisah", dark: true },
  { name: "Silver", value: "#afafaf", role: "Placeholder, state nonaktif" },
  { name: "Graphite", value: "#777777", role: "Body copy, teks deskriptif" },
  { name: "Charcoal", value: "#4b4b4b", role: "Subjudul, headline sekunder" },
  { name: "Almost Black", value: "#3c3c3c", role: "Teks utama body & UI" },
];

const typeScale: {
  label: string;
  token: string;
  size: number;
  tracking: string;
  sample: string;
  font: "feather" | "din";
}[] = [
  { label: "display", token: "--text-display", size: 64, tracking: "-1.28px", sample: "free. fun. effective.", font: "feather" },
  { label: "heading-lg", token: "--text-heading-lg", size: 48, tracking: "-0.96px", sample: "Belajar Python", font: "feather" },
  { label: "heading", token: "--text-heading", size: 32, tracking: "1.7px", sample: "Mulai Petualanganmu", font: "feather" },
  { label: "heading-sm", token: "--text-heading-sm", size: 19, tracking: "1.01px", sample: "Modul Bootcamp 1 Hari", font: "din" },
  { label: "body", token: "--text-body", size: 15, tracking: "0.8px", sample: "Ketik kode langsung di browser dan raih XP.", font: "din" },
  { label: "caption", token: "--text-caption", size: 13, tracking: "0.69px", sample: "Tersedia untuk siswa SMP di seluruh Indonesia.", font: "din" },
];

const spacing = [8, 12, 16, 24, 32, 40, 48, 64, 80, 96];

const langs = [
  { flag: "🇮🇩", label: "INDONESIA" },
  { flag: "🇬🇧", label: "ENGLISH" },
  { flag: "🇯🇵", label: "日本語" },
  { flag: "🇰🇷", label: "한국어" },
];

const dos = [
  "Pakai Duo Green #58cc02 untuk semua CTA utama & headline brand.",
  "Terapkan border-radius 12px pada tombol, input, dan kartu.",
  "Pakai font Feather hanya untuk headline besar (48px+).",
  "Beri kedalaman tombol utama lewat bottom shadow hijau gelap (0 4px 0 #3f8f01).",
  "Pakai Sky Blue #1cb0f6 untuk elemen sekunder & tautan teks.",
  "Set body & UI dengan din-round + letter-spacing 0.053em.",
];

const donts = [
  "Jangan pakai sudut tajam pada elemen UI.",
  "Jangan pakai warna selain Duo Green untuk aksi utama 'Mulai'.",
  "Jangan pakai font headline Feather untuk teks kecil/body.",
  "Jangan pakai box-shadow elevasi tradisional pada panel/kartu.",
  "Jangan buat tautan teks dengan warna selain Sky Blue.",
  "Jangan andalkan font sistem; Feather & din-round bagian dari brand.",
];

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-8">
      <span
        className="inline-block mb-2 text-sky-blue uppercase"
        style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.12em" }}
      >
        {kicker}
      </span>
      <h2 className="ds-display text-duo-green" style={{ fontSize: 40, letterSpacing: "-0.96px" }}>
        {title}
      </h2>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-snow text-almost-black">
      {/* Hero */}
      <header className="border-b-2 border-cloud">
        <div className="mx-auto max-w-[1140px] px-6 py-16 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <div className="mb-6">
              <BackButton href="/" label="Beranda" />
            </div>
            <span className="inline-block mb-5 px-4 py-2 rounded-full bg-duo-green-light text-duo-green-dark uppercase" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em" }}>
              ✨ Design System
            </span>
            <h1 className="ds-display" style={{ fontSize: 56, letterSpacing: "-1.1px", lineHeight: 1.1 }}>
              Desain UI <span className="text-duo-green">baru</span>
              <br />
              FunPython
            </h1>
            <p className="mt-5 max-w-md text-graphite" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 17, letterSpacing: "0.02em" }}>
              Bahasa desain yang menyenangkan, ramah, dan gamified — diturunkan
              dari design tokens Duolingo: warna cerah, font membulat, dan tombol
              3D yang terasa bisa dipencet.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="ds-btn ds-btn--green">Mulai Belajar</button>
              <button className="ds-btn ds-btn--outline">Punya Akun</button>
            </div>
          </div>
          <div className="flex justify-center">
            <MascotSvg className="w-full max-w-[320px] h-auto" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1140px] px-6 py-20 flex flex-col gap-24">
        {/* Colors */}
        <section>
          <SectionTitle kicker="Tokens" title="Warna" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {colors.map((c) => (
              <div key={c.name} className="ds-card !p-0 overflow-hidden">
                <div
                  className="h-24 w-full"
                  style={{ backgroundColor: c.value, borderBottom: c.dark ? "2px solid #e5e5e5" : "none" }}
                />
                <div className="p-4">
                  <p style={{ fontFamily: "var(--font-feather)", fontWeight: 700, fontSize: 16 }}>{c.name}</p>
                  <p className="text-silver uppercase" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em" }}>
                    {c.value}
                  </p>
                  <p className="mt-2 text-graphite" style={{ fontFamily: "var(--font-din)", fontWeight: 500, fontSize: 13, lineHeight: 1.4 }}>
                    {c.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section>
          <SectionTitle kicker="Tokens" title="Tipografi" />
          <div className="flex flex-col gap-6">
            {typeScale.map((t) => (
              <div key={t.token} className="ds-card flex flex-col md:flex-row md:items-baseline gap-3 md:gap-8">
                <div className="md:w-44 shrink-0">
                  <p style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em" }} className="uppercase text-charcoal">
                    {t.label}
                  </p>
                  <p className="text-silver" style={{ fontFamily: "var(--font-din)", fontWeight: 500, fontSize: 12 }}>
                    {t.size}px · {t.tracking}
                  </p>
                </div>
                <p
                  className={t.font === "feather" ? "text-almost-black" : "text-graphite"}
                  style={{
                    fontFamily: t.font === "feather" ? "var(--font-feather)" : "var(--font-din)",
                    fontWeight: 700,
                    fontSize: Math.min(t.size, 40),
                    letterSpacing: t.font === "din" ? "0.053em" : t.tracking,
                    lineHeight: 1.2,
                  }}
                >
                  {t.sample}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section>
          <SectionTitle kicker="Komponen" title="Tombol" />
          <div className="ds-card flex flex-wrap items-center gap-5">
            <button className="ds-btn ds-btn--green">Mulai Sekarang</button>
            <button className="ds-btn ds-btn--blue">Lihat Materi</button>
            <button className="ds-btn ds-btn--outline">Sudah Punya Akun</button>
            <button className="ds-btn ds-btn--green" disabled style={{ opacity: 0.5, boxShadow: "0 4px 0 var(--color-duo-green-dark)" }}>
              Nonaktif
            </button>
          </div>
          <p className="mt-3 text-graphite" style={{ fontFamily: "var(--font-din)", fontWeight: 500, fontSize: 14 }}>
            Kedalaman dibuat hanya pada tombol lewat <span className="ds-link">solid bottom shadow</span> yang
            memendek saat ditekan — bukan box-shadow elevasi.
          </p>
        </section>

        {/* Spacing & radius */}
        <section>
          <SectionTitle kicker="Tokens" title="Spasi & Bentuk" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="ds-card">
              <p className="mb-4 uppercase text-charcoal" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em" }}>
                Skala spasi (unit 4px)
              </p>
              <div className="flex flex-col gap-3">
                {spacing.map((s) => (
                  <div key={s} className="flex items-center gap-4">
                    <span className="w-10 text-silver text-right" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13 }}>
                      {s}
                    </span>
                    <span className="h-4 rounded bg-duo-green" style={{ width: s * 2 }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="ds-card">
              <p className="mb-4 uppercase text-charcoal" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em" }}>
                Border radius (12px)
              </p>
              <div className="flex flex-wrap gap-5">
                {["Kartu", "Input", "Tombol"].map((label) => (
                  <div key={label} className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 bg-duo-green-light border-2 border-duo-green" style={{ borderRadius: 12 }} />
                    <span className="text-graphite" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13 }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <p className="mb-2 uppercase text-charcoal" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.06em" }}>
                  Contoh input
                </p>
                <input
                  placeholder="Tulis namamu…"
                  className="w-full bg-snow text-almost-black placeholder:text-silver focus:border-sky-blue outline-none"
                  style={{ border: "2px solid var(--color-cloud)", borderRadius: 12, padding: "12px 16px", fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 15, letterSpacing: "0.053em" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Components: cards, links, language items */}
        <section>
          <SectionTitle kicker="Komponen" title="Pola UI" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="ds-card">
              <div className="text-3xl mb-3">🎮</div>
              <h3 style={{ fontFamily: "var(--font-feather)", fontWeight: 700, fontSize: 19 }}>Kartu Konten</h3>
              <p className="mt-2 text-graphite" style={{ fontFamily: "var(--font-din)", fontWeight: 500, fontSize: 14, lineHeight: 1.5 }}>
                Datar pada latar putih, didefinisikan oleh border Cloud Gray —
                tanpa shadow elevasi. Pelajari selengkapnya di{" "}
                <a href="#" className="ds-link">halaman materi</a>.
              </p>
            </div>
            <div className="ds-card">
              <h3 style={{ fontFamily: "var(--font-feather)", fontWeight: 700, fontSize: 19 }}>Tautan Teks</h3>
              <p className="mt-2 text-graphite" style={{ fontFamily: "var(--font-din)", fontWeight: 500, fontSize: 14, lineHeight: 1.5 }}>
                Selalu Sky Blue dengan garis bawah saat hover, mis.{" "}
                <a href="#" className="ds-link">syarat &amp; ketentuan</a> atau{" "}
                <a href="#" className="ds-link">kebijakan privasi</a>.
              </p>
            </div>
            <div className="ds-card">
              <h3 className="mb-3" style={{ fontFamily: "var(--font-feather)", fontWeight: 700, fontSize: 19 }}>Pilihan Bahasa</h3>
              <ul className="flex flex-col gap-1">
                {langs.map((l) => (
                  <li key={l.label}>
                    <a href="#" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-duo-green-light transition-colors">
                      <span className="text-xl">{l.flag}</span>
                      <span className="text-graphite uppercase" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 14, letterSpacing: "0.06em" }}>
                        {l.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Do's & Don'ts */}
        <section>
          <SectionTitle kicker="Pedoman" title="Lakukan & Hindari" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="ds-card" style={{ borderColor: "var(--color-duo-green)" }}>
              <h3 className="text-duo-green-dark mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-feather)", fontWeight: 700, fontSize: 22 }}>
                ✅ Lakukan
              </h3>
              <ul className="flex flex-col gap-3">
                {dos.map((d) => (
                  <li key={d} className="flex gap-2 text-charcoal" style={{ fontFamily: "var(--font-din)", fontWeight: 500, fontSize: 14, lineHeight: 1.5 }}>
                    <span className="text-duo-green">●</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="ds-card" style={{ borderColor: "#ffb8b8" }}>
              <h3 className="text-error mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-feather)", fontWeight: 700, fontSize: 22 }}>
                🚫 Hindari
              </h3>
              <ul className="flex flex-col gap-3">
                {donts.map((d) => (
                  <li key={d} className="flex gap-2 text-charcoal" style={{ fontFamily: "var(--font-din)", fontWeight: 500, fontSize: 14, lineHeight: 1.5 }}>
                    <span className="text-error">●</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-cloud">
        <div className="mx-auto max-w-[1140px] px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-silver" style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 13, letterSpacing: "0.053em" }}>
            FunPython Design System · diturunkan dari bahasa desain Duolingo
          </p>
          <Link href="/" className="ds-link" style={{ fontSize: 14 }}>
            ← Kembali ke beranda
          </Link>
        </div>
      </footer>
    </div>
  );
}
