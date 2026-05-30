"use client";

import useAutoStepper from "@/hooks/useAutoStepper";
import PlayControls from "@/components/lesson/visualizers/PlayControls";

interface Props {
  /** Variable name, e.g. "angka". */
  varName?: string;
  /** Comma-separated values to test in turn, e.g. "3,7,5,9". */
  values?: string;
  /** Comparison operator: >, <, >=, <=, ==, !=. */
  op?: string;
  /** Right-hand side of the comparison. */
  threshold?: string;
  /** Text printed when the condition is true. */
  whenTrue?: string;
  /** Text printed when the condition is false. */
  whenFalse?: string;
}

function evaluate(left: number, op: string, right: number): boolean {
  switch (op) {
    case "<":
      return left < right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case ">":
    default:
      return left > right;
  }
}

/**
 * Auto-animates an if/else branch: cycles through sample values, evaluates the
 * condition, lights up the branch that runs, and shows what gets printed.
 */
export default function ConditionFlow({
  varName = "angka",
  values = "3,7,5,9",
  op = ">",
  threshold = "5",
  whenTrue = "Besar",
  whenFalse = "Kecil",
}: Props) {
  const samples = values.split(",").map((v) => Number.parseInt(v.trim(), 10));
  const right = Number.parseInt(threshold, 10) || 0;

  const { value: idx, playing, toggle, reset } = useAutoStepper(
    samples.length - 1,
    { intervalMs: 2400 }
  );

  const current = samples[idx] ?? 0;
  const result = evaluate(current, op, right);

  const branchClass = (active: boolean) =>
    active
      ? "bg-[var(--color-sunshine)]/30 rounded px-1"
      : "opacity-40";

  return (
    <div className="not-prose my-5 grid gap-3 sm:grid-cols-2 rounded-2xl border-2 border-[var(--color-cloud)] bg-white p-4">
      <div>
        <div className="text-[10px] uppercase tracking-wide text-[var(--color-silver)]">
          Kode
        </div>
        <pre className="mt-1 rounded-xl bg-[#1e1e1e] px-3 py-3 text-sm leading-relaxed text-white">
          <code>
            <div>
              {varName} = <span className="text-[#b5cea8]">{current}</span>
            </div>
            <div>
              <span className="text-[#c586c0]">if</span> {varName} {op} {right}:
            </div>
            <div className={branchClass(result)}>
              {"    "}
              <span className="text-[#dcdcaa]">print</span>(
              <span className="text-[#ce9178]">&quot;{whenTrue}&quot;</span>)
            </div>
            <div>
              <span className="text-[#c586c0]">else</span>:
            </div>
            <div className={branchClass(!result)}>
              {"    "}
              <span className="text-[#dcdcaa]">print</span>(
              <span className="text-[#ce9178]">&quot;{whenFalse}&quot;</span>)
            </div>
          </code>
        </pre>
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--color-silver)]">
            Pengecekan
          </div>
          <div className="mt-1 rounded-xl border-2 border-[var(--color-cloud)] bg-[#f7f7f7] px-3 py-2 text-sm font-bold">
            {current} {op} {right} ={" "}
            <span
              className={
                result
                  ? "text-[var(--color-duo-green-dark)]"
                  : "text-[var(--color-bubblegum)]"
              }
            >
              {result ? "Benar ✓" : "Salah ✗"}
            </span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--color-silver)]">
            Output
          </div>
          <pre className="mt-1 min-h-[40px] rounded-xl border-2 border-[var(--color-cloud)] bg-[#f7f7f7] px-3 py-2 text-sm">
            {result ? whenTrue : whenFalse}
          </pre>
        </div>
      </div>

      <div className="sm:col-span-2">
        <PlayControls
          playing={playing}
          onToggle={toggle}
          onReset={reset}
          status={`${varName} = ${current}`}
        />
      </div>
    </div>
  );
}
