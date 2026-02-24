"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-[12px] font-medium text-text-secondary tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={clsx(
              "w-full px-3.5 py-3 pr-10 text-[14px] text-text-primary bg-bg-surface/80 border border-border-subtle rounded-[12px] transition-all duration-200 appearance-none",
              "hover:border-border-default focus:border-accent-mint/40 focus:ring-1 focus:ring-accent-mint/20 focus:outline-none",
              error && "border-red-500/50",
              className
            )}
            {...props}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
          />
        </div>
        {error && <span className="text-[12px] text-red-400">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
