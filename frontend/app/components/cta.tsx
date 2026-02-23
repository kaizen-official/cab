"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="px-5 py-24">
      <div className="max-w-[640px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-text-primary mb-4">
            Your next ride is
            <br />
            already waiting.
          </h2>
          <p className="text-[15px] text-text-secondary leading-relaxed max-w-[380px] mx-auto mb-8">
            Join thousands of students who are saving money and making their
            commute better.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-medium bg-accent-mint text-[#040404] rounded-[12px] hover:bg-accent-mint/90 transition-colors"
            >
              Get started
              <ArrowRight size={15} strokeWidth={2.5} />
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 text-[14px] font-medium text-text-secondary hover:text-text-primary border border-border-subtle hover:border-border-default rounded-[12px] transition-all"
            >
              Offer a ride
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
