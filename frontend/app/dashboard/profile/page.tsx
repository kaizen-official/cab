"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api, { type UserProfile, ApiError } from "../../lib/api";
import { useAuth } from "../../context/auth";
import Input from "../../components/ui/input";
import Textarea from "../../components/ui/textarea";
import Select from "../../components/ui/select";
import Button from "../../components/ui/button";
import Badge from "../../components/ui/badge";
import Spinner from "../../components/ui/spinner";
import { User, GraduationCap, Calendar } from "lucide-react";

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
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    bio: "",
  });
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
        <h1 className="text-[24px] font-black text-text-primary tracking-[-0.03em]">
          Profile
        </h1>
        <p className="text-[13px] text-text-secondary mt-1">
          Manage your account details
        </p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 text-[13px] text-accent-mint bg-accent-mint-muted border border-accent-mint/20 rounded-xl mb-4 font-medium"
        >
          {message}
        </motion.div>
      )}
      {error && (
        <div className="px-4 py-3 text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="max-w-[540px] space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-mint/20 to-accent-cyan/20 flex items-center justify-center text-[18px] text-text-primary font-black border border-border-subtle">
              {profile.firstName[0]}
              {profile.lastName[0]}
            </div>
            <div className="flex-1">
              <div className="text-[16px] text-text-primary font-bold">
                {profile.firstName} {profile.lastName}
              </div>
              <div className="text-[12px] text-text-tertiary mt-0.5">
                {profile.email}
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {profile.emailVerified && <Badge color="mint">Verified</Badge>}
              {profile.collegeVerified && (
                <Badge color="cyan">College</Badge>
              )}
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          onSubmit={handleSave}
          className="glass rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <User size={14} className="text-accent-mint" />
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
              Personal info
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
            <Input
              label="Last name"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>
          <Input
            label="Phone"
            placeholder="+91 9876543210"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
          <Select
            label="Gender"
            options={genderOptions}
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
          />
          <Textarea
            label="Bio"
            placeholder="Tell others about yourself..."
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={3}
          />
          <Button type="submit" loading={saving} size="md">
            Save changes
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={14} className="text-accent-cyan" />
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
              College
            </span>
          </div>
          <Input
            label="College name"
            placeholder="IIT Delhi"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          />
          <Button
            variant="secondary"
            loading={savingCollege}
            size="md"
            onClick={handleCollegeSave}
          >
            Update college
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-text-tertiary" />
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
              Account
            </span>
          </div>
          <p className="text-[13px] text-text-secondary">
            Member since{" "}
            <span className="text-text-primary font-semibold">
              {new Date(profile.createdAt).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
