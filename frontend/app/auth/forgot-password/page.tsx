"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "../../lib/api";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { Mail, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100svh] flex items-center justify-center px-5 bg-bg-primary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[25%] right-[15%] w-[400px] h-[400px] bg-accent-cyan/4 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-xl bg-accent-mint flex items-center justify-center glow-mint">
              <span className="text-[#040404] text-[15px] font-black tracking-tighter leading-none">
                d
              </span>
            </div>
            <span className="text-text-primary text-[16px] font-bold tracking-[-0.03em]">
              drift
            </span>
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center mb-5">
            <KeyRound size={24} className="text-accent-cyan" />
          </div>
          <h1 className="text-[28px] font-black text-text-primary tracking-[-0.03em]">
            Reset password
          </h1>
          <p className="text-[14px] text-text-secondary mt-2">
            {sent
              ? "If an account exists, we sent a reset code."
              : "Enter your email to receive a reset code."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="w-full mt-1"
            >
              Send reset code
            </Button>
          </form>
        ) : (
          <Link href={`/auth/reset-password?email=${encodeURIComponent(email)}`}>
            <Button size="lg" className="w-full">
              Enter reset code
            </Button>
          </Link>
        )}

        <p className="text-[13px] text-text-tertiary text-center mt-8">
          <Link
            href="/auth/login"
            className="text-accent-mint hover:underline font-semibold"
          >
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
