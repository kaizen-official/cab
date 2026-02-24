"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../context/auth";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { ApiError } from "../../lib/api";
import { Mail, Lock } from "lucide-react";

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
      setError(
        err instanceof ApiError ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100svh] flex items-center justify-center px-5 bg-bg-primary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-accent-mint/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-accent-cyan/3 rounded-full blur-[100px]" />
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
          <h1 className="text-[28px] font-black text-text-primary tracking-[-0.03em]">
            Welcome back
          </h1>
          <p className="text-[14px] text-text-secondary mt-2">
            Sign in to your account
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
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
          />

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-[12px] text-text-tertiary hover:text-accent-mint transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
            Sign in
          </Button>
        </form>

        <p className="text-[13px] text-text-tertiary text-center mt-8">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/register"
            className="text-accent-mint hover:underline font-semibold"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex items-center justify-center" />}
    >
      <LoginForm />
    </Suspense>
  );
}
