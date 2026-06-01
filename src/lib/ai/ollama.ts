/**
 * Server-side client for a LOCAL Ollama instance.
 *
 * Everything here runs only on the Node.js server (never the browser): the
 * model endpoint is on the same host as the app, so we keep student data on the
 * server and pay nothing per request. There is no external API key.
 *
 * Configuration (all optional, sane defaults for the dev/prod box):
 *   OLLAMA_URL    base URL of the Ollama HTTP API (default http://localhost:11434)
 *   OLLAMA_MODEL  model tag to use            (default qwen2.5-coder:7b)
 *
 * The public surface is intentionally tiny:
 *   - streamChat(messages, opts)  -> async generator of text deltas
 *   - isOllamaAvailable()         -> boolean health probe
 */

export const OLLAMA_URL = (
  process.env.OLLAMA_URL || "http://localhost:11434"
).replace(/\/$/, "");

export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  /** Sampling temperature. Lower = more focused/consistent. */
  temperature?: number;
  /** Hard cap on generated tokens so a request can't run away. */
  maxTokens?: number;
  /** Abort the whole request after this many ms. */
  timeoutMs?: number;
  /** External abort signal (e.g. client disconnected). */
  signal?: AbortSignal;
}

/** Raised when Ollama is unreachable or returns a non-OK status. */
export class OllamaError extends Error { }

/**
 * Streams a chat completion from Ollama, yielding text deltas as they arrive.
 *
 * Ollama's /api/chat with stream:true returns newline-delimited JSON, one
 * object per line: `{ message: { content }, done }`. We parse incrementally and
 * yield only the content fragments so callers can pipe straight to the browser.
 */
export async function* streamChat(
  messages: ChatMessage[],
  opts: ChatOptions = {}
): AsyncGenerator<string> {
  const { temperature = 0.4, maxTokens = 700, timeoutMs = 60_000, signal } =
    opts;

  // Combine an internal timeout with any caller-provided signal.
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? anySignal([signal, timeout]) : timeout;

  let res: Response;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: true,
        options: { temperature, num_predict: maxTokens },
      }),
      signal: combined,
    });
  } catch (err) {
    throw new OllamaError(
      err instanceof Error && err.name === "TimeoutError"
        ? "Asisten AI tidak merespons (timeout)."
        : "Asisten AI sedang tidak tersedia."
    );
  }

  if (!res.ok || !res.body) {
    throw new OllamaError(`Asisten AI gagal merespons (HTTP ${res.status}).`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Process complete lines; keep any partial line in the buffer.
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      const delta = parseDelta(line);
      if (delta) yield delta;
    }
  }

  const tail = buffer.trim();
  if (tail) {
    const delta = parseDelta(tail);
    if (delta) yield delta;
  }
}

function parseDelta(line: string): string | null {
  try {
    const obj = JSON.parse(line) as {
      message?: { content?: string };
      error?: string;
    };
    if (obj.error) throw new OllamaError(obj.error);
    return obj.message?.content ?? null;
  } catch (err) {
    if (err instanceof OllamaError) throw err;
    // Ignore malformed/partial lines.
    return null;
  }
}

/** Quick health probe used to fail fast with a friendly message. */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(2_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Minimal AbortSignal.any polyfill (Node 18 lacks it on some runtimes). */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      controller.abort(s.reason);
      break;
    }
    s.addEventListener("abort", () => controller.abort(s.reason), {
      once: true,
    });
  }
  return controller.signal;
}
