"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { sendPasswordReset } from "@/services/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!submitted ? (
        <>
          <div className="mb-8">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "#e8f0fe" }}>
              <Mail className="w-6 h-6" style={{ color: "#003A99" }} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot password?</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              No worries. Enter your registered email and we&apos;ll send you a reset link.
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" required value={email}
                onChange={(e) => setEmail(e.target.value)} className="h-11 text-sm bg-white border-gray-200" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 text-white font-semibold text-sm disabled:opacity-60" style={{ backgroundColor: "#003A99" }}>
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "#003A99" }}>Sign in</Link>
          </p>
        </>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#e8f0fe" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "#003A99" }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">We&apos;ve sent a password reset link to</p>
          <p className="font-semibold text-gray-900 text-sm mb-6">{email}</p>
          <p className="text-gray-400 text-xs mb-8">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button onClick={() => { setSubmitted(false); setEmail(""); }} className="font-medium hover:underline" style={{ color: "#003A99" }}>
              try again
            </button>
          </p>
          <Link href="/login">
            <Button variant="outline" className="h-11 px-8 text-sm border-[#003A99] font-medium" style={{ color: "#003A99" }}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
