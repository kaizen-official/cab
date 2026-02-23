"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import clsx from "clsx";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[13px] text-text-secondary">{label}</label>}
      <select
        ref={ref}
        className={clsx(
          "w-full px-3.5 py-2.5 text-[14px] text-text-primary bg-bg-surface border border-border-subtle rounded-[10px] transition-colors appearance-none",
          "hover:border-border-default focus:border-accent-mint/40 focus:outline-none",
          error && "border-red-500/50",
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="text-[12px] text-red-400">{error}</span>}
    </div>
  );
});

Select.displayName = "Select";
export default Select;
