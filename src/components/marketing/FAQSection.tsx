"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Apakah siswa perlu install Python atau aplikasi apapun?",
    a: "Tidak. FunPython menjalankan Python langsung di browser pakai Pyodide (WebAssembly). Cukup laptop/Chromebook + browser modern, siap belajar.",
  },
  {
    q: "Cocok untuk usia berapa?",
    a: "Dirancang khusus untuk tingkat SMP (kelas 7–9), tapi bisa juga dipakai untuk SD kelas atas dan SMA pemula. Modulnya diuji untuk anak yang baru pertama lihat kode.",
  },
  {
    q: "Apakah materi sesuai Kurikulum Merdeka?",
    a: "Ya. Materi disusun mengacu pada Kepmendikbudristek No. 12/2024 — elemen Algoritma & Pemrograman (AP) dan Praktik Lintas Bidang (PLB) mata pelajaran Informatika.",
  },
  {
    q: "Bisa dipakai untuk satu kelas sekaligus?",
    a: "Bisa. Guru bikin kelas, bagikan kode join 6-digit, siswa langsung enroll. Dashboard guru menampilkan progres semua siswa real-time tanpa refresh manual.",
  },
  {
    q: "Apakah gratis?",
    a: "Versi FunPython Track gratis untuk siswa dan guru. Modul lanjutan & dukungan sekolah skala besar akan diumumkan terpisah.",
  },
  {
    q: "Datanya tersimpan di mana?",
    a: "Server kami di Indonesia. Tidak ada data sensitif yang dibagikan ke pihak ketiga. Username + nama tampil saja; tidak meminta nomor HP atau alamat.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-28 bg-snow">
      <div className="mx-auto max-w-[920px] px-6">
        <div className="text-center mb-12">
          <span className="inline-block mb-4 text-[11px] uppercase tracking-[0.18em] font-bold text-grape-dark">
            FAQ
          </span>
          <h2 className="font-[family-name:var(--font-feather)] text-4xl md:text-[44px] tracking-tight leading-[1.1]">
            Pertanyaan yang sering ditanya.
          </h2>
        </div>

        <ul className="space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <li
                key={item.q}
                className={`border-3 rounded-2xl bg-snow transition-all ${isOpen
                  ? "border-duo-green shadow-[0_6px_0_var(--color-duo-green)]"
                  : "border-cloud shadow-[0_4px_0_var(--color-cloud)]"
                  }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-[family-name:var(--font-feather)] text-[18px] leading-snug text-almost-black">
                    {item.q}
                  </span>
                  <span
                    className={`shrink-0 w-9 h-9 rounded-full border-2 border-almost-black flex items-center justify-center text-xl font-bold transition-transform ${isOpen
                      ? "bg-duo-green text-white rotate-45"
                      : "bg-snow text-almost-black"
                      }`}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-graphite text-[15px] font-bold leading-relaxed">
                    {item.a}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
