/**
 * Mini client-side Python interpreter.
 * Supports: print(), string repetition, basic math, variables, simple for-range loops.
 */

export interface RunResult {
  output: string;
  error: string | null;
}

export function runPython(code: string): RunResult {
  const lines = code.split("\n");
  const outputBuffer: string[] = [];
  const variables: Record<string, string | number> = {};

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("#")) continue;

      // Variable assignment
      if (line.includes("=") && !line.startsWith("print") && !line.startsWith("for")) {
        const eqIdx = line.indexOf("=");
        const varName = line.substring(0, eqIdx).trim();
        const varVal = line.substring(eqIdx + 1).trim();

        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
          throw new Error(`Nama variabel "${varName}" tidak valid di Python!`);
        }

        variables[varName] = evaluateExpression(varVal, 0, variables);
        continue;
      }

      // Simple for-range loop
      if (line.startsWith("for ") && line.endsWith(":")) {
        const rangeMatch = line.match(/for\s+(\w+)\s+in\s+range\((\d+)\)\s*:/);
        if (rangeMatch) {
          const loopVar = rangeMatch[1];
          const count = parseInt(rangeMatch[2]);
          // Collect indented body lines
          const bodyLines: string[] = [];
          while (
            i + 1 < lines.length &&
            (lines[i + 1].startsWith("    ") || lines[i + 1].startsWith("\t"))
          ) {
            bodyLines.push(lines[i + 1].trim());
            i++;
          }
          // If no indented lines but next line is a print, treat it as body
          if (bodyLines.length === 0 && i + 1 < lines.length) {
            const nextTrimmed = lines[i + 1].trim();
            if (nextTrimmed.startsWith("print")) {
              bodyLines.push(nextTrimmed);
              i++;
            }
          }

          for (let step = 0; step < count; step++) {
            const loopEnv = { ...variables, [loopVar]: step };
            for (const bodyLine of bodyLines) {
              if (bodyLine.startsWith("print(") && bodyLine.endsWith(")")) {
                const inside = bodyLine.substring(6, bodyLine.length - 1);
                outputBuffer.push(String(evaluateExpression(inside, step, loopEnv)));
              }
            }
          }
          continue;
        }
        throw new Error("Loop hanya mendukung for x in range(n) sederhana!");
      }

      // Print
      if (line.startsWith("print(") && line.endsWith(")")) {
        const inside = line.substring(6, line.length - 1);
        outputBuffer.push(String(evaluateExpression(inside, 0, variables)));
        continue;
      }

      throw new Error(`Perintah tidak dikenal: "${line}". Gunakan print() ya!`);
    }
  } catch (err) {
    return {
      output: "",
      error: err instanceof Error ? err.message : "Terjadi kesalahan!",
    };
  }

  return { output: outputBuffer.join("\n"), error: null };
}

function evaluateExpression(
  expr: string,
  loopIndex: number,
  env: Record<string, string | number>
): string | number {
  expr = expr.trim();

  // Replace loop variable references
  for (const [key, value] of Object.entries(env)) {
    const pattern = new RegExp(`\\b${key}\\b`, "g");
    if (pattern.test(expr)) {
      expr = expr.replace(pattern, typeof value === "string" ? `"${value}"` : String(value));
    }
  }

  // String repetition: "x" * n
  const strMulMatch = expr.match(/^["']([^"']*)["']\s*\*\s*(.+)$/);
  if (strMulMatch) {
    const str = strMulMatch[1];
    const n = safeEvalMath(strMulMatch[2]);
    return str.repeat(n);
  }

  // Plain string literal
  if (
    (expr.startsWith('"') && expr.endsWith('"')) ||
    (expr.startsWith("'") && expr.endsWith("'"))
  ) {
    return expr.substring(1, expr.length - 1);
  }

  // Math expression
  return safeEvalMath(expr);
}

function safeEvalMath(expr: string): number {
  // Only allow digits, operators, parentheses, spaces
  if (!/^[\d+\-*/().%\s]+$/.test(expr)) {
    throw new Error(`Ekspresi tidak aman: "${expr}"`);
  }
  const fn = new Function(`"use strict"; return (${expr});`);
  const result = fn();
  if (typeof result !== "number" || !isFinite(result)) {
    throw new Error(`Hasil bukan angka valid: "${expr}"`);
  }
  return result;
}
