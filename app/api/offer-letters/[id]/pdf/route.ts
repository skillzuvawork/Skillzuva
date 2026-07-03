import { NextRequest, NextResponse } from "next/server";
import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  Image as PDFImage,
  StyleSheet,
  Svg,
  Circle,
  Path,
  Rect,
  Polyline,
} from "@react-pdf/renderer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import type { OfferLetter } from "@/types/database";
import { createElement } from "react";

const BUCKET     = "skillzuva";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const BLUE  = "#003A99";
const ORANGE = "#FF6B1A";
const BLACK = "#111111";
const GRAY  = "#555555";

// A4 = 595 × 842 pt
// header image: 1600 × 206 px  →  595 × (595*206/1600) = 595 × 76.6 ≈ 77 pt
// footer image: 1600 × 103 px  →  595 × (595*103/1600) = 595 × 38.3 ≈ 38 pt
const HEADER_H = 77;
const FOOTER_H = 38;
const FOOTER_CONTACT_H = 36; // white contact row height above the image band
const FOOTER_TOTAL_H = FOOTER_CONTACT_H + FOOTER_H; // 74pt total footer

function toBase64(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === "png" ? "image/png" : ext === "svg" ? "image/svg+xml" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function toCleanJpegBase64(filePath: string, maxWidth = 400): Promise<string> {
  const buf = await sharp(filePath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 92 })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

// Remove near-white background from signature image → transparent PNG
async function toTransparentPngBase64(filePath: string, maxWidth = 400): Promise<string> {
  const resized = await sharp(filePath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  const { width, height, channels } = info;
  const pixels = new Uint8ClampedArray(data);

  for (let i = 0; i < width * height; i++) {
    const off = i * channels;
    const r = pixels[off], g = pixels[off + 1], b = pixels[off + 2];
    // If pixel is near-white (all channels > 230) make it transparent
    if (r > 230 && g > 230 && b > 230) {
      pixels[off + 3] = 0;
    }
  }

  const buf = await sharp(Buffer.from(pixels), {
    raw: { width, height, channels },
  }).png().toBuffer();

  return `data:image/png;base64,${buf.toString("base64")}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function amountInWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
    "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (n === 0) return "Zero";
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + amountInWords(n % 100) : "");
  if (n < 100000) return amountInWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + amountInWords(n % 1000) : "");
  return amountInWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + amountInWords(n % 100000) : "");
}

const POLICIES = [
  "By accepting this offer, you agree to perform all responsibilities assigned to you with due care and diligence and in compliance with the company's policies and management norms.",
  "You are also required to devote a substantial amount of your time and effort to performing these tasks during business hours and such reasonable additional time as may be necessary.",
  "During the training period, you will not receive any of the employee benefits that regular employees receive.",
  "Employees are expected to maintain professional conduct, regular attendance, and participate in all mandatory meetings and assigned work activities. Repeated unauthorized absences, non-participation, misconduct, or violation of Company policies may result in disciplinary action, including termination of employment. You are required to give 15 days' notice should you wish to terminate your training before the end of your tenure.",
  "All information acquired during the course of your training shall be treated as strictly confidential. You shall refrain from using it for your own purposes or disclosing it to anyone outside the company.",
  "Upon conclusion of your tenure, you shall immediately return to the company all its property, equipment, and documents, including any electronically stored information.",
  "You will observe and comply with all policies and practices governing the conduct of the company's business and its employees. Internship Certificate will be issued only upon successful completion of the 3-month internship",
  "The compensation stated in this offer is payable based on the achievement of assigned sales targets, satisfactory performance, and compliance with the Company's attendance and performance policies. The candidate is required to achieve an assigned target of 25 closures within 45 days.",
  "If he/she skips or is absent from daily meetings without informing the HR team, SkillVora reserves the right to terminate the training.",
  "If Skillzuva terminates the trainee, the final settlement of the stipend will be processed only after the completion of the 45-day training period. No stipend payment will be made during the training period.",
  "Upon successful completion of the training tenure, the candidate may be considered for a performance-based pre-placement offer from the company.",
];

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: BLACK,
    paddingTop: 0,
    paddingBottom: FOOTER_TOTAL_H + 4,
    paddingHorizontal: 0,
  },

  // ── Header image (full width) ─────────────────────────────
  headerImg: { width: 595, height: HEADER_H },

  // ── Company info block page 1 (bold/prominent) ───────────
  companyBlock: { paddingHorizontal: 36, paddingTop: 8, paddingBottom: 0 },
  companyName: {
    textAlign: "center",
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    letterSpacing: 2,
    marginBottom: 3,
  },
  cinRow:  { textAlign: "center", fontSize: 9, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: 2 },
  address: { textAlign: "center", fontSize: 9, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: 6 },
  divider: { borderBottomWidth: 2, borderBottomColor: BLUE },

  // ── Company info block page 2 (minimal — just divider) ───
  companyBlock2: { paddingHorizontal: 36, paddingTop: 6, paddingBottom: 0 },
  divider2: { borderBottomWidth: 1.5, borderBottomColor: BLUE },

  // ── Body ─────────────────────────────────────────────────
  body: { paddingHorizontal: 48, paddingTop: 6 },

  empIdRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 },
  empIdBox: {
    backgroundColor: "#FFF3EC",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  empId: { fontSize: 10.5, fontFamily: "Helvetica-Bold", color: ORANGE },

  logoRow:     { alignItems: "center", marginBottom: 4, marginTop: 2 },
  visibleLogo: { width: 190, height: 130, objectFit: "contain" },

  greeting: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: BLACK,
    marginBottom: 10,
  },

  dateRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 },
  dateText: { fontSize: 11, color: BLACK },

  dear:  { fontFamily: "Helvetica-Bold", fontSize: 11, color: BLACK, marginBottom: 10 },
  para:  { fontSize: 11, color: BLACK, lineHeight: 1.7, marginBottom: 11 },

  // ── Footer (fixed, full-width) ────────────────────────────
  footer:         { position: "absolute", bottom: 0, left: 0, right: 0 },
  footerContact:  {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  footerContactItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  footerContactText: { fontSize: 8.5, color: BLUE, fontFamily: "Helvetica-Bold" },
  footerImg:      { width: 595, height: FOOTER_H },

  // ── Watermark ─────────────────────────────────────────────
  watermarkWrap: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  watermarkImg: { width: 320, height: 220, objectFit: "contain", opacity: 0.06 },

  // ── Page 2 ────────────────────────────────────────────────
  policyTitle: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: BLUE,
    marginBottom: 12,
    marginTop: 4,
  },
  policyItem: { fontSize: 9.5, color: BLACK, lineHeight: 1.6, marginBottom: 7 },

  // ── Signature ─────────────────────────────────────────────
  sigRow:        { flexDirection: "row", alignItems: "flex-end", marginTop: 18, gap: 80 },
  sigLeft:       { flexDirection: "column" },
  sigAndStamp:   { position: "relative", width: 120, height: 90, marginBottom: 3 },
  stampImg:      { position: "absolute", top: 0, left: 10, width: 88, height: 88, objectFit: "contain" },
  sigImg:        { position: "absolute", bottom: 0, left: 0, width: 110, height: 52, objectFit: "contain" },
  sigName:       { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: BLACK },
  sigRole:       { fontSize: 9,   color: GRAY },
  sigRight:      { flexDirection: "column", gap: 10 },
  sigFieldRow:   { flexDirection: "column" },
  sigLabel:      { fontSize: 9.5, color: BLACK, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  sigLine:       { borderBottomWidth: 1, borderBottomColor: BLACK, width: 180 },
});

function buildPDF(
  letter: OfferLetter,
  headerB64: string,
  footerB64: string,
  logoB64: string,
  signB64: string,
  stampB64: string,
) {
  const stipendWords = amountInWords(Math.round(letter.stipend));

  // Page 1 header — large bold company block
  const page1Header = createElement(View, null,
    createElement(PDFImage, { src: headerB64, style: s.headerImg }),
    createElement(View, { style: s.companyBlock },
      createElement(Text, { style: s.companyName }, "SKILLZUVA TECHNOLOGIES"),
      createElement(Text, { style: s.cinRow },
        "CIN :- U62099AP2024OPC113625         REGISTRATION NO :- 113625"
      ),
      createElement(Text, { style: s.address },
        "1st Floor, Plot No: 25, 16, Jayabheri Enclave, Gachibowli, Hyderabad, Telangana 500032"
      ),
      createElement(View, { style: s.divider }),
    ),
  );

  // Page 2 header — header image + just the divider line (no company text)
  const page2Header = createElement(View, null,
    createElement(PDFImage, { src: headerB64, style: s.headerImg }),
    createElement(View, { style: s.companyBlock2 },
      createElement(View, { style: s.divider2 }),
    ),
  );

  // Shared footer — contact row + image band (fixed, repeats on every page)
  const pageFooter = createElement(View, { style: s.footer, fixed: true },
    createElement(View, { style: s.footerContact },
      // Globe icon — website
      createElement(View, { style: s.footerContactItem },
        createElement(Svg, { width: 13, height: 13, viewBox: "0 0 24 24" },
          createElement(Circle, { cx: "12", cy: "12", r: "10", stroke: ORANGE, strokeWidth: "2", fill: "none" }),
          createElement(Path, { d: "M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z", stroke: ORANGE, strokeWidth: "2", fill: "none" }),
        ),
        createElement(Text, { style: s.footerContactText }, "www.skillzuvatechnologies.com"),
      ),
      // Phone icon
      createElement(View, { style: s.footerContactItem },
        createElement(Svg, { width: 13, height: 13, viewBox: "0 0 24 24" },
          createElement(Path, { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z", stroke: ORANGE, strokeWidth: "2", fill: "none" }),
        ),
        createElement(Text, { style: s.footerContactText }, "+919381021835"),
      ),
      // Mail icon
      createElement(View, { style: s.footerContactItem },
        createElement(Svg, { width: 13, height: 13, viewBox: "0 0 24 24" },
          createElement(Rect, { x: "2", y: "4", width: "20", height: "16", rx: "2", stroke: ORANGE, strokeWidth: "2", fill: "none" }),
          createElement(Polyline, { points: "2,4 12,13 22,4", stroke: ORANGE, strokeWidth: "2", fill: "none" }),
        ),
        createElement(Text, { style: s.footerContactText }, "info@skillzuvatechnologies.com"),
      ),
    ),
    createElement(PDFImage, { src: footerB64, style: s.footerImg }),
  );

  // Shared watermark (sits behind body text on every page)
  const watermark = createElement(View, { style: s.watermarkWrap, fixed: true },
    createElement(PDFImage, { src: logoB64, style: s.watermarkImg }),
  );

  // ── PAGE 1 ────────────────────────────────────────────────
  const page1 = createElement(Page, { size: "A4", style: s.page },
    page1Header,
    watermark,
    createElement(View, { style: s.body },
      // Employee ID badge
      createElement(View, { style: s.empIdRow },
        createElement(View, { style: s.empIdBox },
          createElement(Text, { style: s.empId }, `EMPLOYEE ID :- ${letter.employee_id}`),
        ),
      ),
      // Visible logo centered above greeting
      createElement(View, { style: s.logoRow },
        createElement(PDFImage, { src: logoB64, style: s.visibleLogo }),
      ),
      createElement(Text, { style: s.greeting }, "Greetings from SKILLZUVA TECHNOLOGIES"),
      // Date
      createElement(View, { style: s.dateRow },
        createElement(Text, { style: s.dateText }, `DATE :- ${formatDate(letter.date)}`),
      ),
      createElement(Text, { style: s.dear }, `Dear  ${letter.name.toUpperCase()}`),
      createElement(Text, { style: s.para },
        "We congratulate you for being selected for a 3 Months INTERNSHIP PROGRAM at SKILLZUVA TECHNOLOGIES LLP. Ltd."
      ),
      // Title line
      createElement(View, { style: { flexDirection: "row", marginBottom: 11 } },
        createElement(Text, { style: { fontSize: 11, color: BLACK } }, "Title: "),
        createElement(Text, { style: { fontSize: 11, fontFamily: "Helvetica-Bold", color: BLACK } }, letter.title),
      ),
      createElement(Text, { style: s.para },
        "full-time opportunity will be offered based on your performance during the internship period.\nThe compensation for the full-time role will be discussed at the time of conversion."
      ),
      createElement(Text, { style: s.para },
        `Your stipend will be Rs. ${letter.stipend.toLocaleString("en-IN")}/- (${stipendWords} Rupees)`
      ),
      createElement(Text, { style: s.para },
        `Date of Joining: ${letter.joining_date ? formatDate(letter.joining_date) : "To be communicated"}`
      ),
      createElement(Text, { style: s.para },
        "Working Hours: 10:30AM to 7:30PM, 9 Hours a day (Inc. Lunch Break)."
      ),
      createElement(Text, { style: s.para },
        "Job Type: Full-Time- Training Kindly note that Monday will be a day off.\nLocation: Remote"
      ),
      createElement(Text, { style: s.para },
        "We look forward to your valuable contributions and to a mutually rewarding association with Skillzuva Technologies."
      ),
      createElement(Text, { style: s.para }, "To accept this offer, please confirm by email"),
    ),
    pageFooter,
  );

  // ── PAGE 2 ────────────────────────────────────────────────
  const page2 = createElement(Page, { size: "A4", style: s.page },
    page2Header,
    watermark,
    createElement(View, { style: s.body },
      createElement(Text, { style: s.policyTitle }, "Training Policy"),
      ...POLICIES.map((text, i) =>
        createElement(Text, { key: String(i), style: s.policyItem }, `${i + 1}) ${text}`)
      ),
      createElement(View, { style: s.sigRow },
        createElement(View, { style: s.sigLeft },
          createElement(View, { style: s.sigAndStamp },
            createElement(PDFImage, { src: stampB64, style: s.stampImg }),
            createElement(PDFImage, { src: signB64,  style: s.sigImg }),
          ),
          createElement(Text, { style: s.sigName }, "CH. Vaishnavi – HR Manager"),
          createElement(Text, { style: s.sigRole }, "Skillzuva Technologies"),
        ),
        createElement(View, { style: s.sigRight },
          ...["Employee Name", "Signature", "Date"].map((label) =>
            createElement(View, { key: label, style: s.sigFieldRow },
              createElement(Text, { style: s.sigLabel }, `${label}:`),
              createElement(View, { style: s.sigLine }),
            )
          ),
        ),
      ),
    ),
    pageFooter,
  );

  return createElement(Document, { title: `Offer Letter - ${letter.name}` }, page1, page2);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const isPreview = req.nextUrl.searchParams.has("preview");

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // Verify authenticated admin — double-check even though RLS enforces it
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await sb.from("offer_letters").select("*").eq("id", id).single();
  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const letter = data as OfferLetter;

  // Non-preview download: redirect to stored bucket URL if available (fast path)
  // Preview ALWAYS re-renders so edits are reflected immediately.
  if (!isPreview && letter.pdf_url) {
    return NextResponse.redirect(letter.pdf_url);
  }

  // From here we must render — either it's a preview or no cached URL exists.

  const pub = path.join(process.cwd(), "public");

  // Header & footer: clean JPEG at full A4 width (1200px → sharp compresses nicely)
  const [headerB64, footerB64, signB64, stampB64] = await Promise.all([
    toCleanJpegBase64(path.join(pub, "headerpdf.png"),      1200),
    toCleanJpegBase64(path.join(pub, "footertemplate.png"), 1200),
    toTransparentPngBase64(path.join(pub, "sign.png"),       350),
    toCleanJpegBase64(path.join(pub, "stamp.png"),           200),
  ]);
  const logoB64 = toBase64(path.join(pub, "logo-removebg-preview.png"));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(buildPDF(letter, headerB64, footerB64, logoB64, signB64, stampB64) as any);
  const uint8  = new Uint8Array(buffer);

  // Upload to storage and save URL
  const storagePath = `offer-letters/${letter.employee_id}_${letter.name.replace(/\s+/g, "_")}.pdf`;
  const { error: uploadErr } = await sb.storage
    .from(BUCKET)
    .upload(storagePath, uint8, { contentType: "application/pdf", upsert: true });

  if (!uploadErr) {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
    await sb.from("offer_letters").update({ pdf_url: publicUrl }).eq("id", id);
  }

  const filename = `OfferLetter_${letter.employee_id}_${letter.name.replace(/\s+/g, "_")}.pdf`;
  // Preview: inline so browser renders in iframe. Download: attachment.
  const disposition = isPreview
    ? `inline; filename="${filename}"`
    : `attachment; filename="${filename}"`;

  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
    },
  });
}
