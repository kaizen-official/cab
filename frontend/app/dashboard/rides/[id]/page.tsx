"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { type RideDetail, type Booking, ApiError } from "../../../lib/api";
import { useAuth } from "../../../context/auth";
import Button from "../../../components/ui/button";
import Badge from "../../../components/ui/badge";
import Spinner from "../../../components/ui/spinner";
import Input from "../../../components/ui/input";
import Textarea from "../../../components/ui/textarea";
import { MapPin, Clock, Car, Users, MessageSquare, IndianRupee } from "lucide-react";

const statusColors: Record<string, string> = { ACTIVE: "mint", FULL: "yellow", DEPARTED: "cyan", COMPLETED: "gray", CANCELLED: "red", PENDING: "yellow", CONFIRMED: "mint", REJECTED: "red" };

export default function RideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [ride, setRide] = useState<RideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [bookingSeats, setBookingSeats] = useState("1");
  const [bookingMessage, setBookingMessage] = useState("");
  const [error, setError] = useState("");

  const fetchRide = useCallback(async () => {
    try {
      const data = await api.getRide(id);
      setRide(data);
    } catch {
      router.push("/dashboard/search");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { fetchRide(); }, [fetchRide]);

  if (loading || !ride) return <Spinner />;

  const isOwner = user?.id === ride.creator.id;
  const myBooking = ride.bookings.find((b) => b.passenger.id === user?.id);
  const hasActiveBooking = myBooking && (myBooking.status === "PENDING" || myBooking.status === "CONFIRMED");

  function formatTime(dt: string) {
    return new Date(dt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  async function handleAction(action: string, actionId?: string) {
    if (!ride) return;
    setActionLoading(action);
    setError("");
    try {
      switch (action) {
        case "book":
          await api.requestBooking({ rideId: ride.id, seatsBooked: parseInt(bookingSeats, 10), message: bookingMessage || undefined });
          break;
        case "cancel-ride":
          await api.cancelRide(ride.id);
          break;
        case "depart":
          await api.departRide(ride.id);
          break;
        case "complete":
          await api.completeRide(ride.id);
          break;
        case "confirm":
          await api.confirmBooking(actionId!);
          break;
        case "reject":
          await api.rejectBooking(actionId!);
          break;
        case "cancel-booking":
          await api.cancelBooking(actionId!);
          break;
      }
      await fetchRide();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setActionLoading("");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-[12px] text-text-tertiary hover:text-text-secondary transition-colors mb-3 cursor-pointer">
          Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-semibold text-text-primary tracking-[-0.02em]">
              {ride.fromCity} to {ride.toCity}
            </h1>
            <p className="text-[13px] text-text-secondary mt-1">{formatTime(ride.departureTime)}</p>
          </div>
          <Badge color={statusColors[ride.status]}>{ride.status}</Badge>
        </div>
      </div>

      {error && (
        <div className="px-3.5 py-2.5 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-[10px] mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-[14px] p-5">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-accent-mint mt-0.5 shrink-0" />
                <div>
                  <div className="text-[14px] text-text-primary font-medium">{ride.fromCity}</div>
                  <div className="text-[12px] text-text-secondary">{ride.fromAddress}</div>
                </div>
              </div>
              <div className="ml-2 border-l border-border-subtle h-4" />
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-accent-cyan mt-0.5 shrink-0" />
                <div>
                  <div className="text-[14px] text-text-primary font-medium">{ride.toCity}</div>
                  <div className="text-[12px] text-text-secondary">{ride.toAddress}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border-subtle">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-text-tertiary" />
                <div>
                  <div className="text-[12px] text-text-tertiary">Departure</div>
                  <div className="text-[13px] text-text-primary">{formatTime(ride.departureTime)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-text-tertiary" />
                <div>
                  <div className="text-[12px] text-text-tertiary">Seats</div>
                  <div className="text-[13px] text-text-primary">{ride.availableSeats}/{ride.totalSeats}</div>
                </div>
              </div>
              {ride.vehicle && (
                <div className="flex items-center gap-2">
                  <Car size={14} className="text-text-tertiary" />
                  <div>
                    <div className="text-[12px] text-text-tertiary">Vehicle</div>
                    <div className="text-[13px] text-text-primary">{ride.vehicle}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <IndianRupee size={14} className="text-text-tertiary" />
                <div>
                  <div className="text-[12px] text-text-tertiary">Price</div>
                  <div className="text-[13px] text-accent-mint font-semibold">&#8377;{ride.pricePerSeat}/seat</div>
                </div>
              </div>
            </div>

            {ride.notes && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MessageSquare size={12} className="text-text-tertiary" />
                  <span className="text-[12px] text-text-tertiary">Notes</span>
                </div>
                <p className="text-[13px] text-text-secondary">{ride.notes}</p>
              </div>
            )}
          </div>

          {ride.bookings.length > 0 && (
            <div className="glass rounded-[14px] p-5">
              <h3 className="text-[14px] font-medium text-text-primary mb-3">Passengers</h3>
              <div className="space-y-2">
                {ride.bookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2 px-3 rounded-[10px] bg-white/2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center text-[12px] text-text-secondary font-medium">
                        {b.passenger.firstName[0]}{b.passenger.lastName[0]}
                      </div>
                      <div>
                        <div className="text-[13px] text-text-primary">{b.passenger.firstName} {b.passenger.lastName}</div>
                        <div className="text-[11px] text-text-tertiary">{b.seatsBooked} seat{b.seatsBooked > 1 ? "s" : ""} {b.passenger.college && `-- ${b.passenger.college}`}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color={statusColors[b.status]}>{b.status}</Badge>
                      {isOwner && b.status === "PENDING" && (
                        <div className="flex gap-1.5">
                          <Button size="sm" loading={actionLoading === "confirm"} onClick={() => handleAction("confirm", b.id)}>Accept</Button>
                          <Button size="sm" variant="ghost" loading={actionLoading === "reject"} onClick={() => handleAction("reject", b.id)}>Reject</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-[14px] p-5">
            <h3 className="text-[14px] font-medium text-text-primary mb-3">Driver</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center text-[14px] text-text-secondary font-medium">
                {ride.creator.firstName[0]}{ride.creator.lastName[0]}
              </div>
              <div>
                <div className="text-[14px] text-text-primary font-medium">{ride.creator.firstName} {ride.creator.lastName}</div>
                <div className="text-[12px] text-text-tertiary">{ride.creator.college || "No college"}</div>
              </div>
            </div>
          </div>

          {isOwner ? (
            <div className="glass rounded-[14px] p-5 space-y-2">
              <h3 className="text-[14px] font-medium text-text-primary mb-3">Manage ride</h3>
              {ride.status === "ACTIVE" && (
                <>
                  <Button variant="secondary" size="sm" className="w-full" loading={actionLoading === "depart"} onClick={() => handleAction("depart")}>Mark as departed</Button>
                  <Button variant="danger" size="sm" className="w-full" loading={actionLoading === "cancel-ride"} onClick={() => handleAction("cancel-ride")}>Cancel ride</Button>
                </>
              )}
              {ride.status === "FULL" && (
                <Button variant="secondary" size="sm" className="w-full" loading={actionLoading === "depart"} onClick={() => handleAction("depart")}>Mark as departed</Button>
              )}
              {ride.status === "DEPARTED" && (
                <Button size="sm" className="w-full" loading={actionLoading === "complete"} onClick={() => handleAction("complete")}>Mark as completed</Button>
              )}
              {(ride.status === "COMPLETED" || ride.status === "CANCELLED") && (
                <p className="text-[13px] text-text-tertiary">This ride is {ride.status.toLowerCase()}.</p>
              )}
            </div>
          ) : ride.status === "ACTIVE" && !hasActiveBooking ? (
            <div className="glass rounded-[14px] p-5">
              <h3 className="text-[14px] font-medium text-text-primary mb-3">Book this ride</h3>
              <div className="space-y-3">
                <Input label="Seats" type="number" min="1" max={String(ride.availableSeats)} value={bookingSeats} onChange={(e) => setBookingSeats(e.target.value)} />
                <Textarea label="Message (optional)" placeholder="Hi, I'd like to join..." value={bookingMessage} onChange={(e) => setBookingMessage(e.target.value)} rows={2} />
                <div className="text-[13px] text-text-secondary">
                  Total: <span className="text-accent-mint font-semibold">&#8377;{ride.pricePerSeat * parseInt(bookingSeats || "1", 10)}</span>
                </div>
                <Button size="md" className="w-full" loading={actionLoading === "book"} onClick={() => handleAction("book")}>Request booking</Button>
              </div>
            </div>
          ) : hasActiveBooking ? (
            <div className="glass rounded-[14px] p-5">
              <h3 className="text-[14px] font-medium text-text-primary mb-3">Your booking</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-text-secondary">{myBooking!.seatsBooked} seat{myBooking!.seatsBooked > 1 ? "s" : ""}</span>
                <Badge color={statusColors[myBooking!.status]}>{myBooking!.status}</Badge>
              </div>
              {(myBooking!.status === "PENDING" || myBooking!.status === "CONFIRMED") && (
                <Button variant="danger" size="sm" className="w-full" loading={actionLoading === "cancel-booking"} onClick={() => handleAction("cancel-booking", myBooking!.id)}>
                  Cancel booking
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
