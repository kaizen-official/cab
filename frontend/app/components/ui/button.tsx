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
  primary: "bg-accent-mint text-[#040404] hover:bg-accent-mint/90",
  secondary: "border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default hover:bg-white/3",
  ghost: "text-text-secondary hover:text-text-primary hover:bg-white/4",
  danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
};

const sizes: Record<string, string> = {
  sm: "px-3 py-1.5 text-[12px] rounded-[8px]",
  md: "px-4 py-2.5 text-[13px] rounded-[10px]",
  lg: "px-5 py-3 text-[14px] rounded-[12px]",
};

export default function Button({ variant = "primary", size = "md", loading, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium transition-all cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed",
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
