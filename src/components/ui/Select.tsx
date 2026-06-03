import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Extra size preset. Defaults to medium. */
  selectSize?: "sm" | "md";
}

const sizeClass: Record<NonNullable<SelectProps["selectSize"]>, string> = {
  sm: "py-1.5 pl-3 pr-9 text-sm",
  md: "py-2.5 pl-3.5 pr-10 text-sm",
};

/**
 * Consistent, app-styled dropdown. Wraps a native `<select>` (so it keeps
 * working inside plain `method="get"` forms with zero JavaScript) but hides the
 * browser's default chevron via `appearance-none` and paints our own, plus a
 * rounded border and green focus ring that match the rest of the UI.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { selectSize = "md", className = "", children, ...rest },
  ref
) {
  return (
    <span className="relative inline-flex">
      <select
        ref={ref}
        className={`cursor-pointer appearance-none rounded-2xl border-2 border-[var(--color-cloud)] bg-white font-medium text-[var(--color-charcoal)] transition-colors outline-none hover:border-[var(--color-silver)] focus:border-[var(--color-duo-green)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-duo-green)_25%,transparent)] ${sizeClass[selectSize]} ${className}`}
        {...rest}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-graphite)]"
      >
        <path
          d="M6 8l4 4 4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
});

export default Select;
