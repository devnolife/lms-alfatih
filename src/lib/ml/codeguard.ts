/**
 * "Detektif Error" — a tiny, explainable classifier that predicts whether a
 * snippet of Python code will RUN or ERROR, used as a teaching tool for the
 * concept of classification (the same idea as the Teachable Machine drawing
 * game, but the "input" is code text instead of a picture).
 *
 * Pipeline mirrors src/lib/ml/teachable.ts so students meet one consistent
 * mental model: text → features (a list of yes/no "clues") → KNN vote over
 * labelled examples → prediction + confidence.
 *
 * IMPORTANT (pedagogy): these features are deliberately SHALLOW syntax checks.
 * They catch common beginner mistakes (unbalanced brackets, missing colon,
 * Python-2 print) but they CANNOT know about runtime errors like using an
 * undefined variable. That gap is intentional — it powers the "AI can be wrong"
 * lesson moment when the model's guess disagrees with the real Python run.
 *
 * All functions here are PURE (no DOM/IO) so they are trivial to unit test.
 */

import { classify, type Sample, type Prediction } from "@/lib/ml/teachable";

export type CodeLabel = "error" | "aman";

/** One human-readable "clue" the detective looks at. */
export interface ClueDef {
  key: string;
  /** Short kid-friendly label shown in the UI. */
  label: string;
  /** Returns true when the clue looks HEALTHY (no problem detected). */
  test: (code: string) => boolean;
}

/** Strips a trailing `# comment` so checks ignore comments. */
function stripComment(line: string): string {
  // Naive but fine for beginner code: cut at the first '#' that is not inside
  // an obvious string. We keep it simple on purpose.
  let inS = false;
  let inD = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === "#" && !inS && !inD) return line.slice(0, i);
  }
  return line;
}

function count(code: string, ch: string): number {
  let n = 0;
  for (const c of code) if (c === ch) n++;
  return n;
}

const BLOCK_KEYWORDS = [
  "if",
  "elif",
  "else",
  "for",
  "while",
  "def",
  "class",
  "try",
  "except",
  "finally",
  "with",
];

/**
 * The ordered list of clues. The feature vector is exactly these tests turned
 * into 1 (healthy) / 0 (problem), so the UI can show each clue with a ✓/✗.
 */
export const CLUES: ClueDef[] = [
  {
    key: "parens",
    label: "Kurung ( ) seimbang",
    test: (code) => count(code, "(") === count(code, ")"),
  },
  {
    key: "brackets",
    label: "Kurung siku [ ] seimbang",
    test: (code) => count(code, "[") === count(code, "]"),
  },
  {
    key: "braces",
    label: "Kurung kurawal { } seimbang",
    test: (code) => count(code, "{") === count(code, "}"),
  },
  {
    key: "quotes",
    label: "Tanda kutip lengkap",
    test: (code) => count(code, '"') % 2 === 0 && count(code, "'") % 2 === 0,
  },
  {
    key: "colon",
    label: "Titik dua ( : ) ada di if/for/def",
    test: (code) =>
      code.split("\n").every((raw) => {
        const line = stripComment(raw).trim();
        if (!line) return true;
        const first = line.split(/[\s(:]/)[0];
        if (!BLOCK_KEYWORDS.includes(first)) return true;
        return line.endsWith(":");
      }),
  },
  {
    key: "printParen",
    label: "print memakai kurung ( )",
    test: (code) => {
      // Every `print` must be followed (ignoring spaces) by '('.
      const re = /\bprint\b/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(code)) !== null) {
        let j = m.index + 5;
        while (j < code.length && (code[j] === " " || code[j] === "\t")) j++;
        if (code[j] !== "(") return false;
      }
      return true;
    },
  },
];

/** Number of features each sample/query carries. */
export const FEATURE_COUNT = CLUES.length;

/**
 * Turns code into its feature vector: 1 where a clue is healthy, 0 where it
 * spots a problem. Same shape the KNN classifier expects.
 */
export function extractCodeFeatures(code: string): number[] {
  return CLUES.map((c) => (c.test(code) ? 1 : 0));
}

/** Per-clue status for the UI ("kenapa AI menebak begitu"). */
export interface ClueStatus {
  key: string;
  label: string;
  ok: boolean;
}

export function explainClues(code: string): ClueStatus[] {
  return CLUES.map((c) => ({ key: c.key, label: c.label, ok: c.test(code) }));
}

/** A labelled training example shown to (and learned by) the student. */
export interface CodeExample {
  code: string;
  label: CodeLabel;
}

/**
 * Built-in training set. Balanced between "aman" and "error" and chosen so each
 * error example trips exactly one clue — easy for students to reason about.
 * NOTE: none of these rely on runtime-only errors; that gap is the lesson.
 */
export const SEED_EXAMPLES: CodeExample[] = [
  // aman
  { code: 'print("Halo!")', label: "aman" },
  { code: "x = 5\nprint(x)", label: "aman" },
  { code: "for i in range(3):\n    print(i)", label: "aman" },
  { code: 'nama = "Budi"\nprint("Hai", nama)', label: "aman" },
  { code: 'if 5 > 3:\n    print("benar")', label: "aman" },
  { code: "nilai = [7, 8, 9]\nprint(nilai)", label: "aman" },
  // error
  { code: 'print("Halo!"', label: "error" }, // kurung belum ditutup
  { code: 'print("Halo!)', label: "error" }, // kutip belum ditutup
  { code: "for i in range(3)\n    print(i)", label: "error" }, // titik dua hilang
  { code: 'if 5 > 3\n    print("benar")', label: "error" }, // titik dua hilang
  { code: 'print "Halo!"', label: "error" }, // gaya Python 2
  { code: "nilai = [7, 8, 9\nprint(nilai)", label: "error" }, // siku belum ditutup
];

/** Builds KNN samples from labelled code examples. */
export function toSamples(examples: CodeExample[]): Sample[] {
  return examples.map((e) => ({
    label: e.label,
    features: extractCodeFeatures(e.code),
  }));
}

/**
 * Predicts "error" / "aman" for a snippet given the examples the model has
 * learned. Thin wrapper over the shared KNN so the game and tests share logic.
 */
export function predictCode(
  examples: CodeExample[],
  code: string,
  k = 3
): Prediction {
  return classify(toSamples(examples), extractCodeFeatures(code), k);
}
