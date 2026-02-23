"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[13px] text-text-secondary">{label}</label>}
      <textarea
        ref={ref}
        className={clsx(
          "w-full px-3.5 py-2.5 text-[14px] text-text-primary bg-bg-surface border border-border-subtle rounded-[10px] transition-colors resize-none",
          "hover:border-border-default focus:border-accent-mint/40 focus:outline-none",
          error && "border-red-500/50",
          className
        )}
        {...props}
      />
      {error && <span className="text-[12px] text-red-400">{error}</span>}
    </div>
  );
});

Textarea.displayName = "Textarea";
export default Textarea;
