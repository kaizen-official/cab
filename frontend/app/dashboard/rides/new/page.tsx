"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api, { ApiError } from "../../../lib/api";
import Input from "../../../components/ui/input";
import Textarea from "../../../components/ui/textarea";
import Button from "../../../components/ui/button";
import { MapPin, Navigation, Clock, Users, IndianRupee, Car, StickyNote } from "lucide-react";

export default function CreateRidePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fromCity: "",
    fromAddress: "",
    toCity: "",
    toAddress: "",
    departureTime: "",
    totalSeats: "3",
    pricePerSeat: "",
    vehicle: "",
    vehicleNumber: "",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const ride = await api.createRide({
        fromCity: form.fromCity,
        fromAddress: form.fromAddress,
        toCity: form.toCity,
        toAddress: form.toAddress,
        departureTime: new Date(form.departureTime).toISOString(),
        totalSeats: parseInt(form.totalSeats, 10),
        pricePerSeat: parseInt(form.pricePerSeat, 10),
        vehicle: form.vehicle || undefined,
        vehicleNumber: form.vehicleNumber || undefined,
        notes: form.notes || undefined,
      });
      router.push(`/dashboard/rides/${ride.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-black text-text-primary tracking-[-0.03em]">
          Offer a ride
        </h1>
        <p className="text-[13px] text-text-secondary mt-1">
          Share your trip and split the cost
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleSubmit}
        className="max-w-[540px]"
      >
        {error && (
          <div className="px-4 py-3 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Navigation size={14} className="text-accent-mint" />
              <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
                Route
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="From city"
                placeholder="Delhi"
                value={form.fromCity}
                onChange={(e) => update("fromCity", e.target.value)}
                required
              />
              <Input
                label="To city"
                placeholder="Jaipur"
                value={form.toCity}
                onChange={(e) => update("toCity", e.target.value)}
                required
              />
            </div>
            <Input
              label="Pickup address"
              placeholder="IIT Delhi Main Gate"
              value={form.fromAddress}
              onChange={(e) => update("fromAddress", e.target.value)}
              required
            />
            <Input
              label="Drop address"
              placeholder="Jaipur Railway Station"
              value={form.toAddress}
              onChange={(e) => update("toAddress", e.target.value)}
              required
            />
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-accent-cyan" />
              <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
                Details
              </span>
            </div>
            <Input
              label="Departure time"
              type="datetime-local"
              value={form.departureTime}
              onChange={(e) => update("departureTime", e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Available seats"
                type="number"
                min="1"
                max="10"
                value={form.totalSeats}
                onChange={(e) => update("totalSeats", e.target.value)}
                required
              />
              <Input
                label="Price per seat"
                type="number"
                min="1"
                placeholder="150"
                value={form.pricePerSeat}
                onChange={(e) => update("pricePerSeat", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Car size={14} className="text-text-tertiary" />
              <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
                Optional
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Vehicle"
                placeholder="Swift Dzire"
                value={form.vehicle}
                onChange={(e) => update("vehicle", e.target.value)}
              />
              <Input
                label="Vehicle number"
                placeholder="DL 01 AB 1234"
                value={form.vehicleNumber}
                onChange={(e) => update("vehicleNumber", e.target.value)}
              />
            </div>
            <Textarea
              label="Notes"
              placeholder="AC cab, luggage space available..."
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          size="lg"
          className="w-full mt-6"
        >
          Publish ride
        </Button>
      </motion.form>
    </div>
  );
}
