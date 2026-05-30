"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";

type Variant = "green" | "blue" | "outline" | "plain";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  /** Text shown next to the spinner while loading. Falls back to children. */
  loadingText?: ReactNode;
  variant?: Variant;
  /** Use the tactile 3D Duolingo button styling. Defaults to true. */
  tactile?: boolean;
}

const variantClass: Record<Variant, string> = {
  green: "btn-green",
  blue: "btn-blue",
  outline: "btn-outline",
  plain: "",
};

/**
 * Button with a built-in loading state. While `loading` is true the button is
 * disabled and shows a spinner, giving immediate feedback so users never wonder
 * whether their click registered.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    loading = false,
    loadingText,
    variant = "green",
    tactile = true,
    disabled,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const base = tactile ? `btn-3d ${variantClass[variant]}` : "";
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${base} ${className} disabled:opacity-60 disabled:cursor-not-allowed`}
      {...rest}
    >
      {loading && <Spinner size={18} />}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
});

export default Button;
