import type { ReactNode } from "react";

type CalloutType = "tip" | "info" | "warning" | "concept";

interface Props {
  type?: CalloutType;
  title?: string;
  children?: ReactNode;
}

const STYLES: Record<
  CalloutType,
  { icon: string; bg: string; border: string; text: string; label: string }
> = {
  tip: {
    icon: "💡",
    bg: "bg-[var(--color-duo-green-light)]",
    border: "border-[var(--color-duo-green)]",
    text: "text-[var(--color-duo-green-dark)]",
    label: "Tips",
  },
  info: {
    icon: "ℹ️",
    bg: "bg-[var(--color-sky-blue-light)]",
    border: "border-[var(--color-sky-blue)]",
    text: "text-[var(--color-sky-blue-dark)]",
    label: "Info",
  },
  warning: {
    icon: "⚠️",
    bg: "bg-[var(--color-error-light)]",
    border: "border-[var(--color-error)]",
    text: "text-[var(--color-error)]",
    label: "Hati-hati",
  },
  concept: {
    icon: "🧠",
    bg: "bg-[#f3ecff]",
    border: "border-[var(--color-grape)]",
    text: "text-[var(--color-grape-dark)]",
    label: "Konsep",
  },
};

export default function Callout({ type = "tip", title, children }: Props) {
  const style = STYLES[type] ?? STYLES.tip;
  return (
    <div
      className={`not-prose my-5 rounded-2xl border-2 ${style.border} ${style.bg} px-4 py-3`}
    >
      <div
        className={`flex items-center gap-2 font-bold text-sm uppercase tracking-wide ${style.text}`}
      >
        <span aria-hidden>{style.icon}</span>
        <span>{title ?? style.label}</span>
      </div>
      <div className="mt-1 text-sm text-[var(--color-almost-black)] leading-relaxed [&>p]:my-1">
        {children}
      </div>
    </div>
  );
}
