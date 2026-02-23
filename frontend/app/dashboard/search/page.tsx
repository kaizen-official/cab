"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api, { type Ride, type PaginatedResponse } from "../../lib/api";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import DatePicker from "../../components/ui/date-picker";
import Dropdown from "../../components/ui/dropdown";
import Badge from "../../components/ui/badge";
import Spinner from "../../components/ui/spinner";
import Empty from "../../components/ui/empty";
import { MapPin, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";

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

function SearchContent() {
  const searchParams = useSearchParams();
  const [fromCity, setFromCity] = useState(searchParams.get("fromCity") || "");
  const [toCity, setToCity] = useState(searchParams.get("toCity") || "");
  const [date, setDate] = useState(searchParams.get("date") || "");
  const [sortBy, setSortBy] = useState("departure_asc");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<Ride> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFromCity(searchParams.get("fromCity") || "");
    setToCity(searchParams.get("toCity") || "");
    setDate(searchParams.get("date") || "");
  }, [searchParams]);

  const search = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await api.searchRides({
        fromCity: fromCity || undefined,
        toCity: toCity || undefined,
        date: date || undefined,
        sortBy,
        page: String(p),
        limit: "12",
      });
      setResult(data);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [fromCity, toCity, date, sortBy]);

  useEffect(() => {
    search(1);
  }, [search]);

  function formatTime(dt: string) {
    const d = new Date(dt);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + ", " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-text-primary tracking-[-0.02em]">Search rides</h1>
        <p className="text-[13px] text-text-secondary mt-1">Find students heading your way</p>
      </div>

      <div className="glass rounded-[14px] p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input placeholder="From city" value={fromCity} onChange={(e) => setFromCity(e.target.value)} />
          <Input placeholder="To city" value={toCity} onChange={(e) => setToCity(e.target.value)} />
          <DatePicker value={date} onChange={setDate} placeholder="Any date" />
          <Dropdown options={sortOptions} value={sortBy} onChange={setSortBy} placeholder="Sort by" />
        </div>
        <div className="flex justify-end mt-3">
          <Button onClick={() => search(1)} size="sm">Search</Button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : !result || result.items.length === 0 ? (
        <Empty title="No rides found" description="Try adjusting your search filters or check back later." />
      ) : (
        <>
          <p className="text-[12px] text-text-tertiary mb-4">{result.pagination.total} ride{result.pagination.total !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.items.map((ride) => (
              <Link key={ride.id} href={`/dashboard/rides/${ride.id}`} className="glass glass-hover rounded-[14px] p-5 block group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
                      <span className="text-[14px] text-text-primary font-medium">{ride.fromCity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                      <span className="text-[14px] text-text-primary font-medium">{ride.toCity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[18px] font-semibold text-accent-mint tracking-[-0.02em]">&#8377;{ride.pricePerSeat}</div>
                    <div className="text-[11px] text-text-tertiary">per seat</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-border-subtle flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-text-tertiary" />
                    <span className="text-[12px] text-text-secondary">{formatTime(ride.departureTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-text-tertiary" />
                    <span className="text-[12px] text-text-secondary">{ride.creator.firstName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-text-tertiary" />
                    <span className="text-[12px] text-text-secondary">{ride.creator.college || "No college"}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Badge color={statusColors[ride.status]}>{ride.status}</Badge>
                    <span className="text-[11px] text-text-tertiary">{ride.availableSeats} left</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {result.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button variant="ghost" size="sm" disabled={!result.pagination.hasPrev} onClick={() => search(page - 1)}>
                <ChevronLeft size={14} /> Prev
              </Button>
              <span className="text-[12px] text-text-tertiary">Page {page} of {result.pagination.totalPages}</span>
              <Button variant="ghost" size="sm" disabled={!result.pagination.hasNext} onClick={() => search(page + 1)}>
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
