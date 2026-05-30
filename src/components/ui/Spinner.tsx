interface SpinnerProps {
  /** Diameter in pixels. Defaults to 18. */
  size?: number;
  /** Stroke width. Defaults to 3. */
  strokeWidth?: number;
  className?: string;
  label?: string;
}

/**
 * Lightweight, dependency-free spinner. Inherits `currentColor`, so it adapts
 * to whatever text color its container uses. Safe to render in both server and
 * client components.
 */
export default function Spinner({
  size = 18,
  strokeWidth = 3,
  className = "",
  label = "Memuat",
}: SpinnerProps) {
  return (
    <svg
      className={`animate-spin shrink-0 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
}
