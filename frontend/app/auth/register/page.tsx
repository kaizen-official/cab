"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../../context/auth";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { ApiError } from "../../lib/api";
import { Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { email } = await register(form);
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
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
        <div className="absolute top-[15%] left-[10%] w-[400px] h-[400px] bg-accent-cyan/4 rounded-full blur-[120px]" />
        <div className="absolute bottom-[15%] right-[10%] w-[300px] h-[300px] bg-accent-mint/3 rounded-full blur-[100px]" />
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
            Create an account
          </h1>
          <p className="text-[14px] text-text-secondary mt-2">
            Join thousands of students sharing rides
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="px-4 py-3 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              placeholder="John"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              icon={<User size={16} />}
              required
            />
            <Input
              label="Last name"
              placeholder="Doe"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            placeholder="you@college.edu"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            icon={<Mail size={16} />}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            icon={<Lock size={16} />}
            required
            minLength={8}
          />

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full mt-1"
          >
            Create account
          </Button>
        </form>

        <p className="text-[13px] text-text-tertiary text-center mt-8">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-accent-mint hover:underline font-semibold"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
