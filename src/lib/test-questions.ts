/**
 * Bank soal Pre-Test & Post-Test untuk siswa SMP yang BELUM pernah belajar koding.
 * Soal identik untuk pre & post agar bisa dibandingkan.
 *
 * Fokus: logika sederhana, pengenalan komputer, keamanan digital, dan
 * berpikir komputasional dasar — TANPA soal pemrograman/coding.
 *
 * Tipe soal:
 *  - "mc"  → pilihan ganda (multiple choice)
 */

export type QuestionType = "mc";

export interface MCQuestion {
  type: "mc";
  id: string;
  question: string;
  options: string[];
  /** index jawaban benar (0-based) */
  correctIndex: number;
}

export type TestQuestion = MCQuestion;

export const TEST_QUESTIONS: TestQuestion[] = [
  // ─── PENGENALAN KOMPUTER ───────────────────────────────
  {
    type: "mc",
    id: "q1",
    question: "Alat di bawah ini yang dipakai untuk MENGETIK di komputer adalah?",
    options: ["Keyboard ⌨️", "Speaker 🔊", "Printer 🖨️", "Headset 🎧"],
    correctIndex: 0,
  },
  {
    type: "mc",
    id: "q2",
    question: "Benda apa yang dipakai untuk MELIHAT tampilan komputer?",
    options: ["Mouse 🖱️", "Layar/Monitor 🖥️", "Keyboard ⌨️", "Printer 🖨️"],
    correctIndex: 1,
  },
  {
    type: "mc",
    id: "q3",
    question: "Tempat menyimpan file di komputer disebut?",
    options: ["Kandang", "Folder 📁", "Kotak pos", "Lemari baju"],
    correctIndex: 1,
  },

  // ─── BERPIKIR LOGIS / KOMPUTASIONAL ───────────────────
  {
    type: "mc",
    id: "q4",
    question:
      "Komputer mengerjakan tugas dengan mengikuti langkah-langkah yang berurutan. Kumpulan langkah berurutan untuk menyelesaikan sesuatu disebut?",
    options: ["Tebakan", "Algoritma", "Kebetulan", "Mainan"],
    correctIndex: 1,
  },
  {
    type: "mc",
    id: "q5",
    question: "Urutan yang BENAR untuk membuat teh adalah?",
    options: [
      "Minum teh → tuang air → masukkan teh celup",
      "Masukkan teh celup → tuang air panas → aduk",
      "Aduk → minum → tuang air",
      "Tuang air → minum → masukkan teh",
    ],
    correctIndex: 1,
  },
  {
    type: "mc",
    id: "q6",
    question: "Perhatikan pola angka ini: 2, 4, 6, 8, ... Angka berikutnya adalah?",
    options: ["9", "10", "11", "12"],
    correctIndex: 1,
  },
  {
    type: "mc",
    id: "q7",
    question:
      "Perhatikan pola gambar: 🔴 🔵 🔴 🔵 🔴 ... Gambar berikutnya adalah?",
    options: ["🔴 Merah", "🔵 Biru", "🟢 Hijau", "🟡 Kuning"],
    correctIndex: 1,
  },
  {
    type: "mc",
    id: "q8",
    question: 'Jika "SEMUA kucing punya ekor" dan "Mimi adalah kucing", maka?',
    options: [
      "Mimi tidak punya ekor",
      "Mimi punya ekor",
      "Mimi bukan kucing",
      "Tidak bisa ditebak",
    ],
    correctIndex: 1,
  },
  {
    type: "mc",
    id: "q9",
    question:
      "Robot akan maju JIKA lampu hijau. Saat ini lampu MERAH. Apa yang dilakukan robot?",
    options: ["Maju", "Berhenti / tidak maju", "Mundur", "Melompat"],
    correctIndex: 1,
  },

  // ─── KEAMANAN & WARGA DIGITAL ─────────────────────────
  {
    type: "mc",
    id: "q10",
    question: "Manakah password yang PALING AMAN?",
    options: ["123456", "password", "Buku12Pensil!", "namaku"],
    correctIndex: 2,
  },
  {
    type: "mc",
    id: "q11",
    question:
      "Ada orang asing di internet minta alamat rumah dan nomor HP-mu. Apa yang sebaiknya kamu lakukan?",
    options: [
      "Langsung memberikannya",
      "Tidak memberi dan bilang ke orang tua/guru",
      "Memberi alamat saja",
      "Memberi nomor HP teman",
    ],
    correctIndex: 1,
  },
  {
    type: "mc",
    id: "q12",
    question: "Mana tindakan yang SOPAN saat chatting dengan teman?",
    options: [
      "Mengejek dan menghina",
      "Menulis dengan kata-kata kasar",
      "Berkata baik dan menghargai teman",
      "Menyebarkan rahasia teman",
    ],
    correctIndex: 2,
  },
  {
    type: "mc",
    id: "q13",
    question:
      "Kamu menerima pesan: 'Kamu menang HP gratis! Klik link ini sekarang!'. Sebaiknya?",
    options: [
      "Langsung klik link-nya",
      "Hati-hati, bisa jadi penipuan — jangan klik",
      "Bagikan ke semua teman",
      "Isi data pribadi di link itu",
    ],
    correctIndex: 1,
  },

  // ─── INTERNET & TEKNOLOGI DASAR ───────────────────────
  {
    type: "mc",
    id: "q14",
    question: "Apa yang kita butuhkan agar bisa membuka YouTube atau Google?",
    options: ["Koneksi internet 🌐", "Setrika", "Kulkas", "Sepeda"],
    correctIndex: 0,
  },
  {
    type: "mc",
    id: "q15",
    question:
      "Ular 🐍 di game ingin mencapai daun 🥬. Ada tembok di depannya. Apa cara terbaik?",
    options: [
      "Menabrak tembok terus-menerus",
      "Belok mencari jalan lain untuk menghindari tembok",
      "Berhenti dan menyerah",
      "Memakan tembok",
    ],
    correctIndex: 1,
  },
];

/** Grade an MC question */
export function gradeMC(q: MCQuestion, answer: number): boolean {
  return answer === q.correctIndex;
}

/**
 * Grade all answers server-side.
 * Returns { score, total, details }.
 */
export function gradeServerSide(
  answers: Record<string, unknown>
): { score: number; total: number; details: Record<string, boolean> } {
  let score = 0;
  const total = TEST_QUESTIONS.length;
  const details: Record<string, boolean> = {};

  for (const q of TEST_QUESTIONS) {
    const ans = answers[q.id];
    let correct = false;

    if (q.type === "mc" && typeof ans === "number") {
      correct = gradeMC(q, ans);
    }

    if (correct) score++;
    details[q.id] = correct;
  }

  return { score, total, details };
}
