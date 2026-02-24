"use client";

import { motion } from "framer-motion";
import { Search, UserCheck, Zap } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Post or find a ride",
    description:
      "Heading somewhere? Post your trip. Looking for a ride? Search by route and time.",
  },
  {
    number: "02",
    icon: UserCheck,
    title: "Match with riders",
    description:
      "Get matched with verified students going your way. Check profiles before you commit.",
  },
  {
    number: "03",
    icon: Zap,
    title: "Ride and split",
    description:
      "Meet up, share the cab, and costs are split automatically. That simple.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20 md:py-28">
      <div className="max-w-[1000px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-[11px] font-bold text-accent-mint tracking-widest uppercase">
            How it works
          </span>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.03em] text-text-primary mt-3">
            Three steps. Zero hassle.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 relative group overflow-hidden"
            >
              <span className="text-[72px] font-black text-white/2 absolute -top-2 -right-1 leading-none tracking-tighter select-none">
                {step.number}
              </span>
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-accent-mint/10 flex items-center justify-center mb-5">
                  <step.icon size={20} className="text-accent-mint" />
                </div>
                <h3 className="text-[16px] font-bold text-text-primary mb-2 tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
