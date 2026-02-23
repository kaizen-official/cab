"use client";

import { Minus, Plus } from "lucide-react";

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export default function Stepper({ value, onChange, min = 1, max = 10, className }: StepperProps) {
  return (
    <div className={`flex items-center gap-1 ${className || ""}`}>
      <button
        type="button"
        title="decrease value"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <span className="w-6 text-center text-[14px] text-text-primary font-medium tabular-nums">
        {value}
      </span>
      <button
        type="button"
        title="increase value"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
