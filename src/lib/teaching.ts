import { getAllLessons, type Lesson, type AnswerKeyItem } from "@/lib/content";
import { LEVELS, type LevelMeta } from "@/lib/curriculum";

/**
 * Facilitator guidance per level, distilled from docs/RUNDOWN-BOOTCAMP.md.
 * This is the "pegangan guru" content that does not live inside lesson files.
 */
export interface LevelFacilitation {
  /** Suggested time pacing for this level (guru-guided). */
  pacing: string;
  /** Learning objectives — what students should achieve. */
  objectives: string[];
  /** Practical teaching tips / talking points for the facilitator. */
  tips: string[];
}

const FACILITATION: Record<number, LevelFacilitation> = {
  1: {
    pacing: "± 35 menit (Orientasi 15' + Ksatria Logika 20')",
    objectives: [
      "Mengenali 7 elemen Informatika lewat kuis \"Cocokkan Misi\".",
      "Memecah masalah menjadi langkah kecil (dekomposisi) dan menemukan pola.",
      "Membaca serta melengkapi diagram alir (flowchart) dengan benar.",
    ],
    tips: [
      "Mulai dari contoh sehari-hari (algoritma mie instan / berangkat sekolah) sebelum istilah teknis.",
      "Tekankan kotak Keputusan ◇ yang memecah alur jadi cabang Ya/Tidak.",
      "Pastikan semua siswa menuntaskan \"Cek Pemahamanku\" agar gerbang Level 2 terbuka.",
    ],
  },
  2: {
    pacing: "± 45 menit (Navigator 25' + Kreator Konten 20')",
    objectives: [
      "Menata file ke folder yang benar (Gambar/Dokumen/Musik) dan membuat ZIP.",
      "Menyelesaikan Misi Penyelamatan Berkas (unggah misi).",
      "Memahami etika menyebarkan konten digital.",
    ],
    tips: [
      "Dampingi langkah membuat ZIP — ini titik yang sering membuat siswa bingung.",
      "Misi ZIP harus LULUS dulu sebelum gerbang Level 3 terbuka.",
      "Kaitkan etika konten dengan pengalaman media sosial siswa.",
    ],
  },
  3: {
    pacing: "± 20 menit",
    objectives: [
      "Mencocokkan perangkat keras (keyboard, CPU, monitor…) dengan fungsinya.",
      "Membedakan perangkat keras dan lunak.",
      "Memahami gambaran cara internet/website bekerja.",
    ],
    tips: [
      "Gunakan animasi \"perjalanan membuka website\" untuk memvisualkan jaringan.",
      "Tunjuk perangkat nyata di ruang kelas sebagai contoh konkret.",
    ],
  },
  4: {
    pacing: "± 20 menit",
    objectives: [
      "Menghitung total dan rata-rata dari data kantin di spreadsheet interaktif.",
      "Membaca grafik batang untuk membantu analisis.",
    ],
    tips: [
      "Ingatkan rumus rata-rata = total ÷ banyak data.",
      "Hubungkan dengan data nyata (uang jajan, nilai) agar bermakna.",
      "Setelah selesai, gerbang Level 5 (Python!) terbuka — beri jeda semangat.",
    ],
  },
  5: {
    pacing: "± 2 jam 45 menit — sesi terberat (Warm-up 45' + Logic Flow 60' + Turtle Art 60')",
    objectives: [
      "Menggunakan print(), variabel, jenis data, dan f-string.",
      "Memakai percabangan if/else dan perulangan for + range().",
      "Membuat fungsi (def) dengan loop untuk menggambar pola Turtle.",
    ],
    tips: [
      "Jadwalkan setelah makan siang saat fokus paling segar; beri pendampingan ekstra.",
      "Gunakan mini-game blok \"Pandu Kura-kura\" sebagai jembatan blok → kode Python.",
      "Selesai Turtle Art → Sertifikat FunPython terbuka; rayakan capaian ini.",
      "Aktivitas opsional (required: false) boleh dilewati bila waktu mepet.",
    ],
  },
  6: {
    pacing: "± 20 menit",
    objectives: [
      "Menerapkan checklist THINK sebelum membagikan sesuatu.",
      "Mengambil keputusan digital paling bijak lewat skenario bercabang.",
    ],
    tips: [
      "Bahas tiap cabang skenario sebagai diskusi kelas, bukan sekadar pilih jawaban.",
      "Kaitkan dengan kasus nyata cyberbullying/hoaks yang relevan bagi siswa.",
    ],
  },
  7: {
    pacing: "± 25 menit",
    objectives: [
      "Melatih AI dengan contoh gambar lalu menguji tebakannya.",
      "Memahami alur AI: contoh → latih → tebak → perbaiki.",
    ],
    tips: [
      "Tunjukkan bahwa AI bisa keliru — ini momen ajar \"AI melihat bentuk, bukan isi\".",
      "Bila ada waktu, persilakan eksplorasi mini-game opsional \"Detektif Error\".",
    ],
  },
};

/** Expected-output answer derived from a challenge's tests. */
export interface ChallengeAnswer {
  id: string;
  prompt: string;
  expected: string[];
}

export interface LessonGuideEntry {
  slug: string;
  title: string;
  summary: string;
  order: number;
  estimatedMinutes?: number;
  /** Facilitator notes authored in the lesson frontmatter. */
  teacherNotes?: string;
  /** Manual answer-key entries authored in the lesson frontmatter. */
  answerKey: AnswerKeyItem[];
  /** Expected outputs derived from code challenges. */
  challengeAnswers: ChallengeAnswer[];
}

export interface LevelGuide {
  meta: LevelMeta;
  facilitation?: LevelFacilitation;
  lessons: LessonGuideEntry[];
}

/**
 * A single full-screen slide for the instructor presentation mode.
 * Content uses simple, student-friendly language; `note` is a presenter-only
 * hint shown subtly at the bottom for the instructor to explain verbally.
 */
export interface Slide {
  kind: "cover" | "objectives" | "lesson" | "closing";
  emoji: string;
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  /** Presenter-only talking point (not the main projected content). */
  note?: string;
}

/**
 * Builds an ordered slide deck for a level, auto-generated from the lesson
 * content and facilitator guidance. Pure (no async) so it can run anywhere.
 */
export function buildLevelSlides(guide: LevelGuide): Slide[] {
  const { meta, facilitation, lessons } = guide;
  const slides: Slide[] = [];

  // Cover
  slides.push({
    kind: "cover",
    emoji: meta.emoji,
    title: `Level ${meta.level}`,
    subtitle: meta.title,
    body: meta.blurb,
    note: facilitation
      ? `Pacing: ${facilitation.pacing}`
      : `Elemen: ${meta.elementLabel}`,
  });

  // Objectives
  if (facilitation && facilitation.objectives.length > 0) {
    slides.push({
      kind: "objectives",
      emoji: "🎯",
      title: "Hari ini kita belajar",
      bullets: facilitation.objectives,
      note:
        facilitation.tips.length > 0
          ? `Untuk guru — ${facilitation.tips.join(" · ")}`
          : undefined,
    });
  }

  // One slide per lesson
  for (const lesson of lessons) {
    slides.push({
      kind: "lesson",
      emoji: "📘",
      title: lesson.title,
      body: lesson.summary,
      note: lesson.teacherNotes,
    });
  }

  // Closing
  slides.push({
    kind: "closing",
    emoji: "🎉",
    title: "Hebat!",
    subtitle: `Kamu menamatkan ${meta.title}`,
    body: "Siap lanjut ke petualangan berikutnya? 🚀",
  });

  return slides;
}


function challengeAnswers(lesson: Lesson): ChallengeAnswer[] {
  return lesson.challenges.map((c) => {
    const expected: string[] = [];
    for (const t of c.tests ?? []) {
      if (t.expectedStdout) {
        expected.push(t.expectedStdout.replace(/\n$/, ""));
      }
      for (const a of t.assertions ?? []) {
        expected.push(a);
      }
    }
    return { id: c.id, prompt: c.prompt, expected };
  });
}

/**
 * Builds the instructor handbook: every level (from LEVELS) joined with its
 * lessons and the facilitator guidance distilled from the bootcamp rundown.
 */
export async function getTeachingGuide(): Promise<LevelGuide[]> {
  const lessons = await getAllLessons();

  return LEVELS.map((meta) => {
    const levelLessons = lessons
      .filter((l) => l.level === meta.level)
      .sort((a, b) => a.order - b.order)
      .map<LessonGuideEntry>((l) => ({
        slug: l.slug,
        title: l.title,
        summary: l.summary,
        order: l.order,
        estimatedMinutes: l.estimatedMinutes,
        teacherNotes: l.teacherNotes,
        answerKey: l.answerKey,
        challengeAnswers: challengeAnswers(l),
      }));

    return {
      meta,
      facilitation: FACILITATION[meta.level],
      lessons: levelLessons,
    };
  });
}
