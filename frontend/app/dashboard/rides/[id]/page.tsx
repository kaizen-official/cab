"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api, { type RideDetail, ApiError } from "../../../lib/api";
import { useAuth } from "../../../context/auth";
import Button from "../../../components/ui/button";
import Badge from "../../../components/ui/badge";
import Spinner from "../../../components/ui/spinner";
import Input from "../../../components/ui/input";
import Textarea from "../../../components/ui/textarea";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Car,
  Users,
  MessageSquare,
  IndianRupee,
  ArrowLeft,
  Navigation,
  Phone,
} from "lucide-react";

const statusColors: Record<string, string> = {
  ACTIVE: "mint",
  FULL: "yellow",
  DEPARTED: "cyan",
  COMPLETED: "gray",
  CANCELLED: "red",
  PENDING: "yellow",
  CONFIRMED: "mint",
  REJECTED: "red",
};

const urgencyColors: Record<string, string> = {
  Open: "mint",
  "Almost Full": "yellow",
  Full: "red",
};

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

  useEffect(() => {
    fetchRide();
  }, [fetchRide]);

  if (loading || !ride) return <Spinner />;

  const isOwner = user?.id === ride.creator.id;
  const myBooking = ride.bookings.find((b) => b.passenger.id === user?.id);
  const hasActiveBooking =
    myBooking &&
    (myBooking.status === "PENDING" || myBooking.status === "CONFIRMED");

  function formatTime(dt: string) {
    return new Date(dt).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleAction(action: string, actionId?: string) {
    if (!ride) return;
    setActionLoading(action);
    setError("");
    try {
      switch (action) {
        case "book":
          await api.requestBooking({
            rideId: ride.id,
            seatsBooked: parseInt(bookingSeats, 10),
            message: bookingMessage || undefined,
          });
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors mb-4 cursor-pointer font-medium"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-black text-text-primary tracking-[-0.03em]">
              {ride.fromCity} to {ride.toCity}
            </h1>
            <p className="text-[13px] text-text-secondary mt-1 font-medium">
              {formatTime(ride.departureTime)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ride.urgencyLabel && (
              <Badge color={urgencyColors[ride.urgencyLabel] || "gray"}>
                {ride.urgencyLabel}
              </Badge>
            )}
            <Badge color={statusColors[ride.status]}>{ride.status}</Badge>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-mint/10 flex items-center justify-center shrink-0">
                  <Navigation size={14} className="text-accent-mint" />
                </div>
                <div>
                  <div className="text-[14px] text-text-primary font-bold">
                    {ride.fromCity}
                  </div>
                  <div className="text-[12px] text-text-secondary">
                    {ride.fromAddress}
                  </div>
                </div>
              </div>
              <div className="ml-4 border-l-2 border-dashed border-border-subtle h-6" />
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-accent-cyan" />
                </div>
                <div>
                  <div className="text-[14px] text-text-primary font-bold">
                    {ride.toCity}
                  </div>
                  <div className="text-[12px] text-text-secondary">
                    {ride.toAddress}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-text-tertiary" />
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
                    Departure
                  </div>
                  <div className="text-[13px] text-text-primary font-semibold mt-0.5">
                    {formatTime(ride.departureTime)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center shrink-0">
                  <Users size={14} className="text-text-tertiary" />
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
                    Seats
                  </div>
                  <div className="text-[13px] text-text-primary font-semibold mt-0.5">
                    {ride.availableSeats}/{ride.totalSeats}
                  </div>
                </div>
              </div>
              {ride.vehicle && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center shrink-0">
                    <Car size={14} className="text-text-tertiary" />
                  </div>
                  <div>
                    <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
                      Vehicle
                    </div>
                    <div className="text-[13px] text-text-primary font-semibold mt-0.5">
                      {ride.vehicle}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-mint/10 flex items-center justify-center shrink-0">
                  <IndianRupee size={14} className="text-accent-mint" />
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
                    Price
                  </div>
                  <div className="text-[13px] text-accent-mint font-black mt-0.5">
                    &#8377;{ride.pricePerSeat}/seat
                  </div>
                </div>
              </div>
            </div>

            {typeof ride.confirmedCount === "number" && (
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-text-tertiary" />
                  <span className="text-[12px] text-text-secondary font-medium">
                    {ride.confirmedCount} confirmed
                  </span>
                </div>
                {ride.confirmedCount > 0 && (
                  <span className="text-[12px] text-text-secondary">
                    Fare split:{" "}
                    <span className="text-accent-mint font-bold">
                      &#8377;{Math.round(ride.pricePerSeat * ride.totalSeats / (ride.confirmedCount + 1))}/person
                    </span>
                  </span>
                )}
              </div>
            )}

            {ride.notes && (
              <div className="mt-5 pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare size={12} className="text-text-tertiary" />
                  <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
                    Notes
                  </span>
                </div>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  {ride.notes}
                </p>
              </div>
            )}
          </div>

          {ride.bookings.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-[14px] font-bold text-text-primary mb-4">
                Passengers
              </h3>
              <div className="space-y-2">
                {ride.bookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/2 border border-border-subtle"
                  >
                    <div className="flex items-center gap-3">
                      {b.passenger.avatarUrl ? (
                        <Image src={b.passenger.avatarUrl} alt="" width={36} height={36} className="rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-bg-surface flex items-center justify-center text-[12px] text-text-secondary font-bold">
                          {b.passenger.firstName[0]}{b.passenger.lastName[0]}
                        </div>
                      )}
                      <div>
                        <div className="text-[13px] text-text-primary font-semibold">
                          {b.passenger.firstName} {b.passenger.lastName}
                        </div>
                        <div className="text-[11px] text-text-tertiary">
                          {b.seatsBooked} seat{b.seatsBooked > 1 ? "s" : ""}
                          {b.passenger.college && ` -- ${b.passenger.college}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge color={statusColors[b.status]}>{b.status}</Badge>
                      {isOwner && b.status === "PENDING" && (
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            loading={actionLoading === "confirm"}
                            onClick={() => handleAction("confirm", b.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            loading={actionLoading === "reject"}
                            onClick={() => handleAction("reject", b.id)}
                          >
                            Reject
                          </Button>
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
          <div className="glass rounded-2xl p-5">
            <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-4">
              Driver
            </h3>
            <div className="flex items-center gap-3">
              {ride.creator.avatarUrl ? (
                <Image src={ride.creator.avatarUrl} alt="" width={44} height={44} className="rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-bg-surface flex items-center justify-center text-[14px] text-text-secondary font-bold">
                  {ride.creator.firstName[0]}{ride.creator.lastName[0]}
                </div>
              )}
              <div>
                <div className="text-[14px] text-text-primary font-bold">
                  {ride.creator.firstName} {ride.creator.lastName}
                </div>
                <div className="text-[12px] text-text-tertiary">
                  {ride.creator.college || "No college"}
                </div>
              </div>
            </div>

            {ride.creator.whatsappNumber && myBooking?.status === "CONFIRMED" && (
              <a
                href={`https://wa.me/${ride.creator.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I want to join your cab for ${ride.toCity} at ${formatTime(ride.departureTime)}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-[13px] font-semibold hover:bg-[#25D366]/25 transition-colors"
              >
                <Phone size={14} />
                Chat on WhatsApp
              </a>
            )}
          </div>

          {isOwner ? (
            <div className="glass rounded-2xl p-5 space-y-2.5">
              <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-3">
                Manage ride
              </h3>
              {ride.status === "ACTIVE" && (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    loading={actionLoading === "depart"}
                    onClick={() => handleAction("depart")}
                  >
                    Mark as departed
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    className="w-full"
                    loading={actionLoading === "cancel-ride"}
                    onClick={() => handleAction("cancel-ride")}
                  >
                    Cancel ride
                  </Button>
                </>
              )}
              {ride.status === "FULL" && (
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  loading={actionLoading === "depart"}
                  onClick={() => handleAction("depart")}
                >
                  Mark as departed
                </Button>
              )}
              {ride.status === "DEPARTED" && (
                <Button
                  size="md"
                  className="w-full"
                  loading={actionLoading === "complete"}
                  onClick={() => handleAction("complete")}
                >
                  Mark as completed
                </Button>
              )}
              {(ride.status === "COMPLETED" || ride.status === "CANCELLED") && (
                <p className="text-[13px] text-text-tertiary">
                  This ride is {ride.status.toLowerCase()}.
                </p>
              )}
            </div>
          ) : ride.status === "ACTIVE" && !hasActiveBooking ? (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-4">
                Book this ride
              </h3>
              <div className="space-y-3">
                <Input
                  label="Seats"
                  type="number"
                  min="1"
                  max={String(ride.availableSeats)}
                  value={bookingSeats}
                  onChange={(e) => setBookingSeats(e.target.value)}
                />
                <Textarea
                  label="Message (optional)"
                  placeholder="Hi, I'd like to join..."
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  rows={2}
                />
                <div className="text-[13px] text-text-secondary">
                  Total:{" "}
                  <span className="text-accent-mint font-black text-[16px]">
                    &#8377;
                    {ride.pricePerSeat * parseInt(bookingSeats || "1", 10)}
                  </span>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  loading={actionLoading === "book"}
                  onClick={() => handleAction("book")}
                >
                  Request booking
                </Button>
              </div>
            </div>
          ) : hasActiveBooking ? (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest mb-4">
                Your booking
              </h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-text-secondary font-medium">
                  {myBooking!.seatsBooked} seat
                  {myBooking!.seatsBooked > 1 ? "s" : ""}
                </span>
                <Badge color={statusColors[myBooking!.status]}>
                  {myBooking!.status}
                </Badge>
              </div>
              {(myBooking!.status === "PENDING" ||
                myBooking!.status === "CONFIRMED") && (
                <Button
                  variant="danger"
                  size="md"
                  className="w-full"
                  loading={actionLoading === "cancel-booking"}
                  onClick={() =>
                    handleAction("cancel-booking", myBooking!.id)
                  }
                >
                  Cancel booking
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
