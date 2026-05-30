export interface TurtleLine {
  op: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
}

export interface TurtleDot {
  op: "dot";
  x: number;
  y: number;
  r: number;
  color: string;
}

export type DrawCommand = TurtleLine | TurtleDot;

export interface RunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  /** Friendly, beginner-facing error message (Indonesian) when ok is false. */
  error: string | null;
  /** Raw error message from Python, kept for debugging. */
  rawError: string | null;
  /** Drawing commands emitted via the turtle shim. */
  draw: DrawCommand[];
  hadTurtle: boolean;
  /** True when the run was aborted by the watchdog (likely an infinite loop). */
  timedOut: boolean;
}
