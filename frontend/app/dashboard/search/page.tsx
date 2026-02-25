"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import api, { type Ride, type PaginatedResponse } from "../../lib/api";
import { useAuth } from "../../context/auth";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import DatePicker from "../../components/ui/date-picker";
import Dropdown from "../../components/ui/dropdown";
import Badge from "../../components/ui/badge";
import Spinner from "../../components/ui/spinner";
import Empty from "../../components/ui/empty";
import {
  MapPin,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Navigation,
  SlidersHorizontal,
  Sparkles,
  GraduationCap,
  Users,
} from "lucide-react";

const sortOptions = [
  { value: "departure_asc", label: "Departure (soonest)" },
  { value: "departure_desc", label: "Departure (latest)" },
  { value: "price_asc", label: "Price (low to high)" },
  { value: "price_desc", label: "Price (high to low)" },
  { value: "newest", label: "Newest first" },
];

const statusColors: Record<string, string> = {
  ACTIVE: "mint",
  FULL: "yellow",
  DEPARTED: "cyan",
  COMPLETED: "gray",
  CANCELLED: "red",
};

const urgencyColors: Record<string, string> = {
  Open: "mint",
  "Almost Full": "yellow",
  Full: "red",
};

function SearchContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [fromCity, setFromCity] = useState(searchParams.get("fromCity") || "");
  const [toCity, setToCity] = useState(searchParams.get("toCity") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [sortBy, setSortBy] = useState("departure_asc");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<Ride> | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [suggestions, setSuggestions] = useState<Ride[]>([]);
  const [universityOnly, setUniversityOnly] = useState(false);

  useEffect(() => {
    setFromCity(searchParams.get("fromCity") || "");
    setToCity(searchParams.get("toCity") || "");
    setDate(searchParams.get("date") || "");
  }, [searchParams]);

  useEffect(() => {
    api.getSuggestions({}).then(setSuggestions).catch(() => {});
  }, []);

  const search = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const data = await api.searchRides({
          fromCity: fromCity || undefined,
          toCity: toCity || undefined,
          date: date || undefined,
          sortBy,
          page: String(p),
          limit: "12",
          college: universityOnly && user?.college ? user.college : undefined,
        });
        setResult(data);
        setPage(p);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [fromCity, toCity, date, sortBy, universityOnly, user?.college]
  );

  useEffect(() => {
    search(1);
  }, [search]);

  function formatTime(dt: string) {
    const d = new Date(dt);
    return (
      d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
      ", " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-black text-text-primary tracking-[-0.03em]">
          Search rides
        </h1>
        <p className="text-[13px] text-text-secondary mt-1">
          Find students heading your way
        </p>
      </div>

      {suggestions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-accent-mint" />
            <span className="text-[12px] font-bold text-text-tertiary uppercase tracking-wider">
              Suggested for you
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {suggestions.map((ride) => (
              <Link
                key={ride.id}
                href={`/dashboard/rides/${ride.id}`}
                className="glass glass-hover rounded-2xl p-4 min-w-[260px] shrink-0 block"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
                  <span className="text-[13px] text-text-primary font-semibold truncate">
                    {ride.fromCity}
                  </span>
                  <span className="text-text-tertiary text-[11px]">to</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                  <span className="text-[13px] text-text-primary font-semibold truncate">
                    {ride.toCity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={11} className="text-text-tertiary" />
                    <span className="text-[11px] text-text-secondary">
                      {formatTime(ride.departureTime)}
                    </span>
                  </div>
                  <span className="text-[16px] font-black text-accent-mint">
                    &#8377;{ride.pricePerSeat}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {ride.urgencyLabel && (
                    <Badge color={urgencyColors[ride.urgencyLabel] || "gray"}>
                      {ride.urgencyLabel}
                    </Badge>
                  )}
                  <span className="text-[10px] text-text-tertiary font-semibold">
                    {ride.availableSeats} seat{ride.availableSeats !== 1 ? "s" : ""} left
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="glass-strong rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-bold text-text-tertiary uppercase tracking-wider">
            Filters
          </span>
          <div className="flex items-center gap-2">
            {user?.college && (
              <button
                onClick={() => setUniversityOnly(!universityOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer border ${
                  universityOnly
                    ? "bg-accent-cyan/15 border-accent-cyan/30 text-accent-cyan"
                    : "bg-transparent border-border-subtle text-text-tertiary hover:border-text-tertiary"
                }`}
              >
                <GraduationCap size={12} />
                My University
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              title="Toggle filters"
              className="p-1.5 rounded-lg hover:bg-white/5 text-text-tertiary cursor-pointer md:hidden"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
        <div className={`${showFilters ? "block" : "hidden md:block"}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              placeholder="From city"
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              icon={<Navigation size={14} />}
            />
            <Input
              placeholder="To city"
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              icon={<MapPin size={14} />}
            />
            <DatePicker value={date} onChange={setDate} placeholder="Any date" />
            <Dropdown
              options={sortOptions}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort by"
            />
          </div>
          <div className="flex justify-end mt-3">
            <Button onClick={() => search(1)} size="sm">
              Search
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : !result || result.items.length === 0 ? (
        <Empty
          title="No rides found"
          description="Try adjusting your search filters or check back later."
        />
      ) : (
        <>
          <p className="text-[12px] text-text-tertiary mb-4 font-medium">
            {result.pagination.total} ride
            {result.pagination.total !== 1 ? "s" : ""} found
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.items.map((ride, i) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  href={`/dashboard/rides/${ride.id}`}
                  className="glass glass-hover rounded-2xl p-5 block group transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(173,255,166,0.04)]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {ride.creator.avatarUrl ? (
                        <Image
                          src={ride.creator.avatarUrl}
                          alt=""
                          width={36}
                          height={36}
                          className="rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-bg-surface flex items-center justify-center text-[11px] text-text-secondary font-bold shrink-0">
                          {ride.creator.firstName[0]}{ride.creator.lastName?.[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <div className="w-2 h-2 rounded-full bg-accent-mint" />
                          <span className="text-[14px] text-text-primary font-semibold">
                            {ride.fromCity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                          <span className="text-[14px] text-text-primary font-semibold">
                            {ride.toCity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[22px] font-black text-accent-mint tracking-[-0.02em]">
                        &#8377;{ride.pricePerSeat}
                      </div>
                      <div className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider">
                        per seat
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-border-subtle flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-text-tertiary" />
                      <span className="text-[12px] text-text-secondary font-medium">
                        {formatTime(ride.departureTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-text-tertiary" />
                      <span className="text-[12px] text-text-secondary font-medium">
                        {ride.creator.firstName}
                      </span>
                    </div>
                    {ride.creator.college && (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap size={12} className="text-text-tertiary" />
                        <span className="text-[12px] text-text-secondary font-medium">
                          {ride.creator.college}
                        </span>
                      </div>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      {ride.urgencyLabel && (
                        <Badge color={urgencyColors[ride.urgencyLabel] || "gray"}>
                          {ride.urgencyLabel}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <Users size={11} className="text-text-tertiary" />
                        <span className="text-[11px] text-text-tertiary font-semibold">
                          {ride.availableSeats}/{ride.totalSeats}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {result.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button
                variant="ghost"
                size="sm"
                disabled={!result.pagination.hasPrev}
                onClick={() => search(page - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </Button>
              <span className="text-[12px] text-text-tertiary font-medium">
                Page {page} of {result.pagination.totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={!result.pagination.hasNext}
                onClick={() => search(page + 1)}
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-12" />}>
      <SearchContent />
    </Suspense>
  );
}
