"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle } from "lucide-react";
import { updateProfile, upsertStudentProfile } from "@/services/profiles.client";
import { Profile, StudentProfile } from "@/types/database";

const degreeTypes = ["BBA", "B.Com", "B.A.", "B.Sc.", "MBA", "M.Com.", "Other"];
const years = ["1st Year", "2nd Year", "3rd Year", "Final Year", "Graduated"];

interface ProfileFormProps {
  profile: Profile;
  studentProfile: StudentProfile | null;
}

export default function ProfileForm({ profile, studentProfile }: ProfileFormProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: profile.full_name ?? "",
    email: profile.email,
    phone: profile.phone_number ?? "",
    address: studentProfile?.address ?? "",
    collegeName: studentProfile?.college_name ?? "",
    degreeType: studentProfile?.degree_type ?? "",
    degreeName: studentProfile?.degree_name ?? "",
    currentYear: studentProfile?.current_year ?? "",
    startYear: studentProfile?.start_year ? String(studentProfile.start_year) : "",
    endYear: studentProfile?.end_year ? String(studentProfile.end_year) : "",
    city: studentProfile?.city ?? "",
    state: studentProfile?.state ?? "",
  });

  const initials = form.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "ST";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await Promise.all([
        updateProfile({ full_name: form.fullName, phone_number: form.phone }),
        upsertStudentProfile({
          college_name: form.collegeName,
          degree_type: form.degreeType,
          degree_name: form.degreeName,
          current_year: form.currentYear,
          start_year: form.startYear ? Number(form.startYear) : null,
          end_year: form.endYear ? Number(form.endYear) : null,
          address: form.address,
          city: form.city,
          state: form.state,
        }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Avatar section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0" style={{ backgroundColor: "#003A99" }}>
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{form.fullName || "Your Name"}</h2>
          <p className="text-sm text-gray-500">{form.email}</p>
          {form.degreeType && form.collegeName && (
            <p className="text-xs text-gray-400 mt-0.5">{form.degreeType} Student • {form.collegeName}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-6">Personal Information</h3>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm">Full Name</Label>
              <Input id="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="h-10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email Address</Label>
              <Input id="email" type="email" value={form.email} disabled className="h-10 text-sm bg-gray-50" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm">Phone Number</Label>
              <div className="flex h-10 rounded-lg border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#003A99]/20 focus-within:border-[#003A99] transition-colors">
                <span className="inline-flex items-center px-3 border-r border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium select-none shrink-0">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone.replace(/^\+91/, "")}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  className="flex-1 px-3 text-sm bg-transparent outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="h-10 text-sm" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-sm">City</Label>
              <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="h-10 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state" className="text-sm">State</Label>
              <Input id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="h-10 text-sm" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Academic Information</h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="collegeName" className="text-sm">College Name</Label>
                <Input id="collegeName" value={form.collegeName} onChange={(e) => setForm({ ...form, collegeName: e.target.value })} className="h-10 text-sm" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Degree Type</Label>
                  <Select value={form.degreeType} onValueChange={(v) => setForm({ ...form, degreeType: v ?? "" })}>
                    <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select degree" /></SelectTrigger>
                    <SelectContent>{degreeTypes.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Current Year</Label>
                  <Select value={form.currentYear} onValueChange={(v) => setForm({ ...form, currentYear: v ?? "" })}>
                    <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>{years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="degreeName" className="text-sm">Degree Name</Label>
                <Input id="degreeName" value={form.degreeName} onChange={(e) => setForm({ ...form, degreeName: e.target.value })} className="h-10 text-sm" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startYear" className="text-sm">Start Year</Label>
                  <Input id="startYear" value={form.startYear} onChange={(e) => setForm({ ...form, startYear: e.target.value })} className="h-10 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endYear" className="text-sm">End Year (Expected)</Label>
                  <Input id="endYear" value={form.endYear} onChange={(e) => setForm({ ...form, endYear: e.target.value })} className="h-10 text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={saving} className="text-white disabled:opacity-60" style={{ backgroundColor: "#003A99" }}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
