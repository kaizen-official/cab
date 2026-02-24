"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Pick date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value + "T12:00:00");
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) return;
    setViewDate(new Date(value + "T12:00:00"));
  }, [value]);

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

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  function selectDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(dateStr);
    setOpen(false);
  }

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div ref={ref} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full min-w-0 text-left text-[14px] text-text-primary bg-transparent cursor-pointer"
      >
        <Calendar size={16} className="text-text-tertiary shrink-0" />
        <span className={value ? "" : "text-text-tertiary"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 glass-strong backdrop-blur-2xl rounded-[16px] p-4 shadow-2xl border border-border-default min-w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              title="previous month"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-[14px] font-semibold text-text-primary tracking-tight">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              title="next month"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-[10px] font-medium text-text-tertiary text-center py-1.5 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) =>
              day === null ? (
                <div key={`e-${i}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={clsx(
                    "w-9 h-9 rounded-xl text-[13px] font-medium transition-all duration-150 cursor-pointer",
                    (() => {
                      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      if (value === dateStr)
                        return "bg-accent-mint text-[#040404] glow-mint";
                      if (dateStr === todayStr)
                        return "bg-white/8 text-text-primary ring-1 ring-white/10";
                      return "hover:bg-white/5 text-text-secondary hover:text-text-primary";
                    })()
                  )}
                >
                  {day}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              onChange(todayStr);
              setOpen(false);
            }}
            className="w-full py-2 text-[12px] font-medium text-accent-mint hover:text-accent-mint/80 border-t border-border-subtle mt-3 pt-3 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}
