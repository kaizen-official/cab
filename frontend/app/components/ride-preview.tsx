"use client";

import { motion } from "framer-motion";
import { Clock, User, ArrowRight } from "lucide-react";

const rides = [
  {
    from: "IIT Delhi",
    to: "IGI Airport T3",
    time: "Today, 4:30 PM",
    rider: "Arjun S.",
    seats: 2,
    price: 180,
  },
  {
    from: "BITS Pilani",
    to: "Jaipur Station",
    time: "Tomorrow, 8:00 AM",
    rider: "Priya K.",
    seats: 3,
    price: 120,
  },
  {
    from: "VIT Vellore",
    to: "Chennai Central",
    time: "Sat, 6:00 PM",
    rider: "Rahul M.",
    seats: 1,
    price: 250,
  },
  {
    from: "SRM University",
    to: "Chennai Airport",
    time: "Sun, 10:00 AM",
    rider: "Neha T.",
    seats: 2,
    price: 200,
  },
];

export default function RidePreview() {
  return (
    <section id="offer" className="px-4 py-20 md:py-28">
      <div className="max-w-[1000px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-[11px] font-bold text-accent-cyan tracking-widest uppercase">
            Live rides
          </span>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.03em] text-text-primary mt-3">
            People are already moving.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rides.map((ride, i) => (
            <motion.div
              key={`${ride.from}-${ride.to}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="glass glass-hover rounded-2xl p-5 cursor-pointer group transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(173,255,166,0.04)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-2 h-2 rounded-full bg-accent-mint" />
                    <span className="text-[14px] text-text-primary font-semibold">
                      {ride.from}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                    <span className="text-[14px] text-text-primary font-semibold">
                      {ride.to}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[22px] font-black text-accent-mint tracking-[-0.02em]">
                    &#8377;{ride.price}
                  </div>
                  <div className="text-[10px] text-text-tertiary mt-0.5 font-medium uppercase tracking-wider">
                    per seat
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-3.5 border-t border-border-subtle">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-text-tertiary" />
                  <span className="text-[12px] text-text-secondary font-medium">
                    {ride.time}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User size={13} className="text-text-tertiary" />
                  <span className="text-[12px] text-text-secondary font-medium">
                    {ride.rider}
                  </span>
                </div>
                <div className="ml-auto">
                  <span className="text-[11px] font-semibold text-text-tertiary px-2.5 py-1 rounded-full bg-white/4 border border-border-subtle">
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
          className="text-center mt-10"
        >
          <a
            href="#"
            className="group inline-flex items-center gap-2 px-6 py-3 text-[13px] font-bold text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default rounded-xl transition-all"
          >
            View all rides
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
