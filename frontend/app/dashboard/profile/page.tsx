"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import api, { type UserProfile, ApiError } from "../../lib/api";
import { useAuth } from "../../context/auth";
import Input from "../../components/ui/input";
import Textarea from "../../components/ui/textarea";
import Select from "../../components/ui/select";
import Button from "../../components/ui/button";
import Badge from "../../components/ui/badge";
import Spinner from "../../components/ui/spinner";
import {
  User,
  GraduationCap,
  Calendar,
  Camera,
  Phone,
  Shield,
  Settings,
  Upload,
} from "lucide-react";

const genderOptions = [
  { value: "", label: "Prefer not to say" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const yearOptions = [
  { value: "", label: "Select year" },
  { value: "1st Year", label: "1st Year" },
  { value: "2nd Year", label: "2nd Year" },
  { value: "3rd Year", label: "3rd Year" },
  { value: "4th Year", label: "4th Year" },
  { value: "5th Year", label: "5th Year" },
  { value: "Alumni", label: "Alumni" },
  { value: "Postgraduate", label: "Postgraduate" },
  { value: "PhD", label: "PhD" },
];

const statusBadgeColor: Record<string, string> = {
  NOT_SUBMITTED: "gray",
  PENDING: "yellow",
  APPROVED: "mint",
  REJECTED: "red",
};

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCollege, setSavingCollege] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    bio: "",
    whatsappNumber: "",
    program: "",
    academicYear: "",
    whatsappVisible: true,
  });
  const [whatsappSameAsPhone, setWhatsappSameAsPhone] = useState(false);
  const [college, setCollege] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const studentIdInputRef = useRef<HTMLInputElement>(null);

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
          whatsappNumber: p.whatsappNumber || "",
          program: p.program || "",
          academicYear: p.academicYear || "",
          whatsappVisible: p.whatsappVisible ?? true,
        });
        setCollege(p.college || "");
        if (p.phone && p.whatsappNumber && p.phone === p.whatsappNumber) {
          setWhatsappSameAsPhone(true);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function update(field: string, value: string | boolean) {
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
        whatsappNumber: (whatsappSameAsPhone ? form.phone : form.whatsappNumber) || undefined,
        program: form.program || undefined,
        academicYear: form.academicYear || undefined,
        whatsappVisible: form.whatsappVisible,
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

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError("");
    try {
      const result = await api.uploadAvatar(file);
      setProfile((prev) => prev ? { ...prev, avatarUrl: result.avatarUrl } : prev);
      setMessage("Profile picture updated");
      refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  async function handleStudentIdUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(true);
    setError("");
    try {
      const result = await api.uploadStudentId(file);
      setProfile((prev) => prev ? { ...prev, studentIdUrl: result.studentIdUrl, studentIdStatus: result.studentIdStatus } : prev);
      setMessage("Student ID uploaded for verification");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload");
    } finally {
      setUploadingId(false);
      if (studentIdInputRef.current) studentIdInputRef.current.value = "";
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
        {/* Avatar + header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="relative group cursor-pointer shrink-0"
              disabled={uploadingAvatar}
            >
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt=""
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-2xl object-cover border border-border-subtle"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-mint/20 to-accent-cyan/20 flex items-center justify-center text-[18px] text-text-primary font-black border border-border-subtle">
                  {profile.firstName[0]}
                  {profile.lastName[0]}
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera size={16} className="text-white" />
                )}
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </button>
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

        {/* Personal info */}
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
            onChange={(e) => {
              update("phone", e.target.value);
              if (whatsappSameAsPhone) update("whatsappNumber", e.target.value);
            }}
          />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[12px] text-text-secondary font-medium">WhatsApp number</label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappSameAsPhone}
                  onChange={(e) => {
                    setWhatsappSameAsPhone(e.target.checked);
                    if (e.target.checked) update("whatsappNumber", form.phone);
                  }}
                  className="rounded border-border-subtle"
                />
                <span className="text-[11px] text-text-tertiary">Same as phone</span>
              </label>
            </div>
            <Input
              placeholder="+91 9876543210"
              value={whatsappSameAsPhone ? form.phone : form.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              disabled={whatsappSameAsPhone}
              icon={<Phone size={14} />}
            />
          </div>
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

        {/* Academic info */}
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Program"
              placeholder="B.Tech CS"
              value={form.program}
              onChange={(e) => update("program", e.target.value)}
            />
            <Select
              label="Academic year"
              options={yearOptions}
              value={form.academicYear}
              onChange={(e) => update("academicYear", e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            loading={savingCollege}
            size="md"
            onClick={handleCollegeSave}
          >
            Update college
          </Button>
        </motion.div>

        {/* Student ID verification */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="glass rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-accent-mint" />
              <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
                Student ID Verification
              </span>
            </div>
            {profile.studentIdStatus && profile.studentIdStatus !== "NOT_SUBMITTED" && (
              <Badge color={statusBadgeColor[profile.studentIdStatus]}>
                {profile.studentIdStatus}
              </Badge>
            )}
          </div>
          <p className="text-[12px] text-text-secondary">
            Upload your student ID card to verify your identity. This helps build trust with other riders.
          </p>
          {profile.studentIdUrl && (
            <div className="rounded-xl border border-border-subtle overflow-hidden">
              <Image
                src={profile.studentIdUrl}
                alt="Student ID"
                width={400}
                height={250}
                className="w-full h-auto object-contain"
              />
            </div>
          )}
          <Button
            variant="secondary"
            size="md"
            loading={uploadingId}
            onClick={() => studentIdInputRef.current?.click()}
          >
            <Upload size={14} />
            {profile.studentIdUrl ? "Re-upload Student ID" : "Upload Student ID"}
          </Button>
          <input
            ref={studentIdInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleStudentIdUpload}
          />
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass rounded-2xl p-5 space-y-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Settings size={14} className="text-text-tertiary" />
            <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
              Settings
            </span>
          </div>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <div>
              <div className="text-[13px] text-text-primary font-medium">
                WhatsApp visible to riders
              </div>
              <div className="text-[11px] text-text-tertiary mt-0.5">
                Let confirmed passengers see your WhatsApp number
              </div>
            </div>
            <input
              type="checkbox"
              checked={form.whatsappVisible}
              onChange={(e) => update("whatsappVisible", e.target.checked)}
              className="rounded border-border-subtle w-5 h-5"
            />
          </label>
        </motion.div>

        {/* Account info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
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
