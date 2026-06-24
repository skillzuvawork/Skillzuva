import {
  Document,
  Page,
  Text,
  View,
  Image as PDFImage,
  StyleSheet,
} from "@react-pdf/renderer";
import type { OfferLetter } from "@/types/database";

// Helvetica is built-in — no external font needed
const BLUE = "#003A99";
const ORANGE = "#FF6B1A";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#222",
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 48,
    position: "relative",
  },

  // ── Header band ──────────────────────────────────────────
  headerBand: {
    backgroundColor: BLUE,
    height: 8,
    marginHorizontal: -48,
    marginTop: -30,
    marginBottom: 0,
  },
  headerOrangeCornerLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 60,
    height: 60,
    backgroundColor: ORANGE,
  },
  headerOrangeCornerRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    backgroundColor: ORANGE,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 4,
  },
  logo: { width: 110, height: 36, objectFit: "contain" },

  // ── Company title ─────────────────────────────────────────
  companyName: {
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    letterSpacing: 1.2,
    marginTop: 8,
  },
  cinRow: {
    textAlign: "center",
    fontSize: 7.5,
    color: "#333",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  address: {
    textAlign: "center",
    fontSize: 7.5,
    color: "#333",
    marginTop: 1,
  },
  divider: {
    borderBottomWidth: 1.5,
    borderBottomColor: BLUE,
    marginTop: 6,
    marginBottom: 8,
  },

  // ── Employee ID badge ─────────────────────────────────────
  empIdRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  empIdBadge: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
  },

  // ── Center logo (watermark-style) ─────────────────────────
  centerLogoWrap: {
    alignItems: "center",
    marginBottom: 6,
  },
  centerLogo: { width: 80, height: 26, objectFit: "contain" },

  // ── Greeting ──────────────────────────────────────────────
  greeting: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 10,
  },

  // ── Date ──────────────────────────────────────────────────
  dateRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  dateText: { fontSize: 9.5 },

  // ── Body text ─────────────────────────────────────────────
  dear: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 8 },
  para: { fontSize: 10, lineHeight: 1.6, marginBottom: 8, color: "#222" },
  titleLine: { fontSize: 10, marginBottom: 8 },
  titleValue: { fontFamily: "Helvetica-Bold" },

  // ── Footer band ───────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerBand: {
    backgroundColor: ORANGE,
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  footerText: { color: "#fff", fontSize: 8 },
  footerBlueLine: { backgroundColor: BLUE, height: 8 },

  // ── Page 2 ────────────────────────────────────────────────
  policyTitle: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: BLUE,
    marginBottom: 12,
    marginTop: 4,
  },
  policyItem: {
    fontSize: 9.5,
    lineHeight: 1.65,
    marginBottom: 7,
    color: "#222",
  },

  // ── Signature section ─────────────────────────────────────
  sigSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
  },
  sigLeft: { flexDirection: "column", gap: 2 },
  sigImg: { width: 90, height: 40, objectFit: "contain", marginBottom: 2 },
  stampImg: { width: 70, height: 70, objectFit: "contain", position: "absolute", bottom: 0, left: 60 },
  sigName: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  sigRole: { fontSize: 8.5, color: "#444" },

  sigRight: { flexDirection: "column", gap: 8 },
  sigField: { fontSize: 9.5 },
  sigLine: { borderBottomWidth: 1, borderBottomColor: "#333", width: 130, marginTop: 2 },
});

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "/");
}

function amountInWords(n: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
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
  "During the training period, the company reserves the right to terminate your services without providing any reason. You are required to give 15 days' notice should you wish to terminate your training before the end of your tenure.",
  "All information acquired during the course of your training shall be treated as strictly confidential. You shall refrain from using it for your own purposes or disclosing it to anyone outside the company.",
  "Upon conclusion of your tenure, you shall immediately return to the company all its property, equipment, and documents, including any electronically stored information.",
  "You will observe and comply with all policies and practices governing the conduct of the company's business and its employees.",
  "Upon successful completion of the training tenure, the candidate may be considered for a performance-based pre-placement offer from the company. The candidate is required to achieve an assigned target of 25 closures within 45 days.",
  "If he/she skips or is absent from daily meetings without informing the HR team, SkillVora reserves the right to terminate the training.",
  "If Skillzuva terminates the trainee, the final settlement of the stipend will be processed only after the completion of the 45-day training period. No stipend payment will be made during the training period.",
];

interface Props {
  letter: OfferLetter;
  logoBase64: string;
  signBase64: string;
  stampBase64: string;
}

function PageFooter() {
  return (
    <View style={s.footer} fixed>
      <View style={s.footerBand}>
        <Text style={s.footerText}>🌐 www.skillzuvatechnologies.com</Text>
        <Text style={s.footerText}>📞 +919381021835</Text>
        <Text style={s.footerText}>✉ info@skillzuvatechnologies.com</Text>
      </View>
      <View style={s.footerBlueLine} />
    </View>
  );
}

function PageHeader({ logoBase64 }: { logoBase64: string }) {
  return (
    <>
      <View style={s.headerBand} />
      <View style={s.headerRow}>
        <View style={{ width: 40 }} />
        <PDFImage src={logoBase64} style={s.logo} />
        <View style={{ width: 40 }} />
      </View>
      <Text style={s.companyName}>SKILLZUVA TECHNOLOGIES</Text>
      <Text style={s.cinRow}>CIN :- U62099AP2024OPC113625{"      "}REGISTRATION NO :- 113625</Text>
      <Text style={s.address}>1st Floor, Plot No: 25, 16, Jayabheri Enclave, Gachibowli, Hyderabad, Telangana 500032</Text>
      <View style={s.divider} />
    </>
  );
}

export default function OfferLetterPDF({ letter, logoBase64, signBase64, stampBase64 }: Props) {
  const stipendWords = amountInWords(Math.round(letter.stipend));

  return (
    <Document title={`Offer Letter - ${letter.name}`}>
      {/* ══ PAGE 1 — Offer Letter ══ */}
      <Page size="A4" style={s.page}>
        <PageHeader logoBase64={logoBase64} />

        <View style={s.empIdRow}>
          <Text style={s.empIdBadge}>EMPLOYEE ID :- {letter.employee_id}</Text>
        </View>

        <View style={s.centerLogoWrap}>
          <PDFImage src={logoBase64} style={s.centerLogo} />
        </View>

        <Text style={s.greeting}>Greetings from SKILLZUVA TECHNOLOGIES</Text>

        <View style={s.dateRow}>
          <Text style={s.dateText}>DATE :- {formatDate(letter.date)}</Text>
        </View>

        <Text style={s.dear}>Dear {letter.name.toUpperCase()}</Text>

        <Text style={s.para}>
          We congratulate you for being selected for a 3 Months INTERNSHIP PROGRAM at
          SKILLZUVA TECHNOLOGIES LLP. Ltd.
        </Text>

        <Text style={s.titleLine}>
          Title: <Text style={s.titleValue}>{letter.title}</Text>
        </Text>

        <Text style={s.para}>
          full-time opportunity will be offered based on your performance during the internship period.{"\n"}
          The compensation for the full-time role will be discussed at the time of conversion.
        </Text>

        <Text style={s.para}>
          Your stipend will be Rs. {letter.stipend.toLocaleString("en-IN")}/-{" "}
          ({stipendWords} Rupees)
        </Text>

        <Text style={s.para}>
          Working Hours: 10:30AM to 7:30PM, 9 Hours a day (Inc. Lunch Break).
        </Text>

        <Text style={s.para}>
          Job Type: Full-Time- Training Kindly note that Monday will be a day off.{"\n"}
          Location: Remote
        </Text>

        <Text style={s.para}>
          We look forward to your valuable contributions and to a mutually rewarding association
          with Skillzuva Technologies.
        </Text>

        <Text style={s.para}>To accept this offer, please confirm by email</Text>

        <PageFooter />
      </Page>

      {/* ══ PAGE 2 — Training Policy ══ */}
      <Page size="A4" style={s.page}>
        <PageHeader logoBase64={logoBase64} />

        <Text style={s.policyTitle}>Training Policy</Text>

        {POLICIES.map((text, i) => (
          <Text key={i} style={s.policyItem}>
            {i + 1}) {text}
          </Text>
        ))}

        {/* Signature + Stamp + Employee fields */}
        <View style={s.sigSection}>
          <View style={{ position: "relative" }}>
            <PDFImage src={signBase64} style={s.sigImg} />
            <PDFImage src={stampBase64} style={s.stampImg} />
            <Text style={s.sigName}>CH. Vaishnavi – HR Manager</Text>
            <Text style={s.sigRole}>Skillzuva Technologies</Text>
          </View>

          <View style={s.sigRight}>
            {["Employee Name", "Signature", "Date"].map((label) => (
              <View key={label}>
                <Text style={s.sigField}>{label}: </Text>
                <View style={s.sigLine} />
              </View>
            ))}
          </View>
        </View>

        <PageFooter />
      </Page>
    </Document>
  );
}
