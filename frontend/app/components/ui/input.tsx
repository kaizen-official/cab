"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[12px] font-medium text-text-secondary tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              "w-full px-3.5 py-3 text-[14px] text-text-primary bg-bg-surface/80 border border-border-subtle rounded-[12px] transition-all duration-200",
              "hover:border-border-default focus:border-accent-mint/40 focus:ring-1 focus:ring-accent-mint/20 focus:bg-bg-surface",
              "placeholder:text-text-tertiary",
              icon && "pl-10",
              error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-[12px] text-red-400">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
