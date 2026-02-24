"use client";

import { motion } from "framer-motion";
import SearchBar from "./search-bar";
import { Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-svh flex flex-col items-center justify-center px-4 pt-10 pb-30 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-accent-mint/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[15%] right-[5%] w-[500px] h-[500px] bg-accent-cyan/4 rounded-full blur-[130px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-mint/2 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10 max-w-[720px] mx-auto text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent-mint/20 bg-accent-mint/5 mb-8">
            <Sparkles size={14} className="text-accent-mint" />
            <span className="text-[12px] font-semibold text-accent-mint tracking-wide uppercase">
              Built for college students
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-[0.95] tracking-[-0.04em] text-text-primary mb-6"
        >
          Split the ride,
          <br />
          <span className="bg-linear-to-r from-accent-mint to-accent-cyan bg-clip-text text-transparent">
            not your wallet.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-[16px] md:text-[18px] text-text-secondary leading-relaxed max-w-[460px] mx-auto mb-10"
        >
          Find students heading your way. Share cabs, split fares, make the
          commute less boring.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <SearchBar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex items-center justify-center gap-8 md:gap-12"
        >
          {[
            { value: "12k+", label: "students" },
            { value: "50k+", label: "rides shared" },
            { value: "85+", label: "colleges" },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="text-[20px] md:text-[24px] font-black text-text-primary tracking-[-0.02em]">
                {stat.value}
              </div>
              <div className="text-[11px] md:text-[12px] text-text-tertiary mt-0.5 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
