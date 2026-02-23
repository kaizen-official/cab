"use client";

import { useState, useEffect } from "react";
import api, { type UserProfile, ApiError } from "../../lib/api";
import { useAuth } from "../../context/auth";
import Input from "../../components/ui/input";
import Textarea from "../../components/ui/textarea";
import Select from "../../components/ui/select";
import Button from "../../components/ui/button";
import Badge from "../../components/ui/badge";
import Spinner from "../../components/ui/spinner";

const genderOptions = [
  { value: "", label: "Prefer not to say" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCollege, setSavingCollege] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", gender: "", bio: "" });
  const [college, setCollege] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const p = await api.getMyProfile();
        setProfile(p);
        setForm({
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone || "",
          gender: p.gender || "",
          bio: p.bio || "",
        });
        setCollege(p.college || "");
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updated = await api.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        gender: form.gender || undefined,
        bio: form.bio || undefined,
      });
      setProfile(updated);
      setMessage("Profile updated");
      refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleCollegeSave() {
    setSavingCollege(true);
    setError("");
    setMessage("");

    try {
      const updated = await api.setCollege(college);
      setProfile(updated);
      setMessage("College updated");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setSavingCollege(false);
    }
  }

  if (loading) return <Spinner />;
  if (!profile) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-text-primary tracking-[-0.02em]">Profile</h1>
        <p className="text-[13px] text-text-secondary mt-1">Manage your account details</p>
      </div>

      {message && <div className="px-3.5 py-2.5 text-[13px] text-accent-mint bg-accent-mint-muted border border-accent-mint/20 rounded-[10px] mb-4">{message}</div>}
      {error && <div className="px-3.5 py-2.5 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-[10px] mb-4">{error}</div>}

      <div className="max-w-[520px] space-y-5">
        <div className="glass rounded-[14px] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-[16px] text-text-secondary font-medium">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div>
              <div className="text-[15px] text-text-primary font-medium">{profile.firstName} {profile.lastName}</div>
              <div className="text-[12px] text-text-tertiary">{profile.email}</div>
            </div>
            <div className="ml-auto flex gap-1.5">
              {profile.emailVerified && <Badge color="mint">Verified</Badge>}
              {profile.collegeVerified && <Badge color="cyan">College verified</Badge>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="glass rounded-[14px] p-5 space-y-3">
          <h3 className="text-[14px] font-medium text-text-primary mb-1">Personal info</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
            <Input label="Last name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
          </div>
          <Input label="Phone" placeholder="+91 9876543210" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          <Select label="Gender" options={genderOptions} value={form.gender} onChange={(e) => update("gender", e.target.value)} />
          <Textarea label="Bio" placeholder="Tell others about yourself..." value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={3} />
          <Button type="submit" loading={saving} size="md">Save changes</Button>
        </form>

        <div className="glass rounded-[14px] p-5 space-y-3">
          <h3 className="text-[14px] font-medium text-text-primary mb-1">College</h3>
          <Input label="College name" placeholder="IIT Delhi" value={college} onChange={(e) => setCollege(e.target.value)} />
          <Button variant="secondary" loading={savingCollege} size="md" onClick={handleCollegeSave}>Update college</Button>
        </div>

        <div className="glass rounded-[14px] p-5">
          <h3 className="text-[14px] font-medium text-text-primary mb-1">Account</h3>
          <p className="text-[12px] text-text-tertiary mb-3">Member since {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        </div>
      </div>
    </div>
  );
}
