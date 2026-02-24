"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[12px] font-medium text-text-secondary tracking-wide uppercase">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            "w-full px-3.5 py-3 text-[14px] text-text-primary bg-bg-surface/80 border border-border-subtle rounded-[12px] transition-all duration-200 resize-none",
            "hover:border-border-default focus:border-accent-mint/40 focus:ring-1 focus:ring-accent-mint/20 focus:outline-none",
            "placeholder:text-text-tertiary",
            error && "border-red-500/50",
            className
          )}
          {...props}
        />
        {error && <span className="text-[12px] text-red-400">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
