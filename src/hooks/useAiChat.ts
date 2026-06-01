"use client";

import { useCallback, useRef, useState } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UseAiChatOptions {
  /** API endpoint that streams a plain-text reply. */
  endpoint: string;
  /** Slug passed to the server for lesson grounding. */
  lessonSlug?: string;
}

/**
 * Drives a streaming chat against a plain-text streaming endpoint (our AI
 * routes). Appends the user message, then progressively fills the assistant
 * message as bytes arrive so the UI feels alive.
 */
export function useAiChat({ endpoint, lessonSlug }: UseAiChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || streaming) return;

      setError(null);
      const history = [...messages, { role: "user" as const, content }];
      // Add the user message + an empty assistant slot to stream into.
      setMessages([...history, { role: "assistant", content: "" }]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, lessonSlug }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let msg = "Asisten AI sedang sibuk. Coba lagi sebentar.";
          try {
            const data = (await res.json()) as { error?: string };
            if (data.error) msg = data.error;
          } catch {
            /* response had no JSON body */
          }
          setError(msg);
          // Drop the empty assistant slot.
          setMessages((prev) => prev.slice(0, -1));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: acc };
            return next;
          });
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Gagal terhubung ke asisten AI.");
          setMessages((prev) => prev.slice(0, -1));
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [endpoint, lessonSlug, messages, streaming]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }, []);

  return { messages, streaming, error, send, stop, reset };
}
