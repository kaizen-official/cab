"use client";

import { motion } from "framer-motion";
import { Shield, Wallet, Clock, Users } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Split fares instantly",
    description:
      "Costs are divided automatically. No awkward Venmo requests, no mental math.",
    accent: "mint" as const,
  },
  {
    icon: Shield,
    title: "Verified .edu only",
    description:
      "Every rider is verified through their college email. You always know who you're riding with.",
    accent: "cyan" as const,
  },
  {
    icon: Clock,
    title: "Rides when you need them",
    description:
      "Airport runs, weekend trips, daily commutes. Find rides that match your schedule.",
    accent: "mint" as const,
  },
  {
    icon: Users,
    title: "Your campus network",
    description:
      "Connect with students from your college. Same routes, same vibes, lower costs.",
    accent: "cyan" as const,
  },
];

const accentMap = {
  mint: {
    iconBg: "bg-accent-mint-muted",
    iconColor: "text-accent-mint",
  },
  cyan: {
    iconBg: "bg-accent-cyan-muted",
    iconColor: "text-accent-cyan",
  },
};

export default function Features() {
  return (
    <section className="px-5 py-24">
      <div className="max-w-[1000px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-[12px] text-text-tertiary tracking-wide uppercase">
            Why drift
          </span>
          <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold tracking-[-0.03em] text-text-primary mt-3">
            Ridesharing that actually
            <br className="hidden sm:block" />
            makes sense.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature, i) => {
            const accent = accentMap[feature.accent];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass glass-hover rounded-[16px] p-6 group cursor-default"
              >
                <div
                  className={`w-9 h-9 rounded-[10px] ${accent.iconBg} flex items-center justify-center mb-4`}
                >
                  <feature.icon size={18} className={accent.iconColor} />
                </div>
                <h3 className="text-[15px] font-medium text-text-primary mb-2 tracking-[-0.01em]">
                  {feature.title}
                </h3>
                <p className="text-[14px] text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
