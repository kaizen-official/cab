"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/auth";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { ApiError } from "../../lib/api";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
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
          <h1 className="text-[22px] font-semibold text-text-primary tracking-[-0.02em]">Create an account</h1>
          <p className="text-[14px] text-text-secondary mt-1.5">Join thousands of students sharing rides</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="px-3.5 py-2.5 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-[10px]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" placeholder="John" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
            <Input label="Last name" placeholder="Doe" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
          </div>
          <Input label="Email" type="email" placeholder="you@college.edu" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          <Input label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} />

          <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
            Create account
          </Button>
        </form>

        <p className="text-[13px] text-text-tertiary text-center mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-accent-mint hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
