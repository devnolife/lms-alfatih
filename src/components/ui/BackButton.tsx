import PendingLink from "./PendingLink";

interface BackButtonProps {
  /** Parent route to navigate back to. */
  href: string;
  /** Label shown after the arrow. Defaults to "Kembali". */
  label?: string;
  className?: string;
}

/**
 * Reusable "back" pill for sub-pages. Styled to match the FunPython/Duolingo
 * design language: rounded cloud-bordered chip with a nudging arrow on hover.
 * Uses PendingLink so slow navigations show a spinner.
 */
export default function BackButton({
  href,
  label = "Kembali",
  className = "",
}: BackButtonProps) {
  return (
    <PendingLink
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-cloud)] bg-white px-4 py-2 text-[var(--color-charcoal)] no-underline transition-colors hover:border-[var(--color-sky-blue)] hover:text-[var(--color-sky-blue-dark)] ${className}`}
      style={{ fontFamily: "var(--font-din)", fontWeight: 700, fontSize: 14, letterSpacing: "0.04em" }}
    >
      <span className="text-lg leading-none transition-transform group-hover:-translate-x-0.5">
        ←
      </span>
      {label}
    </PendingLink>
  );
}
