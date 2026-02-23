"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] text-text-secondary">{label}</label>
      )}
      <input
        ref={ref}
        className={clsx(
          "w-full px-3.5 py-2.5 text-[14px] text-text-primary bg-bg-surface border border-border-subtle rounded-[10px] transition-colors",
          "hover:border-border-default focus:border-accent-mint/40 focus:bg-bg-surface",
          error && "border-red-500/50",
          className
        )}
        {...props}
      />
      {error && <span className="text-[12px] text-red-400">{error}</span>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
