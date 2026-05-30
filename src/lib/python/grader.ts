import type { ChallengeSpec } from "@/lib/content";
import type { RunResult } from "@/lib/python/types";

export interface TestResult {
  name: string;
  passed: boolean;
  detail?: string;
}

export interface GradeResult {
  passed: boolean;
  results: TestResult[];
}

type Runner = (code: string, stdin?: string) => Promise<RunResult>;

function normalize(s: string): string {
  return s
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

/**
 * Runs each test-case for a challenge through the Python runtime and reports
 * pass/fail. Supports stdout matching, stdin feeding, and Python assertions.
 */
export async function gradeChallenge(
  run: Runner,
  challenge: ChallengeSpec,
  code: string
): Promise<GradeResult> {
  const tests = challenge.tests ?? [];
  const results: TestResult[] = [];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const name = test.name ?? `Tes ${i + 1}`;

    let toRun = code;
    if (test.assertions?.length) {
      const asserts = test.assertions
        .map((a) => `assert (${a})`)
        .join("\n");
      toRun = `${code}\n\n${asserts}\n`;
    }

    const result = await run(toRun, test.stdin ?? "");

    if (!result.ok) {
      results.push({
        passed: false,
        name,
        detail: result.error ?? "Kode gagal dijalankan.",
      });
      continue;
    }

    if (typeof test.expectedStdout === "string") {
      const got = normalize(result.stdout);
      const want = normalize(test.expectedStdout);
      if (got !== want) {
        results.push({
          passed: false,
          name,
          detail: `Output belum sesuai.\nDiharapkan:\n${want || "(kosong)"}\nDidapat:\n${got || "(kosong)"}`,
        });
        continue;
      }
    }

    results.push({ passed: true, name });
  }

  return {
    passed: results.length > 0 && results.every((r) => r.passed),
    results,
  };
}
