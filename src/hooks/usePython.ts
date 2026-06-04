"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { friendlyError } from "@/lib/python/errors";
import type { DrawCommand, RunResult } from "@/lib/python/types";

export type PythonStatus = "idle" | "loading" | "ready" | "running";

// Generous budget for the first run while Pyodide (~10MB) downloads/boots.
const BOOT_TIMEOUT_MS = 60_000;
// Tight budget once code is actually executing — catches infinite loops.
const EXEC_TIMEOUT_MS = 12_000;

interface PendingRun {
  resolve: (result: RunResult) => void;
  stdout: string[];
  stderr: string[];
  bootTimer: ReturnType<typeof setTimeout> | null;
  execTimer: ReturnType<typeof setTimeout> | null;
}

/**
 * Manages a single Pyodide Web Worker for running student Python code.
 *
 * - Lazily boots the worker on first run (Pyodide is large, ~10MB).
 * - Streams stdout/stderr and returns a consolidated RunResult.
 * - Two watchdogs: a long boot timeout while Pyodide loads, then a short
 *   execution timeout (started on the worker's "exec" ack) that terminates and
 *   recreates the worker if a run hangs (e.g. an infinite loop).
 */
export function usePython() {
  const [status, setStatus] = useState<PythonStatus>("idle");
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<number, PendingRun>>(new Map());
  const idRef = useRef(0);
  const statusRef = useRef<PythonStatus>("idle");

  const setBoth = useCallback((s: PythonStatus) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const clearTimers = useCallback((pending: PendingRun) => {
    if (pending.bootTimer) clearTimeout(pending.bootTimer);
    if (pending.execTimer) clearTimeout(pending.execTimer);
  }, []);

  const teardown = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    for (const pending of pendingRef.current.values()) clearTimers(pending);
    pendingRef.current.clear();
  }, [clearTimers]);

  const createWorker = useCallback(() => {
    const worker = new Worker("/python-worker.js?v=2");

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data || {};

      if (data.type === "status") {
        if (data.status === "loading") setBoth("loading");
        else if (data.status === "ready" && statusRef.current !== "running") {
          setBoth("ready");
        }
        return;
      }

      const pending = pendingRef.current.get(data.id);
      if (!pending) return;

      if (data.type === "exec") {
        // Pyodide is ready and code is now executing: switch to the short
        // execution watchdog.
        if (pending.bootTimer) {
          clearTimeout(pending.bootTimer);
          pending.bootTimer = null;
        }
        pending.execTimer = setTimeout(() => {
          pendingRef.current.delete(data.id);
          teardown();
          setBoth("idle");
          pending.resolve({
            ok: false,
            stdout: pending.stdout.join(""),
            stderr: pending.stderr.join(""),
            error:
              "Kode berjalan terlalu lama dan dihentikan. Apakah ada perulangan (loop) yang tidak pernah berhenti?",
            rawError: "timeout",
            draw: [],
            hadTurtle: false,
            timedOut: true,
          });
        }, EXEC_TIMEOUT_MS);
      } else if (data.type === "stdout") {
        pending.stdout.push(data.text);
      } else if (data.type === "stderr") {
        pending.stderr.push(data.text);
      } else if (data.type === "done") {
        clearTimers(pending);
        pendingRef.current.delete(data.id);
        const rawError: string | null = data.ok ? null : data.error ?? "Unknown error";
        pending.resolve({
          ok: data.ok,
          stdout: pending.stdout.join(""),
          stderr: pending.stderr.join(""),
          error: rawError ? friendlyError(rawError) : null,
          rawError,
          draw: (data.draw ?? []) as DrawCommand[],
          hadTurtle: Boolean(data.hadTurtle),
          timedOut: false,
        });
        if (pendingRef.current.size === 0) setBoth("ready");
      }
    };

    worker.onerror = () => {
      for (const [, pending] of pendingRef.current) {
        clearTimers(pending);
        pending.resolve({
          ok: false,
          stdout: pending.stdout.join(""),
          stderr: pending.stderr.join(""),
          error: "Terjadi kesalahan pada mesin Python. Coba jalankan lagi.",
          rawError: "worker error",
          draw: [],
          hadTurtle: false,
          timedOut: false,
        });
      }
      pendingRef.current.clear();
      teardown();
      setBoth("idle");
    };

    workerRef.current = worker;
    return worker;
  }, [clearTimers, setBoth, teardown]);

  const getWorker = useCallback(() => {
    if (!workerRef.current) return createWorker();
    return workerRef.current;
  }, [createWorker]);

  /** Eagerly boot Pyodide (e.g. on editor mount) so the first Run feels fast. */
  const preload = useCallback(() => {
    if (statusRef.current === "idle") {
      getWorker().postMessage({ type: "init" });
    }
  }, [getWorker]);

  const run = useCallback(
    (code: string, stdin = ""): Promise<RunResult> => {
      const worker = getWorker();
      const id = ++idRef.current;
      setBoth("running");

      return new Promise<RunResult>((resolve) => {
        const pending: PendingRun = {
          resolve,
          stdout: [],
          stderr: [],
          execTimer: null,
          bootTimer: setTimeout(() => {
            pendingRef.current.delete(id);
            teardown();
            setBoth("idle");
            resolve({
              ok: false,
              stdout: "",
              stderr: "",
              error:
                "Mesin Python gagal dimuat tepat waktu. Cek koneksi internet lalu coba lagi.",
              rawError: "boot timeout",
              draw: [],
              hadTurtle: false,
              timedOut: true,
            });
          }, BOOT_TIMEOUT_MS),
        };
        pendingRef.current.set(id, pending);
        worker.postMessage({ type: "run", id, code, stdin });
      });
    },
    [getWorker, setBoth, teardown]
  );

  useEffect(() => teardown, [teardown]);

  return { status, run, preload };
}
