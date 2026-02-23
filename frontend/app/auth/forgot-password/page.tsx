"use client";

import { useState } from "react";
import Link from "next/link";
import api from "../../lib/api";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";

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
    <div className="min-h-screen flex items-center justify-center px-5 bg-bg-primary">
      <div className="w-full max-w-[380px]">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-7 h-7 rounded-lg bg-accent-mint flex items-center justify-center">
              <span className="text-[#040404] text-sm font-bold tracking-tight leading-none">D</span>
            </div>
            <span className="text-text-primary text-[15px] font-semibold tracking-[-0.02em]">drift</span>
          </Link>
          <h1 className="text-[22px] font-semibold text-text-primary tracking-[-0.02em]">Reset password</h1>
          <p className="text-[14px] text-text-secondary mt-1.5">
            {sent ? "If an account exists, we sent a reset code." : "Enter your email to receive a reset code."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">Send reset code</Button>
          </form>
        ) : (
          <Link href={`/auth/reset-password?email=${encodeURIComponent(email)}`}>
            <Button size="lg" className="w-full">Enter reset code</Button>
          </Link>
        )}

        <p className="text-[13px] text-text-tertiary text-center mt-6">
          <Link href="/auth/login" className="text-accent-mint hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
