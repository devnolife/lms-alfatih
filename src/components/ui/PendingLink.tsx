"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import type { ComponentProps, ReactNode } from "react";
import Spinner from "./Spinner";

/**
 * Inline indicator that reveals a spinner while the parent <Link> navigation is
 * pending. Must be rendered as a descendant of a <Link>. Uses a reserved,
 * delayed reveal so fast (prefetched) navigations don't flash.
 */
function NavIndicator({ size = 16 }: { size?: number }) {
  const { pending } = useLinkStatus();
  return (
    <span className={`nav-hint ${pending ? "is-pending" : ""}`} aria-hidden={!pending}>
      <Spinner size={size} />
    </span>
  );
}

type PendingLinkProps = ComponentProps<typeof Link> & {
  children: ReactNode;
  /** Spinner size in px. */
  indicatorSize?: number;
};

/**
 * Drop-in replacement for next/link that shows a loading spinner during slow
 * navigations (dynamic, server-rendered routes). Prefetched/static routes skip
 * the pending state automatically, so the spinner only appears when it matters.
 */
export default function PendingLink({
  children,
  indicatorSize,
  ...props
}: PendingLinkProps) {
  return (
    <Link {...props}>
      {children}
      <NavIndicator size={indicatorSize} />
    </Link>
  );
}
