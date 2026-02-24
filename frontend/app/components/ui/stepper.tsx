"use client";

import { Minus, Plus } from "lucide-react";

type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
};

export default function Stepper({
  value,
  onChange,
  min = 1,
  max = 10,
  className,
}: StepperProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className || ""}`}>
      <button
        type="button"
        title="decrease value"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-150 cursor-pointer active:scale-90"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <span className="w-8 text-center text-[15px] text-text-primary font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        title="increase value"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all duration-150 cursor-pointer active:scale-90"
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
