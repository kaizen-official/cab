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
    iconBg: "bg-accent-mint/10",
    iconColor: "text-accent-mint",
    glow: "group-hover:shadow-[0_0_30px_rgba(173,255,166,0.08)]",
  },
  cyan: {
    iconBg: "bg-accent-cyan/10",
    iconColor: "text-accent-cyan",
    glow: "group-hover:shadow-[0_0_30px_rgba(138,242,233,0.08)]",
  },
};

export default function Features() {
  return (
    <section className="px-4 py-20 md:py-28">
      <div className="max-w-[1000px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-[11px] font-bold text-accent-mint tracking-widest uppercase">
            Why drift
          </span>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-[-0.03em] text-text-primary mt-3">
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`glass glass-hover rounded-2xl p-6 group cursor-default transition-shadow duration-300 ${accent.glow}`}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${accent.iconBg} flex items-center justify-center mb-4`}
                >
                  <feature.icon size={20} className={accent.iconColor} />
                </div>
                <h3 className="text-[16px] font-bold text-text-primary mb-2 tracking-[-0.01em]">
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
