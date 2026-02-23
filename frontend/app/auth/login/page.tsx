"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/auth";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { ApiError } from "../../lib/api";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      const next = searchParams.get("next");
      router.push(next && next.startsWith("/") ? next : "/dashboard/search");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
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
          <h1 className="text-[22px] font-semibold text-text-primary tracking-[-0.02em]">Welcome back</h1>
          <p className="text-[14px] text-text-secondary mt-1.5">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="px-3.5 py-2.5 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-[10px]">
              {error}
            </div>
          )}

          <Input label="Email" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-[12px] text-text-tertiary hover:text-text-secondary transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
            Sign in
          </Button>
        </form>

        <p className="text-[13px] text-text-tertiary text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-accent-mint hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" />}>
      <LoginForm />
    </Suspense>
  );
}
