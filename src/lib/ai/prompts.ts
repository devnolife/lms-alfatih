/**
 * Pedagogical prompts for the local-AI features.
 *
 * Design goals (these directly shape the system prompts below):
 *   - Audience: Indonesian junior-high (SMP) students learning Python &
 *     Informatika. Language must be simple, warm, and encouraging.
 *   - Socratic, NOT a solution machine: nudge with questions and small hints,
 *     never paste the full working answer. This protects the learning.
 *   - Stay on topic (the lesson / coding). Politely decline unrelated requests.
 */

import type { ChatMessage } from "@/lib/ai/ollama";

/** Trim long text so we never blow the model's context with a whole lesson. */
function clip(text: string, max = 1500): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + "…";
}

export interface LessonContext {
  title: string;
  summary?: string;
  /** Optional excerpt of the lesson body for grounding. */
  body?: string;
}

const TUTOR_RULES = `Kamu adalah "Pyo", tutor AI yang ramah untuk siswa SMP di Indonesia yang sedang belajar Python dan Informatika.

Aturan penting:
- Selalu menjawab dalam Bahasa Indonesia yang sederhana, hangat, dan menyemangati.
- Kamu adalah PEMANDU, bukan mesin jawaban. JANGAN langsung memberi kode jawaban lengkap. Beri petunjuk bertahap, ajukan pertanyaan pemandu, dan dorong siswa berpikir sendiri.
- Kalau siswa benar-benar buntu, beri satu langkah kecil berikutnya saja (bukan seluruh solusi).
- Gunakan contoh sederhana dan analogi yang dekat dengan keseharian remaja.
- Jika ditanya hal di luar pelajaran (mis. PR mapel lain, hal pribadi, konten tidak pantas), tolak dengan sopan dan arahkan kembali ke topik belajar.
- Jawaban singkat dan jelas. Hindari paragraf panjang. Gunakan poin bila perlu.`;

/** System message for the free-form lesson chat tutor. */
export function tutorSystemPrompt(ctx?: LessonContext): ChatMessage {
  let content = TUTOR_RULES;
  if (ctx) {
    content += `\n\nKonteks pelajaran saat ini:\n- Judul: ${ctx.title}`;
    if (ctx.summary) content += `\n- Ringkasan: ${clip(ctx.summary, 400)}`;
    if (ctx.body) content += `\n- Materi: ${clip(ctx.body, 1500)}`;
  }
  return { role: "system", content };
}

export interface HintInput {
  /** The challenge instruction the student is trying to satisfy. */
  prompt: string;
  /** The student's current code. */
  code: string;
  /** Friendly Python error message, if the code crashed. */
  errorMessage?: string;
  /** Names/details of tests that failed, if grading ran. */
  failedTests?: string[];
  lesson?: LessonContext;
}

const HINT_RULES = `Kamu adalah tutor AI ramah untuk siswa SMP di Indonesia yang belajar Python.
Siswa menjalankan kodenya tapi belum berhasil. Tugasmu memberi PETUNJUK, bukan jawaban.

Aturan:
- Bahasa Indonesia sederhana dan menyemangati ("Kamu sudah dekat!", dll).
- JANGAN tulis ulang kode lengkap yang benar. Boleh tunjukkan potongan kecil (maks 1-2 baris) hanya bila perlu menjelaskan konsep.
- Fokus pada SATU masalah utama yang paling menghambat. Jelaskan kenapa dan beri arah memperbaikinya.
- Maksimal 4-5 kalimat. Akhiri dengan dorongan untuk mencoba lagi.`;

/** Builds the (system, user) messages for a single-shot hint request. */
export function hintMessages(input: HintInput): ChatMessage[] {
  const parts: string[] = [];
  parts.push(`Instruksi tantangan:\n${clip(input.prompt, 600)}`);
  parts.push(`Kode siswa saat ini:\n\`\`\`python\n${clip(input.code, 1800)}\n\`\`\``);
  if (input.errorMessage) {
    parts.push(`Pesan error yang muncul:\n${clip(input.errorMessage, 500)}`);
  }
  if (input.failedTests && input.failedTests.length > 0) {
    parts.push(
      `Tes yang belum lulus:\n- ${input.failedTests
        .slice(0, 6)
        .map((t) => clip(t, 200))
        .join("\n- ")}`
    );
  }
  if (input.lesson) {
    parts.push(`Konteks pelajaran: ${input.lesson.title}`);
  }
  parts.push("Beri satu petunjuk yang membantu siswa memperbaiki sendiri.");

  return [
    { role: "system", content: HINT_RULES },
    { role: "user", content: parts.join("\n\n") },
  ];
}
