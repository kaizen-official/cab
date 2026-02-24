"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Users, ArrowRight, Navigation } from "lucide-react";
import { useAuth } from "../context/auth";
import DatePicker from "./ui/date-picker";
import Stepper from "./ui/stepper";

export default function SearchBar() {
  const router = useRouter();
  const { user } = useAuth();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from.trim()) params.set("fromCity", from.trim());
    if (to.trim()) params.set("toCity", to.trim());
    if (date) params.set("date", date);
    const query = params.toString();
    const target = `/dashboard/search${query ? `?${query}` : ""}`;
    if (user) {
      router.push(target);
    } else {
      router.push(`/auth/login?next=${encodeURIComponent(target)}`);
    }
  }

  return (
    <form id="search" onSubmit={handleSubmit} className="w-full max-w-7xl mx-auto">
      <div className="glass-strong rounded-2xl p-2">
        <div className="flex flex-col md:flex-row items-stretch gap-0">
          <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/3 transition-colors group">
            <Navigation
              size={16}
              className="text-text-tertiary group-hover:text-accent-mint transition-colors shrink-0"
            />
            <input
              type="text"
              placeholder="Leaving from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-transparent text-[14px] text-text-primary w-full font-medium placeholder:font-normal"
            />
          </div>

          <div className="hidden md:block w-px bg-border-subtle self-stretch my-2.5" />
          <div className="md:hidden h-px bg-border-subtle mx-4" />

          <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/3 transition-colors group">
            <MapPin
              size={16}
              className="text-text-tertiary group-hover:text-accent-cyan transition-colors shrink-0"
            />
            <input
              type="text"
              placeholder="Going to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-transparent text-[14px] text-text-primary w-full font-medium placeholder:font-normal"
            />
          </div>

          <div className="hidden md:block w-px bg-border-subtle self-stretch my-2.5" />
          <div className="md:hidden h-px bg-border-subtle mx-4" />

          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/3 transition-colors group">
            <DatePicker value={date} onChange={setDate} placeholder="Pick date" />
          </div>

          <div className="hidden md:block w-px bg-border-subtle self-stretch my-2.5" />
          <div className="md:hidden h-px bg-border-subtle mx-4" />

          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-white/3 transition-colors group">
            <Users
              size={16}
              className="text-text-tertiary group-hover:text-text-secondary transition-colors shrink-0"
            />
            <Stepper value={seats} onChange={setSeats} min={1} max={10} />
          </div>

          <div className="p-1.5">
            <button
              type="submit"
              className="w-full md:w-auto h-full px-5 py-3.5 md:py-0 bg-accent-mint text-[#040404] rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 text-[14px] font-bold cursor-pointer glow-mint active:scale-[0.97]"
            >
              <span className="md:hidden">Search rides</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
