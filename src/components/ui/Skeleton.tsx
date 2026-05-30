interface SkeletonProps {
  className?: string;
}

/** Shimmering placeholder block. Compose several to mimic page layout. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

/** Centered full-area spinner with a label, for simple loading fallbacks. */
export function LoadingScreen({ label = "Memuat…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-[var(--color-graphite)]">
      <svg
        className="animate-spin text-[var(--color-duo-green)]"
        width={40}
        height={40}
        viewBox="0 0 24 24"
        fill="none"
        role="status"
        aria-label={label}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-sm font-bold uppercase tracking-wide">{label}</p>
    </div>
  );
}
