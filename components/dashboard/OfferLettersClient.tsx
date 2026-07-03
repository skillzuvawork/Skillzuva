"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { FileText, Plus, Download, Trash2, X, Eye, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { OfferLetter } from "@/types/database";
import {
  createOfferLetterAction,
  deleteOfferLetterAction,
  bulkCreateOfferLettersAction,
} from "@/app/dashboard/admin/offer-letters/actions";

interface Props {
  letters: OfferLetter[];
}

// ── Types ──────────────────────────────────────────────────────────────────────
const TITLES = [
  "Business Development Associate",
  "Corporate Development Associate",
] as const;

interface BulkRow {
  name: string;
  title: string;
  stipend: string;        // string so editable inputs work; parse to number on submit
  joining_date: string;
  isDuplicate?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
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

/** Case-insensitive, trimmed key matching for flexible CSV/XLSX column names */
function matchKey(keys: string[], ...candidates: string[]): string | undefined {
  const normalised = candidates.map((c) => c.toLowerCase().trim());
  return keys.find((k) => normalised.includes(k.toLowerCase().trim()));
}

function parseFile(buffer: ArrayBuffer): BulkRow[] {
  const wb = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

  if (raw.length === 0) return [];

  const keys = Object.keys(raw[0]);

  const nameKey    = matchKey(keys, "name", "full name", "full_name", "employee name");
  const titleKey   = matchKey(keys, "title", "job title", "job_title", "designation", "role");
  const stipendKey = matchKey(keys, "stipend", "salary", "amount", "ctc");
  const joiningKey = matchKey(keys, "joining date", "joining_date", "date of joining", "doj");

  return raw.map((row) => {
    // Joining date: handle Excel date objects and string formats
    let joiningRaw = joiningKey ? row[joiningKey] : "";
    if (joiningRaw instanceof Date) {
      joiningRaw = joiningRaw.toISOString().split("T")[0];
    } else if (typeof joiningRaw === "number") {
      // Excel serial date
      const excelEpoch = new Date(Date.UTC(1900, 0, 1));
      excelEpoch.setUTCDate(excelEpoch.getUTCDate() + joiningRaw - 2);
      joiningRaw = excelEpoch.toISOString().split("T")[0];
    } else {
      joiningRaw = String(joiningRaw).trim();
      // Attempt to reformat "DD/MM/YYYY" or "DD-MM-YYYY" → YYYY-MM-DD
      const dmyMatch = joiningRaw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (dmyMatch) {
        joiningRaw = `${dmyMatch[3]}-${dmyMatch[2].padStart(2, "0")}-${dmyMatch[1].padStart(2, "0")}`;
      }
    }

    const rawTitle = titleKey ? String(row[titleKey]).trim() : "";
    // Snap title to one of the known values if possible
    const matchedTitle = TITLES.find(
      (t) => t.toLowerCase() === rawTitle.toLowerCase()
    ) ?? rawTitle;

    return {
      name:         nameKey    ? String(row[nameKey]).trim()    : "",
      title:        matchedTitle,
      stipend:      stipendKey ? String(row[stipendKey]).trim() : "",
      joining_date: joiningRaw,
    };
  });
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function OfferLettersClient({ letters: initial }: Props) {
  const [letters, setLetters] = useState<OfferLetter[]>(initial);
  const [showForm, setShowForm]     = useState(false);
  const [formError, setFormError]   = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewLetter, setPreviewLetter] = useState<OfferLetter | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // ── Bulk upload state ────────────────────────────────────────────────────────
  const [showBulk, setShowBulk]         = useState(false);
  const [bulkStep, setBulkStep]         = useState<1 | 2 | 3>(1);
  const [bulkRows, setBulkRows]         = useState<BulkRow[]>([]);
  const [bulkFileError, setBulkFileError] = useState("");
  const [rowStatuses, setRowStatuses]   = useState<("idle" | "loading" | "done" | "error")[]>([]);
  const [rowErrors, setRowErrors]       = useState<(string | undefined)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ── Single create ────────────────────────────────────────────────────────────
  function handleCreate(formData: FormData) {
    setFormError("");
    startTransition(async () => {
      const res = await createOfferLetterAction(formData);
      if (res?.error) {
        setFormError(res.error);
      } else {
        setShowForm(false);
        formRef.current?.reset();
        window.location.reload();
      }
    });
  }

  function handleDelete(id: string) {
    setConfirmDeleteId(id);
  }

  function confirmDelete() {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteOfferLetterAction(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setLetters((prev) => prev.filter((l) => l.id !== id));
        toast.success("Offer letter deleted.");
      }
      setDeletingId(null);
    });
  }

  // ── Bulk upload helpers ──────────────────────────────────────────────────────
  function openBulkModal() {
    setShowBulk(true);
    setBulkStep(1);
    setBulkRows([]);
    setBulkFileError("");
    setRowStatuses([]);
    setRowErrors([]);
  }

  function closeBulkModal() {
    setShowBulk(false);
  }

  const processFile = useCallback(async (file: File) => {
    setBulkFileError("");
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx" && ext !== "xls") {
      setBulkFileError("Please upload a .csv or .xlsx file.");
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      const rows = parseFile(buffer);
      if (rows.length === 0) {
        setBulkFileError("No data found in the file.");
        return;
      }
      const markedRows = rows.map((row) => ({
        ...row,
        isDuplicate: letters.some(
          (l) =>
            l.name.toLowerCase() === row.name.toLowerCase() &&
            l.title.toLowerCase() === row.title.toLowerCase() &&
            (l.joining_date ?? "") === row.joining_date
        ),
      }));
      setBulkRows(markedRows);
      setBulkStep(2);
    } catch {
      setBulkFileError("Failed to parse file. Please check the format.");
    }
  }, [letters]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  }

  function updateRow(index: number, field: keyof BulkRow, value: string) {
    setBulkRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Re-check duplicate status after edit
      updated[index].isDuplicate = letters.some(
        (l) =>
          l.name.toLowerCase() === updated[index].name.toLowerCase() &&
          l.title.toLowerCase() === updated[index].title.toLowerCase() &&
          (l.joining_date ?? "") === updated[index].joining_date
      );

      return updated;
    });
  }

  function isRowIncomplete(row: BulkRow): boolean {
    return !row.name.trim() || !row.title.trim() || !row.stipend.trim() || !row.joining_date.trim();
  }

  const today = new Date().toISOString().split("T")[0];
  const incompleteCount = bulkRows.filter(isRowIncomplete).length;
  const readyCount = bulkRows.length - incompleteCount;
  const canConfirm = incompleteCount === 0 && bulkRows.length > 0;

  async function handleBulkConfirm() {
    setBulkStep(3);
    setRowStatuses(bulkRows.map(() => "idle"));
    setRowErrors(bulkRows.map(() => undefined));

    const payload = bulkRows.map((row) => ({
      name:         row.name.trim(),
      title:        row.title.trim(),
      stipend:      parseFloat(row.stipend) || 0,
      date:         today,
      joining_date: row.joining_date,
    }));

    // Show loading per row
    setRowStatuses(bulkRows.map(() => "loading"));

    try {
      const results = await bulkCreateOfferLettersAction(payload);
      const statuses = results.map((r) =>
        (r as { success: boolean }).success ? "done" : "error"
      ) as ("done" | "error")[];
      const errors = results.map((r) =>
        (r as { success: boolean; error?: string }).success
          ? undefined
          : (r as { success: boolean; error?: string }).error
      );
      setRowStatuses(statuses);
      setRowErrors(errors);

      const successCount = statuses.filter((s) => s === "done").length;
      toast.success(`${successCount} offer letter${successCount !== 1 ? "s" : ""} created successfully!`);

      // Close and reload after short delay
      setTimeout(() => {
        closeBulkModal();
        window.location.reload();
      }, 1200);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk upload failed.");
      setRowStatuses(bulkRows.map(() => "error"));
    }
  }

  const pdfDownloadUrl = (l: OfferLetter) => l.pdf_url ?? `/api/offer-letters/${l.id}/pdf`;
  const pdfPreviewUrl  = (l: OfferLetter) => `/api/offer-letters/${l.id}/pdf?preview=1`;

  return (
    <>
    <div className="p-6 space-y-6">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Offer Letters</h2>
          <p className="text-sm text-gray-500 mt-0.5">{letters.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={openBulkModal}
            variant="outline"
            className="flex items-center gap-2 border-[#FF6B1A] text-[#FF6B1A] hover:bg-orange-50"
          >
            <Upload className="w-4 h-4" /> Bulk Upload
          </Button>
          <Button
            onClick={() => { setShowForm(true); setFormError(""); }}
            className="text-white flex items-center gap-2"
            style={{ backgroundColor: "#003A99" }}
          >
            <Plus className="w-4 h-4" /> New Offer Letter
          </Button>
        </div>
      </div>
    </div>

      {/* ── Single create modal ── */}
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
                  className="flex w-full h-9 text-sm rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none"
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
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="flex w-full h-9 text-sm rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Joining Date</label>
                <input
                  name="joining_date"
                  type="date"
                  className="flex w-full h-9 text-sm rounded-md border border-input bg-background px-3 py-1 text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

      {/* ── Bulk upload modal ── */}
      {showBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl relative flex flex-col" style={{ maxHeight: "92vh", minHeight: "480px" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Bulk Upload Offer Letters</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {bulkStep === 1 && "Upload a CSV or XLSX file"}
                  {bulkStep === 2 && `${bulkRows.length} rows found — review & edit before confirming`}
                  {bulkStep === 3 && "Uploading…"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Step indicator */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((s) => (
                    <span
                      key={s}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: bulkStep >= s ? "#003A99" : "#e5e7eb",
                        color: bulkStep >= s ? "#fff" : "#6b7280",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {bulkStep !== 3 && (
                  <button onClick={closeBulkModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {/* ── Step 1: File upload ── */}
              {bulkStep === 1 && (
                <div className="space-y-4">
                  <div
                    className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all select-none`}
                    style={{
                      borderColor: isDragging ? "#FF6B1A" : "#e5e7eb",
                      backgroundColor: isDragging ? "#FFF8F4" : "transparent",
                      minHeight: "200px",
                      padding: "40px 24px",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) await processFile(file);
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: isDragging ? "#FFE8D6" : "#f3f4f6" }}
                    >
                      <Upload className="w-7 h-7" style={{ color: "#FF6B1A" }} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {isDragging ? "Drop your file here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Supports .csv, .xlsx, .xls</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {bulkFileError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                      <span className="text-red-500 text-xs font-medium">{bulkFileError}</span>
                    </div>
                  )}

                  {/* Column name guide */}
                  <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
                    <p className="font-semibold text-gray-700 mb-2">Accepted column names (case-insensitive):</p>
                    <p><span className="font-medium text-gray-800">Name:</span> name, full name, full_name, employee name</p>
                    <p><span className="font-medium text-gray-800">Title:</span> title, job title, job_title, designation, role</p>
                    <p><span className="font-medium text-gray-800">Stipend:</span> stipend, salary, amount, ctc</p>
                    <p><span className="font-medium text-gray-800">Joining Date:</span> joining date, joining_date, date of joining, doj</p>
                  </div>
                </div>
              )}

              {/* ── Step 2: Preview & edit table ── */}
              {bulkStep === 2 && (
                <div className="space-y-4">
                  {/* Summary bar */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: "#e8f0fe", color: "#003A99" }}>
                      {readyCount} rows ready
                    </span>
                    {incompleteCount > 0 && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-red-50 text-red-600">
                        {incompleteCount} rows incomplete
                      </span>
                    )}
                    {bulkRows.some((r) => r.isDuplicate) && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-50 text-yellow-700">
                        {bulkRows.filter((r) => r.isDuplicate).length} possible duplicate{bulkRows.filter((r) => r.isDuplicate).length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Emp ID Preview</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[160px]">Name</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[260px]">Title</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[110px]">Stipend (₹)</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[140px]">Joining Date</th>
                          <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkRows.map((row, i) => {
                          const incomplete = isRowIncomplete(row);
                          const empIdPreview = previewEmpId(letters.length + i);
                          return (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 group">
                              <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>

                              {/* Employee ID preview (read-only) */}
                              <td className="px-3 py-2">
                                <span
                                  className="inline-block text-xs font-bold font-mono px-2 py-0.5 rounded"
                                  style={{ backgroundColor: "#FFF3EC", color: "#FF6B1A" }}
                                >
                                  {empIdPreview}
                                </span>
                              </td>

                              {/* Name */}
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={row.name}
                                  onChange={(e) => updateRow(i, "name", e.target.value)}
                                  className={`w-full text-xs rounded-md border px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003A99] ${
                                    !row.name.trim() ? "border-red-400 bg-red-50" : "border-gray-200"
                                  }`}
                                  placeholder="Full Name"
                                />
                              </td>

                              {/* Title dropdown */}
                              <td className="px-3 py-2">
                                <select
                                  value={row.title}
                                  onChange={(e) => updateRow(i, "title", e.target.value)}
                                  className={`w-full min-w-[240px] text-xs rounded-md border px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003A99] ${
                                    !row.title.trim() ? "border-red-400 bg-red-50" : "border-gray-200"
                                  }`}
                                >
                                  <option value="">Select title</option>
                                  {TITLES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </td>

                              {/* Stipend */}
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  value={row.stipend}
                                  onChange={(e) => updateRow(i, "stipend", e.target.value)}
                                  className={`w-full text-xs rounded-md border px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003A99] ${
                                    !row.stipend.trim() ? "border-red-400 bg-red-50" : "border-gray-200"
                                  }`}
                                  placeholder="15000"
                                  min="0"
                                />
                              </td>

                              {/* Joining date */}
                              <td className="px-3 py-2">
                                <input
                                  type="date"
                                  value={row.joining_date}
                                  onChange={(e) => updateRow(i, "joining_date", e.target.value)}
                                  className={`w-full text-xs rounded-md border px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003A99] ${
                                    !row.joining_date.trim() ? "border-red-400 bg-red-50" : "border-gray-200"
                                  }`}
                                />
                              </td>

                              {/* Status badges */}
                              <td className="px-3 py-2">
                                <div className="flex flex-col gap-1">
                                  {incomplete && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium">
                                      Incomplete
                                    </span>
                                  )}
                                  {row.isDuplicate && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 font-medium">
                                      Duplicate?
                                    </span>
                                  )}
                                  {!incomplete && !row.isDuplicate && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-medium">
                                      Ready
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Delete row */}
                              <td className="px-2 py-2">
                                <button
                                  type="button"
                                  onClick={() => setBulkRows((prev) => prev.filter((_, idx) => idx !== i))}
                                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Remove row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Step 3: Upload progress ── */}
              {bulkStep === 3 && (
                <div className="space-y-2">
                  {bulkRows.map((row, i) => {
                    const status = rowStatuses[i] ?? "idle";
                    const err    = rowErrors[i];
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-lg px-4 py-2.5 border border-gray-100 bg-gray-50">
                        <div className="w-5 flex items-center justify-center shrink-0">
                          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin text-[#003A99]" />}
                          {status === "done"    && <span className="text-green-500 text-sm font-bold">✓</span>}
                          {status === "error"   && <span className="text-red-500 text-sm font-bold">✗</span>}
                          {status === "idle"    && <span className="w-2 h-2 rounded-full bg-gray-300 block" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{row.name}</p>
                          <p className="text-xs text-gray-400 truncate">{row.title}</p>
                        </div>
                        {err && (
                          <p className="text-xs text-red-500 shrink-0 max-w-[200px] text-right">{err}</p>
                        )}
                        <span
                          className="text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0"
                          style={{ backgroundColor: "#FFF3EC", color: "#FF6B1A" }}
                        >
                          {previewEmpId(letters.length + i)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer actions */}
            {bulkStep === 2 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => { setBulkStep(1); setBulkRows([]); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                >
                  Back
                </Button>
                <Button
                  disabled={!canConfirm}
                  onClick={handleBulkConfirm}
                  className="text-white px-6"
                  style={{ backgroundColor: canConfirm ? "#003A99" : undefined }}
                >
                  {canConfirm
                    ? `Confirm Upload (${readyCount} rows)`
                    : `Fix ${incompleteCount} incomplete row${incompleteCount !== 1 ? "s" : ""} first`}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PDF Preview modal ── */}
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

      {/* ── Delete confirm modal ── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete Offer Letter</h3>
                <p className="text-xs text-gray-500 mt-1">
                  This will permanently delete the offer letter for{" "}
                  <span className="font-semibold text-gray-700">
                    {letters.find((l) => l.id === confirmDeleteId)?.name ?? "this employee"}
                  </span>
                  . This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                onClick={confirmDelete}
                disabled={!!deletingId}
              >
                {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

    <div className="px-6 pb-6">
      {/* ── Table ── */}
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
    </>
  );
}
