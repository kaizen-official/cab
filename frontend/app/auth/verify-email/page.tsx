"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api, { ApiError } from "../../lib/api";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { Mail, ShieldCheck } from "lucide-react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.verifyEmail({ email, code });
      router.push("/dashboard/search");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await api.resendVerification(email);
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  }

  return (
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
        <div className="w-12 h-12 rounded-2xl bg-accent-mint/10 flex items-center justify-center mb-5">
          <ShieldCheck size={24} className="text-accent-mint" />
        </div>
        <h1 className="text-[28px] font-black text-text-primary tracking-[-0.03em]">
          Verify your email
        </h1>
        <p className="text-[14px] text-text-secondary mt-2">
          We sent a 6-digit code to your email
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="px-4 py-3 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
            {error}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          required
        />
        <Input
          label="Verification code"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={6}
          className="text-center tracking-[0.3em] text-[18px] font-bold"
        />
        <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
          Verify
        </Button>
      </form>

      <button
        onClick={handleResend}
        disabled={resending}
        className="text-[13px] text-text-tertiary hover:text-accent-mint transition-colors mt-6 block mx-auto cursor-pointer font-medium"
      >
        {resending ? "Sending..." : "Resend code"}
      </button>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[100svh] flex items-center justify-center px-5 bg-bg-primary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-accent-mint/4 rounded-full blur-[120px]" />
      </div>
      <Suspense>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
