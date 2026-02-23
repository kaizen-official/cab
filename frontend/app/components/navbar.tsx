"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[1200px] px-5 pt-4">
        <div className="glass rounded-[14px] px-5 py-3 flex items-center justify-between backdrop-blur-lg">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-mint flex items-center justify-center">
              <span className="text-[#040404] text-sm font-bold tracking-tight leading-none">
                D
              </span>
            </div>
            <span className="text-text-primary text-[15px] font-semibold tracking-[-0.02em]">
              drift
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 text-[15px] text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-white/4"
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
                  className="px-4 py-2 text-[13px] font-medium bg-accent-mint text-[#040404] rounded-[10px] hover:bg-accent-mint/90 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 text-[13px] font-medium bg-accent-mint text-[#040404] rounded-[10px] hover:bg-accent-mint/90 transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}

          <button
            className="md:hidden p-1.5 text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="glass mt-2 rounded-[14px] p-4 md:hidden"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 text-[14px] text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-white/4"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-3 pt-3 border-t border-border-subtle flex flex-col gap-2">
                  {user ? (
                    <Link
                      href="/dashboard/search"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-2.5 text-[14px] font-medium bg-accent-mint text-[#040404] rounded-[10px] text-center hover:bg-accent-mint/90 transition-colors"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-2.5 text-[14px] text-text-secondary hover:text-text-primary transition-colors"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-2.5 text-[14px] font-medium bg-accent-mint text-[#040404] rounded-[10px] text-center hover:bg-accent-mint/90 transition-colors"
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
