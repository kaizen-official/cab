"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { ApiError } from "../../../lib/api";
import Input from "../../../components/ui/input";
import Textarea from "../../../components/ui/textarea";
import Button from "../../../components/ui/button";

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
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-text-primary tracking-[-0.02em]">Offer a ride</h1>
        <p className="text-[13px] text-text-secondary mt-1">Share your trip and split the cost</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-[520px]">
        {error && (
          <div className="px-3.5 py-2.5 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-[10px] mb-4">{error}</div>
        )}

        <div className="space-y-5">
          <fieldset className="glass rounded-[14px] p-5 space-y-3">
            <legend className="text-[12px] text-text-tertiary uppercase tracking-wide px-1">Route</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="From city" placeholder="Delhi" value={form.fromCity} onChange={(e) => update("fromCity", e.target.value)} required />
              <Input label="To city" placeholder="Jaipur" value={form.toCity} onChange={(e) => update("toCity", e.target.value)} required />
            </div>
            <Input label="Pickup address" placeholder="IIT Delhi Main Gate" value={form.fromAddress} onChange={(e) => update("fromAddress", e.target.value)} required />
            <Input label="Drop address" placeholder="Jaipur Railway Station" value={form.toAddress} onChange={(e) => update("toAddress", e.target.value)} required />
          </fieldset>

          <fieldset className="glass rounded-[14px] p-5 space-y-3">
            <legend className="text-[12px] text-text-tertiary uppercase tracking-wide px-1">Details</legend>
            <Input label="Departure time" type="datetime-local" value={form.departureTime} onChange={(e) => update("departureTime", e.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Available seats" type="number" min="1" max="10" value={form.totalSeats} onChange={(e) => update("totalSeats", e.target.value)} required />
              <Input label="Price per seat" type="number" min="1" placeholder="150" value={form.pricePerSeat} onChange={(e) => update("pricePerSeat", e.target.value)} required />
            </div>
          </fieldset>

          <fieldset className="glass rounded-[14px] p-5 space-y-3">
            <legend className="text-[12px] text-text-tertiary uppercase tracking-wide px-1">Optional</legend>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Vehicle" placeholder="Swift Dzire" value={form.vehicle} onChange={(e) => update("vehicle", e.target.value)} />
              <Input label="Vehicle number" placeholder="DL 01 AB 1234" value={form.vehicleNumber} onChange={(e) => update("vehicleNumber", e.target.value)} />
            </div>
            <Textarea label="Notes" placeholder="AC cab, luggage space available..." value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} />
          </fieldset>
        </div>

        <Button type="submit" loading={loading} size="lg" className="w-full mt-6">
          Publish ride
        </Button>
      </form>
    </div>
  );
}
