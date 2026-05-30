"use client";

import { useEffect, useRef } from "react";
import type { DrawCommand } from "@/lib/python/types";

interface Props {
  commands: DrawCommand[];
  className?: string;
}

/**
 * Renders turtle drawing commands (line segments + dots) onto a canvas.
 * Auto-fits the drawing within the view with a margin, and flips the Y axis so
 * the coordinate system matches Python's turtle (Y up, origin centered).
 */
export default function TurtleCanvas({ commands, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 360;
    const cssH = canvas.clientHeight || 300;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    if (!commands.length) return;

    // Compute bounds of the drawing.
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const extend = (x: number, y: number) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    };
    for (const c of commands) {
      if (c.op === "line") {
        extend(c.x1, c.y1);
        extend(c.x2, c.y2);
      } else {
        extend(c.x - c.r, c.y - c.r);
        extend(c.x + c.r, c.y + c.r);
      }
    }

    const margin = 24;
    const drawW = Math.max(maxX - minX, 1);
    const drawH = Math.max(maxY - minY, 1);
    const scale = Math.min(
      (cssW - margin * 2) / drawW,
      (cssH - margin * 2) / drawH
    );
    const offsetX = (cssW - drawW * scale) / 2 - minX * scale;
    // Flip Y: canvas Y grows downward, turtle Y grows upward.
    const offsetY = (cssH - drawH * scale) / 2 + maxY * scale;

    const tx = (x: number) => offsetX + x * scale;
    const ty = (y: number) => offsetY - y * scale;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const c of commands) {
      if (c.op === "line") {
        ctx.beginPath();
        ctx.strokeStyle = c.color;
        ctx.lineWidth = Math.max(c.width * scale * 0.6, 1.5);
        ctx.moveTo(tx(c.x1), ty(c.y1));
        ctx.lineTo(tx(c.x2), ty(c.y2));
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.fillStyle = c.color;
        ctx.arc(tx(c.x), ty(c.y), Math.max(c.r * scale, 2), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [commands]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full block ${className}`}
      role="img"
      aria-label="Hasil gambar dari kode Python"
    />
  );
}
