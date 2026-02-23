"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api, { type Booking, type PaginatedResponse, ApiError } from "../../lib/api";
import Button from "../../components/ui/button";
import Badge from "../../components/ui/badge";
import Spinner from "../../components/ui/spinner";
import Empty from "../../components/ui/empty";
import Select from "../../components/ui/select";
import { Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const statusOptions = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
];

const statusColors: Record<string, string> = { PENDING: "yellow", CONFIRMED: "mint", COMPLETED: "gray", CANCELLED: "red", REJECTED: "red" };

export default function BookingsPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<Booking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const fetchBookings = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await api.getMyBookings({ status: status || undefined, page: p, limit: 10 });
      setResult(data);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchBookings(1); }, [fetchBookings]);

  async function cancelBooking(id: string) {
    setActionLoading(id);
    try {
      await api.cancelBooking(id);
      await fetchBookings(page);
    } catch {
      // ignore
    } finally {
      setActionLoading("");
    }
  }

  function formatTime(dt: string) {
    return new Date(dt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-text-primary tracking-[-0.02em]">My bookings</h1>
        <p className="text-[13px] text-text-secondary mt-1">Rides you&apos;ve joined or requested</p>
      </div>

      <div className="mb-4 max-w-[200px]">
        <Select options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
      </div>

      {loading ? <Spinner /> : !result || result.items.length === 0 ? (
        <Empty title="No bookings yet" description="Search for rides and request a booking." />
      ) : (
        <>
          <div className="space-y-3">
            {result.items.map((booking) => (
              <div key={booking.id} className="glass rounded-[14px] p-4">
                <div className="flex items-start justify-between gap-4">
                  <Link href={`/dashboard/rides/${booking.ride.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
                      <span className="text-[14px] text-text-primary font-medium">{booking.ride.fromCity}</span>
                      <span className="text-[12px] text-text-tertiary">to</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                      <span className="text-[14px] text-text-primary font-medium">{booking.ride.toCity}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-text-tertiary" />
                        <span className="text-[12px] text-text-secondary">{formatTime(booking.ride.departureTime)}</span>
                      </div>
                      <span className="text-[12px] text-text-secondary">{booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""}</span>
                      <span className="text-[13px] text-accent-mint font-medium">&#8377;{booking.ride.pricePerSeat * booking.seatsBooked}</span>
                    </div>
                    <div className="text-[12px] text-text-tertiary mt-1">
                      Driver: {booking.ride.creator.firstName} {booking.ride.creator.lastName}
                    </div>
                  </Link>
                  <div className="flex flex-col items-end gap-2">
                    <Badge color={statusColors[booking.status]}>{booking.status}</Badge>
                    {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                      <Button variant="ghost" size="sm" loading={actionLoading === booking.id} onClick={() => cancelBooking(booking.id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {result.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button variant="ghost" size="sm" disabled={!result.pagination.hasPrev} onClick={() => fetchBookings(page - 1)}>
                <ChevronLeft size={14} /> Prev
              </Button>
              <span className="text-[12px] text-text-tertiary">Page {page} of {result.pagination.totalPages}</span>
              <Button variant="ghost" size="sm" disabled={!result.pagination.hasNext} onClick={() => fetchBookings(page + 1)}>
                Next <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
