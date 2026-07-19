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
  Font,
} from "@react-pdf/renderer";
import path from "path";
import fs from "fs";

// Helvetica (built-in PDF font) has no ₹ (U+20B9) glyph — register Noto Sans, which does.
Font.register({
  family: "NotoSans",
  src: path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf"),
});
Font.register({
  family: "NotoSans-Bold",
  src: path.join(process.cwd(), "public", "fonts", "NotoSans-Bold.ttf"),
});
// Keep whole words when wrapping (no "process-es" style hyphen splits)
Font.registerHyphenationCallback((word) => [word]);
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


const s = StyleSheet.create({
  page: {
    fontFamily: "NotoSans",
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
    fontFamily: "NotoSans-Bold",
    color: BLUE,
    letterSpacing: 2,
    lineHeight: 1.15,
    marginBottom: 3,
  },
  cinRow:  { textAlign: "center", fontSize: 9, fontFamily: "NotoSans-Bold", color: BLUE, lineHeight: 1.15, marginBottom: 2 },
  address: { textAlign: "center", fontSize: 9, fontFamily: "NotoSans-Bold", color: BLUE, lineHeight: 1.15, marginBottom: 6 },
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
  empId: { fontSize: 10.5, fontFamily: "NotoSans-Bold", color: ORANGE, lineHeight: 1.15 },

  logoRow:     { alignItems: "center", marginBottom: 4, marginTop: 2 },
  visibleLogo: { width: 190, height: 130, objectFit: "contain" },

  greeting: {
    textAlign: "center",
    fontFamily: "NotoSans-Bold",
    fontSize: 12,
    color: BLACK,
    lineHeight: 1.15,
    marginBottom: 10,
  },

  dateRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 },
  dateText: { fontSize: 11, color: BLACK, lineHeight: 1.15 },

  dear:  { fontFamily: "NotoSans-Bold", fontSize: 11, color: BLACK, lineHeight: 1.15, marginBottom: 10 },
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
  footerContactText: { fontSize: 8.5, color: BLUE, fontFamily: "NotoSans-Bold" },
  footerImg:      { width: 595, height: FOOTER_H },

  // ── Watermark ─────────────────────────────────────────────
  watermarkWrap: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  watermarkImg: { width: 320, height: 220, objectFit: "contain", opacity: 0.06 },

  // ── Section headings & bullets (page 1) ──────────────────
  sectionTitle: {
    fontSize: 11,
    fontFamily: "NotoSans-Bold",
    color: BLUE,
    lineHeight: 1.15,
    marginTop: 10,
    marginBottom: 5,
  },
  bulletRow: { flexDirection: "row", marginBottom: 5, paddingLeft: 4 },
  bullet:    { fontSize: 11, color: BLACK, lineHeight: 1.15, width: 12, marginTop: 0 },
  bulletText:{ fontSize: 10.5, color: BLACK, lineHeight: 1.6, flex: 1 },

  // ── Signature ─────────────────────────────────────────────
  sigRow:        { flexDirection: "row", alignItems: "flex-end", marginTop: 18, gap: 80 },
  sigLeft:       { flexDirection: "column" },
  sigAndStamp:   { position: "relative", width: 120, height: 90, marginBottom: 3 },
  stampImg:      { position: "absolute", top: 0, left: 10, width: 88, height: 88, objectFit: "contain" },
  sigImg:        { position: "absolute", bottom: 0, left: 0, width: 110, height: 52, objectFit: "contain" },
  sigName:       { fontSize: 9.5, fontFamily: "NotoSans-Bold", color: BLACK },
  sigRole:       { fontSize: 9,   color: GRAY },
  sigRight:      { flexDirection: "column", gap: 10 },
  sigFieldRow:   { flexDirection: "column" },
  sigLabel:      { fontSize: 9.5, color: BLACK, fontFamily: "NotoSans-Bold", marginBottom: 3 },
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

      // Date right-aligned
      createElement(View, { style: s.dateRow },
        createElement(Text, { style: s.dateText }, `Date: ${formatDate(letter.date)}`),
      ),

      // To block
      createElement(Text, { style: { fontSize: 11, color: BLACK, lineHeight: 1.15, marginBottom: 2 } }, "To,"),
      createElement(Text, { style: { fontSize: 11, fontFamily: "NotoSans-Bold", color: BLACK, lineHeight: 1.15, marginBottom: 10 } }, letter.name),

      // Subject
      createElement(View, { style: { flexDirection: "row", marginBottom: 10 } },
        createElement(Text, { style: { fontSize: 11, fontFamily: "NotoSans-Bold", color: BLACK, lineHeight: 1.15 } }, "Subject: "),
        createElement(Text, { style: { fontSize: 11, color: BLACK, lineHeight: 1.15 } }, `Offer for ${letter.title} (Sales Intern)`),
      ),

      createElement(Text, { style: s.dear }, `Dear ${letter.name},`),
      createElement(Text, { style: { fontSize: 12, fontFamily: "NotoSans-Bold", color: BLACK, lineHeight: 1.15, marginBottom: 8 } }, "Congratulations!"),
      createElement(Text, { style: s.para },
        `We are pleased to offer you the position of ${letter.title} (Sales Intern) at SKILLZUVA TECHNOLOGIES. We are excited to welcome you to our team and look forward to your contribution and growth during the internship period.`
      ),

      // Internship Details section
      createElement(Text, { style: s.sectionTitle }, "Internship Details"),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, `Position: ${letter.title} (Sales Intern)`),
      ),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, "Internship Duration: 3 Months"),
      ),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText },
          `Joining Date: ${letter.joining_date ? formatDate(letter.joining_date) : "To be communicated"}`
        ),
      ),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, "Work Mode: Remote / Work from Office"),
      ),

      // Training Period
      createElement(Text, { style: s.sectionTitle }, "Training Period"),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, "The first 15 days of the internship will be considered as a training period."),
      ),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, "The training period will be unpaid and will focus on helping you understand the company's processes, products, and work expectations."),
      ),

    ),
    pageFooter,
  );

  // ── PAGE 2 ────────────────────────────────────────────────
  const page2 = createElement(Page, { size: "A4", style: s.page },
    page2Header,
    watermark,
    createElement(View, { style: s.body },

      // Compensation
      createElement(Text, { style: s.sectionTitle }, "Compensation"),
      createElement(Text, { style: s.para },
        `The total earning opportunity during the internship is up to ₹${letter.stipend.toLocaleString("en-IN")} per month, structured as follows:`
      ),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, "Fixed Stipend: ₹5,000 per month will be provided upon generating a minimum of ₹10,000 in revenue through successful course enrollments."),
      ),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, "Variable Incentives: Additional incentives of up to ₹10,000 per month can be earned based on individual performance, successful course enrollments, and achievement of assigned targets."),
      ),

      // Performance Expectations
      createElement(Text, { style: s.sectionTitle }, "Performance Expectations"),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, "The expected monthly target is 25 successful course enrollments (closures)."),
      ),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, "Performance will be reviewed based on productivity, conversions, and overall contribution."),
      ),

      // Leave & Notice Period
      createElement(Text, { style: s.sectionTitle }, "Leave & Notice Period"),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, "No paid leaves will be provided during the internship period."),
      ),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, "Any leave requirement must be communicated and approved by the reporting manager."),
      ),
      createElement(View, { style: s.bulletRow, wrap: false },
        createElement(Text, { style: s.bullet }, "•"),
        createElement(Text, { style: s.bulletText }, "A 15-day notice period is applicable in case of discontinuation of the internship by the intern. Failure to serve the required notice period may impact the final settlement."),
      ),

      // Acceptance of Offer
      createElement(Text, { style: s.sectionTitle }, "Acceptance of Offer"),
      createElement(Text, { style: s.para },
        "If you accept this offer, kindly confirm your acceptance and complete the required joining formalities."
      ),
      createElement(Text, { style: s.para },
        "We look forward to having you as a part of SKILLZUVA TECHNOLOGIES and wish you a successful internship journey."
      ),

      // Sign-off: "Best Regards," then stamp+sign floating behind HR Team / SKILLZUVA TECHNOLOGIES
      createElement(Text, { style: { fontSize: 11, color: BLACK, lineHeight: 1.15, marginBottom: 2, marginTop: 4 } }, "Best Regards,"),
      createElement(View, { style: { position: "relative", height: 62, marginBottom: 0 } },
        createElement(PDFImage, { src: stampB64, style: { position: "absolute", top: 0, left: 2, width: 60, height: 60, objectFit: "contain", opacity: 0.92 } }),
        createElement(PDFImage, { src: signB64,  style: { position: "absolute", bottom: 0, left: 0, width: 80, height: 36, objectFit: "contain" } }),
        createElement(Text, { style: { position: "absolute", bottom: 14, left: 0, fontSize: 11, fontFamily: "NotoSans-Bold", color: BLACK, lineHeight: 1.15 } }, "HR Team"),
        createElement(Text, { style: { position: "absolute", bottom: 0, left: 0, fontSize: 11, color: BLACK, lineHeight: 1.15 } }, "SKILLZUVA TECHNOLOGIES"),
      ),

      // Candidate acceptance block
      createElement(View, { style: { borderTopWidth: 1, borderTopColor: "#cccccc", paddingTop: 10, marginTop: 14 } },
        createElement(Text, { style: { fontSize: 11, fontFamily: "NotoSans-Bold", color: BLACK, lineHeight: 1.15, marginBottom: 6 } }, "Candidate Acceptance"),
        createElement(Text, { style: { fontSize: 11, color: BLACK, lineHeight: 1.4, marginBottom: 14 } },
          "I, ________________________, accept the offer for the position of " +
          `${letter.title} (Sales Intern) and agree to the terms mentioned above.`
        ),
        createElement(View, { style: { flexDirection: "row", gap: 40 } },
          createElement(View, null,
            createElement(Text, { style: { fontSize: 10, color: BLACK, lineHeight: 1.15, marginBottom: 4 } }, "Signature:"),
            createElement(View, { style: { borderBottomWidth: 1, borderBottomColor: BLACK, width: 160 } }),
          ),
          createElement(View, null,
            createElement(Text, { style: { fontSize: 10, color: BLACK, lineHeight: 1.15, marginBottom: 4 } }, "Date:"),
            createElement(View, { style: { borderBottomWidth: 1, borderBottomColor: BLACK, width: 120 } }),
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
