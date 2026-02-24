"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="px-4 py-20 md:py-28">
      <div className="max-w-[680px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-accent-mint/5 rounded-full blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.03em] text-text-primary mb-4">
                Your next ride is
                <br />
                already waiting.
              </h2>
              <p className="text-[15px] text-text-secondary leading-relaxed max-w-[380px] mx-auto mb-8">
                Join thousands of students who are saving money and making their
                commute better.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-bold bg-accent-mint text-[#040404] rounded-xl hover:brightness-110 transition-all glow-mint active:scale-[0.97]"
                >
                  Get started
                  <ArrowRight
                    size={16}
                    strokeWidth={2.5}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <Link
                  href="/dashboard/rides/new"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-bold text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default rounded-xl transition-all active:scale-[0.97]"
                >
                  Offer a ride
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
