"use client";

import { useState, useTransition, useRef } from "react";
import { FileText, Plus, Download, Trash2, X, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OfferLetter } from "@/types/database";
import { createOfferLetterAction, deleteOfferLetterAction } from "@/app/dashboard/admin/offer-letters/actions";

interface Props {
  letters: OfferLetter[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function previewEmpId(count: number): string {
  const yy = String(new Date().getFullYear()).slice(-2);
  return `SZT${yy}${String(count + 1).padStart(2, "0")}`;
}

export default function OfferLettersClient({ letters: initial }: Props) {
  const [letters, setLetters] = useState<OfferLetter[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewLetter, setPreviewLetter] = useState<OfferLetter | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleCreate(formData: FormData) {
    setFormError("");
    startTransition(async () => {
      const res = await createOfferLetterAction(formData);
      if (res?.error) {
        setFormError(res.error);
      } else {
        // Refresh by reloading letters from the server via a hard nav
        setShowForm(false);
        formRef.current?.reset();
        window.location.reload();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this offer letter? This cannot be undone.")) return;
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteOfferLetterAction(id);
      if (res?.error) {
        alert(res.error);
      } else {
        setLetters((prev) => prev.filter((l) => l.id !== id));
      }
      setDeletingId(null);
    });
  }

  const pdfDownloadUrl = (l: OfferLetter) => l.pdf_url ?? `/api/offer-letters/${l.id}/pdf`;
  const pdfPreviewUrl  = (l: OfferLetter) => `/api/offer-letters/${l.id}/pdf?preview=1`;

  return (
    <div className="p-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Offer Letters</h2>
          <p className="text-sm text-gray-500 mt-0.5">{letters.length} total</p>
        </div>
        <Button
          onClick={() => { setShowForm(true); setFormError(""); }}
          className="text-white flex items-center gap-2"
          style={{ backgroundColor: "#003A99" }}
        >
          <Plus className="w-4 h-4" /> New Offer Letter
        </Button>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-semibold text-gray-900 mb-5">Create Offer Letter</h3>

            <form ref={formRef} action={handleCreate} className="space-y-4">
              {/* Auto-generated Employee ID preview */}
              <div className="flex items-center justify-between rounded-lg px-3 py-2 border border-dashed border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-500 font-medium">Employee ID (auto-assigned)</span>
                <span className="text-sm font-bold tracking-wide" style={{ color: "#FF6B1A" }}>
                  {previewEmpId(letters.length)}
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <Input name="name" placeholder="e.g. Subham Acharjee" required className="h-9 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                <select
                  name="title"
                  required
                  defaultValue=""
                  className="w-full h-9 text-sm rounded-md border border-input bg-background px-3 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="" disabled>Select a title</option>
                  <option value="Business Development Associate">Business Development Associate</option>
                  <option value="Corporate Development Associate">Corporate Development Associate</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stipend (₹)</label>
                <Input name="stipend" type="number" min="0" step="0.01" placeholder="15000" required className="h-9 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <Input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="h-9 text-sm"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-500">{formError}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 text-white"
                  style={{ backgroundColor: "#003A99" }}
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Preview modal */}
      {previewLetter && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ height: "88vh" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-800">Offer Letter Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={pdfDownloadUrl(previewLetter)}
                  download
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-white"
                  style={{ backgroundColor: "#FF6B1A" }}
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  onClick={() => setPreviewLetter(null)}
                  className="text-gray-400 hover:text-gray-600 ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <iframe
              src={`${pdfPreviewUrl(previewLetter)}#toolbar=0`}
              className="flex-1 w-full rounded-b-2xl"
              title="Offer Letter Preview"
            />
          </div>
        </div>
      )}

      {/* Table */}
      {letters.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#e8f0fe" }}>
            <FileText className="w-7 h-7" style={{ color: "#003A99" }} />
          </div>
          <p className="text-sm font-medium text-gray-600">No offer letters yet</p>
          <p className="text-xs text-gray-400 mt-1">Click &quot;New Offer Letter&quot; to generate one.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Employee ID", "Name", "Title", "Stipend", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {letters.map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "#FF6B1A" }}>
                      {l.employee_id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{l.name}</td>
                    <td className="px-4 py-3 text-gray-600">{l.title}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: "#003A99" }}>
                      {formatCurrency(l.stipend)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(l.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewLetter(l)}
                          title="Preview"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#003A99] hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={pdfDownloadUrl(l)}
                          download
                          title="Download PDF"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#FF6B1A] hover:bg-orange-50 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(l.id)}
                          disabled={deletingId === l.id}
                          title="Delete"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          {deletingId === l.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
