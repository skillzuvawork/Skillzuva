"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { createOrder, createPayment, createEnrollment } from "@/services/purchase.client";
import { ShieldCheck, CreditCard, CheckCircle, Loader2, Lock } from "lucide-react";

interface BuyCourseButtonProps {
  courseId: string;
  courseTitle: string;
  price: number;
}

type Step = "details" | "processing" | "success";

export default function BuyCourseButton({ courseId, courseTitle, price }: BuyCourseButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });

  async function handleOpen() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setStep("details");
    setError(null);
    setOpen(true);
  }

  function formatCard(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiry(val: string) {
    const d = val.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep("processing");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Simulate payment gateway delay
      await new Promise((r) => setTimeout(r, 2000));

      const order = await createOrder(user.id, courseId, price);
      await createPayment(order.id, price);
      await createEnrollment(user.id, courseId, order.id);

      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setStep("details");
    }
  }

  return (
    <>
      <Button
        onClick={handleOpen}
        className="w-full text-white font-semibold h-12 text-base"
        style={{ backgroundColor: "#FF6B1A" }}
      >
        Enroll Now
      </Button>

      <Sheet open={open} onOpenChange={(v) => { if (step !== "processing") setOpen(v); }}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100" style={{ backgroundColor: "#003A99" }}>
            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-white/70" />
              <span className="text-xs text-white/70 font-medium">Secure Checkout</span>
            </div>
            <h2 className="text-lg font-bold text-white">Complete Your Enrollment</h2>
          </div>

          <div className="px-6 py-5">
            {step === "success" ? (
              /* ── Success ── */
              <div className="flex flex-col items-center text-center py-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#dcfce7" }}>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-sm text-gray-500 mb-1">You are now enrolled in</p>
                <p className="text-sm font-semibold text-gray-800 mb-6">{courseTitle}</p>
                <div className="w-full bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="font-semibold text-gray-900">₹{price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Access</span>
                    <span className="font-semibold text-gray-900">Lifetime</span>
                  </div>
                </div>
                <Button
                  className="w-full text-white font-semibold h-11"
                  style={{ backgroundColor: "#003A99" }}
                  onClick={() => { setOpen(false); router.push("/dashboard/student/courses"); router.refresh(); }}
                >
                  Go to My Courses →
                </Button>
              </div>
            ) : step === "processing" ? (
              /* ── Processing ── */
              <div className="flex flex-col items-center text-center py-16">
                <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: "#003A99" }} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment…</h3>
                <p className="text-sm text-gray-400">Please do not close this window.</p>
              </div>
            ) : (
              /* ── Details ── */
              <>
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Summary</p>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-700 font-medium leading-snug flex-1 pr-4">{courseTitle}</span>
                    <span className="text-sm font-bold text-gray-900 shrink-0">₹{price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-3">
                    <span>Lifetime access · Certificate included</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">Total</span>
                    <span className="text-base font-bold" style={{ color: "#003A99" }}>₹{price.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handlePay} className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4" style={{ color: "#003A99" }} />
                    <span className="text-sm font-semibold text-gray-800">Card Details</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">Name on Card</Label>
                    <Input
                      placeholder="e.g. Ravi Kumar"
                      required
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">Card Number</Label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      required
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                      maxLength={19}
                      className="h-10 text-sm font-mono tracking-widest"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">Expiry (MM/YY)</Label>
                      <Input
                        placeholder="MM/YY"
                        required
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                        maxLength={5}
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">CVV</Label>
                      <Input
                        placeholder="•••"
                        required
                        type="password"
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        maxLength={4}
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full text-white font-semibold h-12 text-base mt-2"
                    style={{ backgroundColor: "#FF6B1A" }}
                  >
                    Pay ₹{price.toLocaleString()}
                  </Button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-bit SSL secured · Safe & encrypted</span>
                  </div>
                </form>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
