"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../context/auth";

const navLinks = [
  { label: "Search rides", href: "#search" },
  { label: "Offer a ride", href: "#offer" },
  { label: "How it works", href: "#how-it-works" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 safe-top">
      <div className="mx-auto max-w-[1200px] px-4 pt-3 md:pt-4">
        <div className="glass-strong backdrop-blur-2xl rounded-2xl px-4 py-2.5 md:px-5 md:py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-mint flex items-center justify-center glow-mint">
              <span className="text-[#040404] text-[15px] font-black tracking-tighter leading-none">
                d
              </span>
            </div>
            <span className="text-text-primary text-[16px] font-bold tracking-[-0.03em]">
              drift
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-[14px] text-text-secondary hover:text-text-primary transition-colors rounded-xl hover:bg-white/4"
              >
                {link.label}
              </a>
            ))}
          </div>

          {!loading && (
            <div className="hidden md:flex items-center gap-2.5">
              {user ? (
                <Link
                  href="/dashboard/search"
                  className="group px-5 py-2.5 text-[13px] font-bold bg-accent-mint text-[#040404] rounded-xl hover:brightness-110 transition-all glow-mint flex items-center gap-1.5"
                >
                  Dashboard
                  <ArrowUpRight
                    size={14}
                    strokeWidth={2.5}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2.5 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2.5 text-[13px] font-bold bg-accent-mint text-[#040404] rounded-xl hover:brightness-110 transition-all glow-mint"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}

          <button
            className="md:hidden p-2 -mr-1 text-text-secondary hover:text-text-primary transition-colors rounded-xl hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="glass-strong mt-2 rounded-2xl p-3 md:hidden"
            >
              <div className="flex flex-col gap-0.5">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-[15px] text-text-secondary hover:text-text-primary transition-colors rounded-xl hover:bg-white/5 active:bg-white/8"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-2 pt-3 border-t border-border-subtle flex flex-col gap-2">
                  {user ? (
                    <Link
                      href="/dashboard/search"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-[15px] font-bold bg-accent-mint text-[#040404] rounded-xl text-center glow-mint active:scale-[0.98] transition-all"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-[15px] text-text-secondary hover:text-text-primary transition-colors text-center"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-[15px] font-bold bg-accent-mint text-[#040404] rounded-xl text-center glow-mint active:scale-[0.98] transition-all"
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
