"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, User } from "lucide-react";

const rides = [
  {
    from: "IIT Delhi",
    to: "IGI Airport T3",
    time: "Today, 4:30 PM",
    rider: "Arjun S.",
    seats: 2,
    price: 180,
    college: "IIT Delhi",
  },
  {
    from: "BITS Pilani",
    to: "Jaipur Station",
    time: "Tomorrow, 8:00 AM",
    rider: "Priya K.",
    seats: 3,
    price: 120,
    college: "BITS Pilani",
  },
  {
    from: "VIT Vellore",
    to: "Chennai Central",
    time: "Sat, 6:00 PM",
    rider: "Rahul M.",
    seats: 1,
    price: 250,
    college: "VIT Vellore",
  },
  {
    from: "SRM University",
    to: "Chennai Airport",
    time: "Sun, 10:00 AM",
    rider: "Neha T.",
    seats: 2,
    price: 200,
    college: "SRM University",
  },
];

export default function RidePreview() {
  return (
    <section id="offer" className="px-5 py-24">
      <div className="max-w-[1000px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-[12px] text-text-tertiary tracking-wide uppercase">
            Live rides
          </span>
          <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-text-primary mt-3">
            People are already moving.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rides.map((ride, i) => (
            <motion.div
              key={`${ride.from}-${ride.to}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass glass-hover rounded-[16px] p-5 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-mint" />
                    <span className="text-[14px] text-text-primary font-medium">
                      {ride.from}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                    <span className="text-[14px] text-text-primary font-medium">
                      {ride.to}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-semibold text-accent-mint tracking-[-0.02em]">
                    &#8377;{ride.price}
                  </div>
                  <div className="text-[11px] text-text-tertiary mt-0.5">
                    per seat
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-text-tertiary" />
                  <span className="text-[12px] text-text-secondary">
                    {ride.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={13} className="text-text-tertiary" />
                  <span className="text-[12px] text-text-secondary">
                    {ride.rider}
                  </span>
                </div>
                <div className="ml-auto">
                  <span className="text-[11px] text-text-tertiary px-2 py-1 rounded-md bg-white/3 border border-border-subtle">
                    {ride.seats} {ride.seats === 1 ? "seat" : "seats"} left
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center mt-8"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default rounded-[10px] transition-all"
          >
            View all rides
          </a>
        </motion.div>
      </div>
    </section>
  );
}
