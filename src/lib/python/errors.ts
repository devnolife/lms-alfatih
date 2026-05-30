/**
 * Translates raw Python tracebacks into short, friendly hints in Bahasa
 * Indonesia for middle-school beginners. Falls back to a cleaned-up version of
 * the original message when no specific rule matches.
 */
export function friendlyError(raw: string): string {
  if (!raw) return "Terjadi kesalahan saat menjalankan kode.";

  const lastLine =
    raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .pop() ?? raw;

  const rules: Array<{ test: RegExp; message: (m: RegExpMatchArray) => string }> = [
    {
      test: /SyntaxError/,
      message: () =>
        "Ada kesalahan penulisan (SyntaxError). Cek tanda kurung, titik dua ( : ), atau tanda kutip yang belum lengkap.",
    },
    {
      test: /IndentationError/,
      message: () =>
        "Ada masalah indentasi (spasi di awal baris). Pastikan baris di dalam blok menjorok rapi (gunakan 4 spasi).",
    },
    {
      test: /NameError: name '([^']+)' is not defined/,
      message: (m) =>
        `Nama '${m[1]}' belum dikenal. Pastikan variabel sudah dibuat dulu dan ejaannya benar.`,
    },
    {
      test: /TypeError: can only concatenate str.*to str/,
      message: () =>
        "Tidak bisa menggabungkan teks dengan angka langsung. Ubah angka jadi teks dengan str(), atau pakai f-string.",
    },
    {
      test: /TypeError: unsupported operand type/,
      message: () =>
        "Tipe data tidak cocok untuk operasi ini (misalnya mencampur teks dan angka). Cek lagi variabelmu.",
    },
    {
      test: /TypeError/,
      message: () =>
        "Tipe data tidak sesuai (TypeError). Cek apakah kamu memakai angka, teks, atau list di tempat yang benar.",
    },
    {
      test: /ValueError: invalid literal for int\(\)/,
      message: () =>
        "Gagal mengubah teks menjadi angka dengan int(). Pastikan isinya benar-benar angka.",
    },
    {
      test: /ValueError/,
      message: () => "Nilai tidak valid (ValueError). Cek lagi data yang kamu pakai.",
    },
    {
      test: /ZeroDivisionError/,
      message: () => "Tidak bisa membagi dengan nol. Cek pembagi pada operasi bagi-mu.",
    },
    {
      test: /IndexError/,
      message: () =>
        "Indeks di luar jangkauan (IndexError). Posisi yang kamu minta tidak ada di dalam list.",
    },
    {
      test: /KeyError: '?([^'\n]+)'?/,
      message: (m) => `Kunci '${m[1]?.trim()}' tidak ada di dalam dictionary.`,
    },
    {
      test: /IndentationError|TabError/,
      message: () =>
        "Indentasi tidak konsisten. Jangan campur Tab dan spasi — pakai 4 spasi saja.",
    },
    {
      test: /AttributeError: .*has no attribute '([^']+)'/,
      message: (m) => `Tidak ada fungsi/atribut bernama '${m[1]}'. Cek lagi ejaannya.`,
    },
    {
      test: /ModuleNotFoundError: No module named '([^']+)'/,
      message: (m) => `Modul '${m[1]}' tidak tersedia di sini.`,
    },
    {
      test: /RecursionError/,
      message: () =>
        "Fungsi memanggil dirinya terlalu dalam (RecursionError). Pastikan ada kondisi berhenti.",
    },
  ];

  for (const rule of rules) {
    const m = raw.match(rule.test);
    if (m) return rule.message(m);
  }

  return lastLine.replace(/^.*Error:?\s*/, "Kesalahan: ") || lastLine;
}
