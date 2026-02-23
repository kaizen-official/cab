"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Post or find a ride",
    description:
      "Heading somewhere? Post your trip. Looking for a ride? Search by route and time.",
  },
  {
    number: "02",
    title: "Match with riders",
    description:
      "Get matched with verified students going your way. Check profiles before you commit.",
  },
  {
    number: "03",
    title: "Ride and split",
    description:
      "Meet up, share the cab, and costs are split automatically. That simple.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-24">
      <div className="max-w-[1000px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-[12px] text-text-tertiary tracking-wide uppercase">
            How it works
          </span>
          <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-text-primary mt-3">
            Three steps. Zero hassle.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass rounded-[16px] p-6 relative group"
            >
              <span className="text-[48px] font-bold text-white/3 absolute top-4 right-5 leading-none tracking-tighter select-none">
                {step.number}
              </span>
              <div className="relative">
                <div className="w-8 h-8 rounded-[8px] border border-border-default flex items-center justify-center mb-5">
                  <span className="text-[12px] font-medium text-text-secondary">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-[15px] font-medium text-text-primary mb-2 tracking-[-0.01em]">
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
