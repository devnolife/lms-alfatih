import {
  streamChat,
  isOllamaAvailable,
  OllamaError,
  type ChatMessage,
} from "@/lib/ai/ollama";

/**
 * Turns an Ollama chat stream into a plain-text streaming HTTP Response that the
 * browser can read incrementally with fetch + ReadableStream.
 *
 * Errors mid-stream are surfaced as a short text marker (so the client shows a
 * friendly message) rather than a hard connection reset.
 */
export function streamChatResponse(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number; signal?: AbortSignal } = {}
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of streamChat(messages, opts)) {
          controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        const msg =
          err instanceof OllamaError
            ? err.message
            : "Maaf, asisten AI sedang bermasalah.";
        controller.enqueue(encoder.encode(`\n\n⚠️ ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

/** Shared guard: 503 when the local model is down. */
export async function ensureOllamaOr503(): Promise<Response | null> {
  const up = await isOllamaAvailable();
  if (up) return null;
  return Response.json(
    { error: "Asisten AI sedang tidak aktif. Coba lagi nanti." },
    { status: 503 }
  );
}
