"use client";

import { motion } from "framer-motion";
import SearchBar from "./search-bar";

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-5 pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-accent-mint/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-accent-cyan/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[680px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-subtle bg-white/2 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-mint animate-pulse" />
            <span className="text-[12px] text-text-tertiary tracking-wide uppercase">
              Built for college students
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-text-primary mb-5"
        >
          Split the ride,
          <br />
          not your wallet.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-[16px] md:text-[17px] text-text-secondary leading-relaxed max-w-[440px] mx-auto mb-10"
        >
          Find students heading your way. Share cabs, split fares, make the
          commute less boring.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <SearchBar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex items-center justify-center gap-6"
        >
          {[
            { value: "12k+", label: "students" },
            { value: "50k+", label: "rides shared" },
            { value: "85+", label: "colleges" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-[15px] font-semibold text-text-primary tracking-[-0.01em]">
                {stat.value}
              </div>
              <div className="text-[12px] text-text-tertiary mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
