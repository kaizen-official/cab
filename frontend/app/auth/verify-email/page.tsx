"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api, { ApiError } from "../../lib/api";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";

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
      setError(err instanceof ApiError ? err.message : "Something went wrong");
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
    <div className="w-full max-w-[380px]">
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2.5 mb-8">
          <div className="w-7 h-7 rounded-lg bg-accent-mint flex items-center justify-center">
            <span className="text-[#040404] text-sm font-bold tracking-tight leading-none">D</span>
          </div>
          <span className="text-text-primary text-[15px] font-semibold tracking-[-0.02em]">drift</span>
        </Link>
        <h1 className="text-[22px] font-semibold text-text-primary tracking-[-0.02em]">Verify your email</h1>
        <p className="text-[14px] text-text-secondary mt-1.5">We sent a 6-digit code to your email</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="px-3.5 py-2.5 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-[10px]">
            {error}
          </div>
        )}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Verification code" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value)} required maxLength={6} />
        <Button type="submit" loading={loading} size="lg" className="w-full mt-1">Verify</Button>
      </form>

      <button onClick={handleResend} disabled={resending} className="text-[13px] text-text-tertiary hover:text-text-secondary transition-colors mt-4 block mx-auto cursor-pointer">
        {resending ? "Sending..." : "Resend code"}
      </button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-bg-primary">
      <Suspense>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
