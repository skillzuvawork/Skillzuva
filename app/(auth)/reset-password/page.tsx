"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, KeyRound, CheckCircle, Check } from "lucide-react";
import { updatePassword } from "@/services/auth";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

export default function ResetPasswordPage() {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allRulesMet = passwordRules.every((r) => r.test(newPassword));
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesMet || !passwordsMatch) return;
    setError(null);
    setLoading(true);
    try {
      await updatePassword(newPassword);
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!done ? (
        <>
          <div className="mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "#e8f0fe" }}>
              <KeyRound className="w-6 h-6" style={{ color: "#003A99" }} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset your password</h1>
            <p className="text-gray-500 text-sm leading-relaxed">Create a strong new password for your SkillZuva account.</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">New Password</Label>
              <div className="relative">
                <Input id="new-password" type={showNew ? "text" : "password"} placeholder="Enter new password"
                  required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 text-sm bg-white border-gray-200 pr-10" />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(newPassword);
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
              <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
              <div className="relative">
                <Input id="confirm-password" type={showConfirm ? "text" : "password"} placeholder="Confirm new password"
                  required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`h-11 text-sm bg-white pr-10 ${confirmPassword.length > 0 ? passwordsMatch ? "border-green-400" : "border-red-300" : "border-gray-200"}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Toggle">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <Button type="submit" disabled={!allRulesMet || !passwordsMatch || loading}
              className="w-full h-11 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#003A99" }}>
              {loading ? "Resetting…" : "Reset Password"}
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#e8f0fe" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "#003A99" }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Password reset!</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">Your password has been successfully reset. You can now sign in.</p>
          <Link href="/login">
            <Button className="w-full h-11 text-white font-semibold text-sm" style={{ backgroundColor: "#003A99" }}>
              Sign In Now
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
