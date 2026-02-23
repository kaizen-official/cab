"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

type DropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
};

export default function Dropdown({ value, onChange, options, placeholder = "Select", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={clsx(
          "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-[14px]",
          "bg-bg-surface border border-border-subtle rounded-[10px] transition-colors",
          "hover:border-border-default focus:border-accent-mint/40 focus:outline-none",
          "text-left cursor-pointer"
        )}
      >
        <span className={selected ? "text-text-primary" : "text-text-tertiary"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={clsx("text-text-tertiary shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 glass rounded-[10px] py-1 border border-border-default shadow-xl max-h-[200px] overflow-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={clsx(
                "w-full px-3.5 py-2 text-[14px] text-left transition-colors cursor-pointer",
                opt.value === value
                  ? "bg-accent-mint-muted text-accent-mint"
                  : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
