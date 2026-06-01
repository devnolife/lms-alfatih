export type GameType =
  | "maze"
  | "order"
  | "match"
  | "fill"
  | "quiz"
  | "flowchart"
  | "filesort"
  | "hardware"
  | "spreadsheet"
  | "branching";

export interface GameEntry {
  /** Stable id used for keys. */
  id: string;
  type: GameType;
  /** Short kid-friendly title shown on the card. */
  title: string;
  /** One-line description of what the player does. */
  blurb: string;
  emoji: string;
  /** 1 = mudah, 2 = sedang, 3 = seru. */
  level: 1 | 2 | 3;
  /** Props forwarded to the matching game component. */
  props: Record<string, string>;
}

export interface GameCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  games: GameEntry[];
}

/**
 * Free-play catalog for the Game Arcade. These are the SAME mini-games used
 * inside lessons, but here they can be played standalone — no lesson flow
 * required. Strings use normal JS quoting (no markdown directive escaping).
 */
export const GAME_CATALOG: GameCategory[] = [
  {
    id: "blok",
    title: "Game Blok",
    emoji: "🧩",
    description: "Susun blok perintah untuk memandu si kura-kura. Tanpa mengetik!",
    games: [
      {
        id: "maze-1",
        type: "maze",
        title: "Kura-kura ke Daun",
        blurb: "Susun blok Maju & Putar agar kura-kura sampai ke daun.",
        emoji: "🐢",
        level: 1,
        props: {
          grid: "S./.G",
          dir: "right",
          title: "Kura-kura ke Daun",
          hint: "Susun blok agar kura-kura 🐢 sampai ke daun 🥬",
        },
      },
      {
        id: "maze-2",
        type: "maze",
        title: "Labirin Berbelok",
        blurb: "Ada tembok! Putar arah kura-kura supaya tidak menabrak.",
        emoji: "🧱",
        level: 2,
        props: {
          grid: "S../.#./..G",
          dir: "right",
          title: "Labirin Berbelok",
          hint: "Hindari tembok abu-abu. Belokkan kura-kuramu!",
        },
      },
      {
        id: "maze-3",
        type: "maze",
        title: "Jalan Panjang (Ulangi)",
        blurb: "Pakai blok 🔁 Ulangi agar tidak menyusun blok berkali-kali.",
        emoji: "🔁",
        level: 3,
        props: {
          grid: "S....G",
          dir: "right",
          loop: "true",
          title: "Jalan Panjang",
          hint: "Cukup 1 blok Maju, lalu Ulangi beberapa kali!",
        },
      },
      {
        id: "maze-4",
        type: "maze",
        title: "Belokan Pintar (Jika)",
        blurb: "Pakai blok ❓ Jika agar kura-kura belok sendiri saat ada tembok.",
        emoji: "❓",
        level: 4,
        props: {
          grid: "S../.#./.#G",
          dir: "right",
          loop: "true",
          branch: "true",
          title: "Belokan Pintar",
          hint: "Susun ❓ Jika lalu Maju, ulangi 4×. Kura-kura belok otomatis!",
        },
      },
    ],
  },
  {
    id: "urutkan",
    title: "Urutkan Kode",
    emoji: "🔀",
    description: "Susun baris kode dari atas ke bawah agar programnya benar.",
    games: [
      {
        id: "order-1",
        type: "order",
        title: "Sapa Nama",
        blurb: "Buat dulu variabelnya, baru tampilkan.",
        emoji: "🙋",
        level: 1,
        props: {
          lines: 'nama = "Sinta"|print(nama)',
          title: "Sapa Nama",
          hint: "Variabel harus dibuat dulu, baru bisa ditampilkan.",
        },
      },
      {
        id: "order-2",
        type: "order",
        title: "Penjumlahan",
        blurb: "Susun tiga baris agar hasil penjumlahan tampil.",
        emoji: "➕",
        level: 2,
        props: {
          lines: "a = 5|b = 3|print(a + b)",
          title: "Penjumlahan",
          hint: "Buat kedua angka dulu, baru jumlahkan.",
        },
      },
    ],
  },
  {
    id: "tebak",
    title: "Tebak Hasil",
    emoji: "🎯",
    description: "Lihat kodenya, tebak apa yang muncul di layar.",
    games: [
      {
        id: "match-1",
        type: "match",
        title: "Halo Dunia",
        blurb: "Apa yang dicetak kode ini?",
        emoji: "👋",
        level: 1,
        props: {
          code: 'print("Halo")',
          options: 'Halo|halo|"Halo"',
          answer: "0",
          title: "Halo Dunia",
          question: "Apa yang akan muncul di layar?",
        },
      },
      {
        id: "match-2",
        type: "match",
        title: "Hitung Cepat",
        blurb: "Python bisa berhitung. Berapa hasilnya?",
        emoji: "🧮",
        level: 2,
        props: {
          code: "print(2 + 3)",
          options: "5|23|2 + 3",
          answer: "0",
          title: "Hitung Cepat",
          question: "Apa yang akan muncul di layar?",
        },
      },
      {
        id: "match-3",
        type: "match",
        title: "Isi Variabel",
        blurb: "Variabel menyimpan nilai. Apa yang tampil?",
        emoji: "📦",
        level: 2,
        props: {
          code: 'nama = "Budi"\\nprint(nama)',
          options: 'Budi|nama|"Budi"',
          answer: "0",
          title: "Isi Variabel",
          question: "Apa yang akan muncul di layar?",
        },
      },
    ],
  },
  {
    id: "rumpang",
    title: "Isi Rumpang",
    emoji: "✏️",
    description: "Pilih kata yang tepat untuk melengkapi kode.",
    games: [
      {
        id: "fill-1",
        type: "fill",
        title: "Menampilkan Teks",
        blurb: "Kata apa untuk menampilkan teks ke layar?",
        emoji: "🖨️",
        level: 1,
        props: {
          code: '___("Halo, dunia!")',
          options: "print|tampil|tulis",
          answer: "print",
          title: "Menampilkan Teks",
          question: "Kata apa yang dipakai untuk menampilkan teks ke layar?",
        },
      },
      {
        id: "fill-2",
        type: "fill",
        title: "Nama Variabel",
        blurb: "Lengkapi agar nama tersimpan lalu tampil.",
        emoji: "🏷️",
        level: 2,
        props: {
          code: 'nama = "Sinta"\\nprint(___)',
          options: "nama|Sinta|print",
          answer: "nama",
          title: "Nama Variabel",
          question: "Apa yang harus diisi agar nama Sinta tampil?",
        },
      },
    ],
  },
  {
    id: "informatika",
    title: "Petualangan Informatika",
    emoji: "🗺️",
    description:
      "Aktivitas dari 6 Level kurikulum Informatika: logika, file, perangkat, data, dan warga digital.",
    games: [
      {
        id: "flowchart-1",
        type: "flowchart",
        title: "Alur Membuat Teh",
        blurb: "Lengkapi diagram alir langkah-langkah yang hilang.",
        emoji: "🧠",
        level: 1,
        props: {
          steps: "Mulai|Didihkan air|___|Tuang air panas|___|Selesai",
          answers: "Masukkan teh;Aduk",
          bank: "Masukkan teh;Aduk;Tidur;Matikan komputer",
          title: "Alur Membuat Teh",
        },
      },
      {
        id: "filesort-1",
        type: "filesort",
        title: "Rapikan Berkas",
        blurb: "Seret tiap berkas ke folder yang benar.",
        emoji: "🗂️",
        level: 2,
        props: {
          files:
            "🖼️ foto.jpg:Gambar|📄 tugas.docx:Dokumen|🎵 lagu.mp3:Musik|🖼️ poster.png:Gambar|📄 catatan.pdf:Dokumen",
          title: "Rapikan Berkas",
        },
      },
      {
        id: "hardware-1",
        type: "hardware",
        title: "Perangkat & Fungsinya",
        blurb: "Cocokkan perangkat keras dengan tugasnya.",
        emoji: "🛠️",
        level: 2,
        props: {
          pairs:
            "⌨️ Keyboard:Mengetik teks|🖥️ Monitor:Menampilkan gambar|🖱️ Mouse:Menggerakkan kursor|🖨️ Printer:Mencetak ke kertas",
          title: "Perangkat & Fungsinya",
        },
      },
      {
        id: "spreadsheet-1",
        type: "spreadsheet",
        title: "Data Kantin",
        blurb: "Hitung total & rata-rata makanan terjual.",
        emoji: "🔎",
        level: 3,
        props: {
          rows: "Bakso:32|Mie Ayam:25|Es Teh:40|Gorengan:18",
          labelHeader: "Makanan",
          valueHeader: "Terjual",
          title: "Data Kantin",
        },
      },
      {
        id: "quiz-1",
        type: "quiz",
        title: "Kuis Sistem Komputer",
        blurb: "Uji pemahamanmu soal perangkat & jaringan.",
        emoji: "📝",
        level: 2,
        props: {
          title: "Kuis Sistem Komputer",
          data:
            "Berapa bit dalam 1 byte?|4 bit;8 bit;16 bit|1|Satu byte terdiri dari 8 bit.~Apa otak dari komputer?|RAM;CPU;Monitor|1|CPU (prosesor) adalah otak komputer yang mengolah data.",
        },
      },
      {
        id: "branching-1",
        type: "branching",
        title: "Warga Digital Bijak",
        blurb: "Pilih keputusan bijak di dunia maya.",
        emoji: "🛡️",
        level: 3,
        props: {
          title: "Warga Digital Bijak",
          data:
            "start>>Temanmu mengirim pesan berisi kabar heboh yang belum tentu benar. Apa yang kamu lakukan?>>Langsung sebarkan ke grup::end|Cek dulu kebenarannya::node2::wise~node2>>Kamu menemukan kabar itu hoaks. Lalu?>>Diam saja::end|Ingatkan temanmu dengan sopan::end::wise",
        },
      },
    ],
  },
];
