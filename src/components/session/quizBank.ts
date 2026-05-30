export interface QuizQuestion {
  prompt: string;
  code?: string;
  options: string[];
  answerIndex: number;
}

/** Client-side catalog mirroring GAME_CATALOG in src/lib/games.ts. */
export const GAME_CATALOG: Record<string, { title: string }> = {
  "kuis-output": { title: "Tebak Hasil Kode" },
  "kuis-rumpang": { title: "Isi Kode Rumpang" },
};

/**
 * Client-side question bank. The server only stores scores, never the answers,
 * so this lives entirely on the client. Each gameKey must match GAME_CATALOG in
 * src/lib/games.ts and contain exactly `questionCount` questions.
 */
export const QUIZ_BANK: Record<string, QuizQuestion[]> = {
  "kuis-output": [
    {
      prompt: "Apa hasil dari kode ini?",
      code: "print(3 + 4 * 2)",
      options: ["14", "11", "10", "24"],
      answerIndex: 1,
    },
    {
      prompt: "Apa yang dicetak?",
      code: 'name = "Budi"\nprint("Halo " + name)',
      options: ["Halo name", "Halo Budi", "Halo + Budi", "Error"],
      answerIndex: 1,
    },
    {
      prompt: "Apa hasil akhir dari kode ini?",
      code: "x = 5\nx = x + 3\nprint(x)",
      options: ["5", "3", "8", "53"],
      answerIndex: 2,
    },
    {
      prompt: "Berapa kali kata 'Hai' tercetak?",
      code: 'for i in range(3):\n    print("Hai")',
      options: ["2", "3", "4", "0"],
      answerIndex: 1,
    },
    {
      prompt: "Apa hasil dari kode ini?",
      code: "print(10 % 3)",
      options: ["1", "3", "0", "3.33"],
      answerIndex: 0,
    },
  ],
  "kuis-rumpang": [
    {
      prompt: "Lengkapi agar mencetak tulisan ke layar:",
      code: "_____(\"Halo Dunia\")",
      options: ["print", "echo", "say", "write"],
      answerIndex: 0,
    },
    {
      prompt: "Kata kunci untuk perulangan sebanyak 5 kali:",
      code: "for i in _____(5):\n    print(i)",
      options: ["loop", "range", "count", "times"],
      answerIndex: 1,
    },
    {
      prompt: "Lengkapi agar kondisi benar bila x lebih dari 10:",
      code: "if x _____ 10:\n    print(\"besar\")",
      options: ["<", "==", ">", "=>"],
      answerIndex: 2,
    },
    {
      prompt: "Lengkapi agar membuat sebuah fungsi:",
      code: "_____ sapa():\n    print(\"Hai\")",
      options: ["func", "def", "function", "fun"],
      answerIndex: 1,
    },
    {
      prompt: "Lengkapi agar menyimpan masukan dari pengguna:",
      code: "nama = _____(\"Nama kamu: \")",
      options: ["input", "scan", "read", "get"],
      answerIndex: 0,
    },
  ],
};
