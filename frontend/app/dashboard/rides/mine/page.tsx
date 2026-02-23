"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api, { type Ride, type PaginatedResponse } from "../../../lib/api";
import Button from "../../../components/ui/button";
import Badge from "../../../components/ui/badge";
import Spinner from "../../../components/ui/spinner";
import Empty from "../../../components/ui/empty";
import Select from "../../../components/ui/select";
import { Clock, Users, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "FULL", label: "Full" },
  { value: "DEPARTED", label: "Departed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const statusColors: Record<string, string> = { ACTIVE: "mint", FULL: "yellow", DEPARTED: "cyan", COMPLETED: "gray", CANCELLED: "red" };

export default function MyRidesPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<Ride> | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await api.getMyRides({ status: status || undefined, page: p, limit: 10 });
      setResult(data);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetch(1); }, [fetch]);

  function formatTime(dt: string) {
    return new Date(dt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold text-text-primary tracking-[-0.02em]">My rides</h1>
          <p className="text-[13px] text-text-secondary mt-1">Rides you&apos;ve created</p>
        </div>
        <Link href="/dashboard/rides/new">
          <Button size="sm"><Plus size={14} /> New ride</Button>
        </Link>
      </div>

      <div className="mb-4 max-w-[200px]">
        <Select options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
      </div>

      {loading ? <Spinner /> : !result || result.items.length === 0 ? (
        <Empty title="No rides yet" description="Create your first ride to start sharing." />
      ) : (
        <>
          <div className="space-y-3">
            {result.items.map((ride) => (
              <Link key={ride.id} href={`/dashboard/rides/${ride.id}`} className="glass glass-hover rounded-[14px] p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-text-primary font-medium truncate">{ride.fromCity} to {ride.toCity}</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-text-tertiary" />
                      <span className="text-[12px] text-text-secondary">{formatTime(ride.departureTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-text-tertiary" />
                      <span className="text-[12px] text-text-secondary">{ride.availableSeats}/{ride.totalSeats} seats</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-semibold text-accent-mint">&#8377;{ride.pricePerSeat}</span>
                  <Badge color={statusColors[ride.status]}>{ride.status}</Badge>
                </div>
              </Link>
            ))}
          </div>

          {result.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button variant="ghost" size="sm" disabled={!result.pagination.hasPrev} onClick={() => fetch(page - 1)}>
                <ChevronLeft size={14} /> Prev
              </Button>
              <span className="text-[12px] text-text-tertiary">Page {page} of {result.pagination.totalPages}</span>
              <Button variant="ghost" size="sm" disabled={!result.pagination.hasNext} onClick={() => fetch(page + 1)}>
                Next <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
