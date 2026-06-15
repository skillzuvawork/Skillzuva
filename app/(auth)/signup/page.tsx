"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, CheckCircle, Check } from "lucide-react";
import { signUp } from "@/services/auth";
import { upsertStudentProfileWithToken } from "@/services/profiles.client";

const degreeTypes = ["BBA", "B.Com", "B.A.", "B.Sc.", "M.A.", "MBA", "M.Com.", "PGDM", "Diploma", "Other"];
const currentYears = ["1st Year", "2nd Year", "3rd Year", "Final Year", "Graduated"];
const academicYears = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - 4 + i));

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
    collegeName: "", degreeName: "", degreeType: "", currentYear: "",
    startYear: "", endYear: "", agreeTerms: false,
  });

  const allRulesMet = passwordRules.every((r) => r.test(form.password));
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;
  const phoneValid = /^[6-9]\d{9}$/.test(form.phone);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid) { setError("Enter a valid 10-digit Indian mobile number."); return; }
    if (!allRulesMet) { setError("Password does not meet the requirements."); return; }
    if (!passwordsMatch) { setError("Passwords do not match."); return; }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await signUp(form.email, form.password, form.fullName);
      if (!data.session || !data.user) throw new Error("Signup succeeded but no session returned.");

      // Save phone to profiles + academic info to student_profiles immediately using the fresh token
      await upsertStudentProfileWithToken(data.session.access_token, data.session.refresh_token, data.user.id, {
        college_name: form.collegeName || null,
        degree_name: form.degreeName || null,
        degree_type: form.degreeType || null,
        current_year: form.currentYear || null,
        start_year: form.startYear ? Number(form.startYear) : null,
        end_year: form.endYear ? Number(form.endYear) : null,
        phone_number: form.phone ? `+91${form.phone}` : null,
      });

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
        <p className="text-gray-500 text-sm">Start your learning journey with SkillZuva today.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[{ n: 1, label: "Personal Info" }, { n: 2, label: "Academic Info" }].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              style={step >= n ? { backgroundColor: "#003A99", color: "#fff" } : { backgroundColor: "#f3f4f6", color: "#9ca3af" }}
            >
              {step > n ? <CheckCircle className="w-4 h-4" /> : n}
            </div>
            <span className={`text-xs font-medium ${step >= n ? "text-gray-900" : "text-gray-400"}`}>{label}</span>
            {n < 2 && <div className={`flex-1 h-px ${step > n ? "bg-[#003A99]" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
      )}

      {step === 1 ? (
        <form onSubmit={handleStep1} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
            <Input id="fullName" placeholder="Your full name" required value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="h-11 text-sm bg-white border-gray-200" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-11 text-sm bg-white border-gray-200" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
            <div className={`flex h-11 rounded-lg border bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#003A99]/20 focus-within:border-[#003A99] transition-colors ${form.phone.length > 0 && !phoneValid ? "border-red-300" : "border-gray-200"}`}>
              <span className="inline-flex items-center px-3 border-r border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium select-none shrink-0">+91</span>
              <input id="phone" type="tel" inputMode="numeric" placeholder="XXXXX XXXXX" required maxLength={10}
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                className="flex-1 px-3 text-sm bg-transparent outline-none placeholder:text-gray-400" />
            </div>
            {form.phone.length > 0 && !phoneValid && (
              <p className="text-xs text-red-500">Enter a valid 10-digit Indian mobile number</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">New Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password"
                required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-11 text-sm bg-white border-gray-200 pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle password">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {passwordRules.map((rule) => {
                  const passed = rule.test(form.password);
                  return (
                    <div key={rule.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${passed ? "bg-green-500" : "bg-gray-200"}`}>
                        {passed && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className={`text-xs ${passed ? "text-green-600" : "text-gray-400"}`}>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
            <div className="relative">
              <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Re-enter your password"
                required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className={`h-11 text-sm bg-white pr-10 ${form.confirmPassword.length > 0 ? passwordsMatch ? "border-green-400" : "border-red-300" : "border-gray-200"}`} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle confirm password">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <Button type="submit" className="w-full h-11 text-white font-semibold text-sm" style={{ backgroundColor: "#003A99" }}>
            Continue →
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="college" className="text-sm font-medium text-gray-700">College / University Name</Label>
            <Input id="college" placeholder="e.g. Andhra University" required value={form.collegeName}
              onChange={(e) => setForm({ ...form, collegeName: e.target.value })} className="h-11 text-sm bg-white border-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Degree Type</Label>
              <Select value={form.degreeType} onValueChange={(v) => setForm({ ...form, degreeType: v ?? "" })}>
                <SelectTrigger className="h-11 text-sm bg-white border-gray-200 w-full">
                  <SelectValue placeholder="Select degree" />
                </SelectTrigger>
                <SelectContent>
                  {degreeTypes.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="degreeName" className="text-sm font-medium text-gray-700">Specialization / Branch</Label>
              <Input id="degreeName" placeholder="e.g. Marketing, Finance, HR" value={form.degreeName}
                onChange={(e) => setForm({ ...form, degreeName: e.target.value })} className="h-11 text-sm bg-white border-gray-200" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Current Year</Label>
            <Select value={form.currentYear} onValueChange={(v) => setForm({ ...form, currentYear: v ?? "" })}>
              <SelectTrigger className="h-11 text-sm bg-white border-gray-200 w-full">
                <SelectValue placeholder="Select current year" />
              </SelectTrigger>
              <SelectContent>
                {currentYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Start Year</Label>
              <Select value={form.startYear} onValueChange={(v) => setForm({ ...form, startYear: v ?? "" })}>
                <SelectTrigger className="h-11 text-sm bg-white border-gray-200 w-full">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">End Year (Expected)</Label>
              <Select value={form.endYear} onValueChange={(v) => setForm({ ...form, endYear: v ?? "" })}>
                <SelectTrigger className="h-11 text-sm bg-white border-gray-200 w-full">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input id="terms" type="checkbox" required checked={form.agreeTerms}
              onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
              className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-[#003A99] shrink-0" />
            <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="font-medium" style={{ color: "#003A99" }}>Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="font-medium" style={{ color: "#003A99" }}>Privacy Policy</Link>
            </Label>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1 h-11 text-sm border-gray-200 text-gray-600" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 h-11 text-white font-semibold text-sm disabled:opacity-60" style={{ backgroundColor: "#003A99" }}>
              {loading ? "Creating…" : "Create Account"}
            </Button>
          </div>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 mt-8">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold hover:underline" style={{ color: "#003A99" }}>Sign in</Link>
      </p>
    </div>
  );
}
