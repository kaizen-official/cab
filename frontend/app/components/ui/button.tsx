"use client";

import { type ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
};

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-mint text-[#040404] hover:brightness-110 active:scale-[0.97] glow-mint",
  secondary:
    "border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default hover:bg-white/4 active:scale-[0.97]",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-white/5 active:scale-[0.97]",
  danger:
    "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:scale-[0.97]",
};

const sizes: Record<string, string> = {
  sm: "px-3.5 py-1.5 text-[12px] rounded-[10px] gap-1.5",
  md: "px-5 py-2.5 text-[13px] rounded-[12px] gap-2",
  lg: "px-6 py-3.5 text-[14px] rounded-[14px] gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
