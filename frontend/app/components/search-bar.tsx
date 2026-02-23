"use client";

import { useState } from "react";
import { MapPin, Calendar, Users, ArrowRight } from "lucide-react";

export default function SearchBar() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div id="search" className="w-full max-w-[560px] mx-auto">
      <div className="glass rounded-[16px] p-1.5">
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-[12px] hover:bg-white/3 transition-colors group">
            <MapPin
              size={16}
              className="text-text-tertiary group-hover:text-accent-mint transition-colors shrink-0"
            />
            <input
              type="text"
              placeholder="Leaving from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-transparent text-[14px] text-text-primary w-full"
            />
          </div>

          <div className="hidden md:block w-px bg-border-subtle self-stretch my-2" />
          <div className="md:hidden h-px bg-border-subtle mx-4" />

          <div className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-[12px] hover:bg-white/3 transition-colors group">
            <MapPin
              size={16}
              className="text-text-tertiary group-hover:text-accent-cyan transition-colors shrink-0"
            />
            <input
              type="text"
              placeholder="Going to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-transparent text-[14px] text-text-primary w-full"
            />
          </div>

          <div className="hidden md:block w-px bg-border-subtle self-stretch my-2" />
          <div className="md:hidden h-px bg-border-subtle mx-4" />

          <div className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] hover:bg-white/3 transition-colors group cursor-pointer">
            <Calendar
              size={16}
              className="text-text-tertiary group-hover:text-text-secondary transition-colors shrink-0"
            />
            <span className="text-[14px] text-text-tertiary">Today</span>
          </div>

          <div className="hidden md:block w-px bg-border-subtle self-stretch my-2" />
          <div className="md:hidden h-px bg-border-subtle mx-4" />

          <div className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] hover:bg-white/3 transition-colors group cursor-pointer">
            <Users
              size={16}
              className="text-text-tertiary group-hover:text-text-secondary transition-colors shrink-0"
            />
            <span className="text-[14px] text-text-tertiary">1</span>
          </div>

          <div className="p-1">
            <button className="w-full md:w-auto h-full px-4 py-3 md:py-0 bg-accent-mint text-[#040404] rounded-[12px] hover:bg-accent-mint/90 transition-colors flex items-center justify-center gap-2 text-[14px] font-medium">
              <span className="md:hidden">Search</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
