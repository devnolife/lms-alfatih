"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "./Spinner";

interface Props {
  className?: string;
}

/**
 * Logout control with a loading state. Calls the logout API then refreshes so
 * the user sees immediate feedback instead of a frozen button.
 */
export default function LogoutButton({ className = "" }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    if (pending) return;
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex items-center gap-1.5 disabled:opacity-60 ${className}`}
    >
      {pending && <Spinner size={14} />}
      {pending ? "Keluar…" : "Keluar"}
    </button>
  );
}
