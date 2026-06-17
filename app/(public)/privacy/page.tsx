import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how SkillZuva collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: June 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-600">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introduction</h2>
          <p>SkillZuva Technologies (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use the SkillZuva platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> Name, email address, phone number, college/university details.</li>
            <li><strong>Usage data:</strong> Course progress, completion status, quiz scores, login activity.</li>
            <li><strong>Payment data:</strong> Transaction records (we do not store full card numbers).</li>
            <li><strong>Technical data:</strong> IP address, browser type, device info, cookies.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and improve our educational services.</li>
            <li>To process payments and manage enrollments.</li>
            <li>To send course updates, certificates, and account notifications.</li>
            <li>To analyse platform usage and improve user experience.</li>
            <li>To comply with legal obligations.</li>
          </ul>
          <p className="mt-2">We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Data Storage &amp; Security</h2>
          <p>Your data is stored securely using Supabase infrastructure with industry-standard encryption at rest and in transit (TLS/SSL). We implement role-based access controls to restrict data access to authorised personnel only.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Cookies</h2>
          <p>We use session cookies for authentication and preference cookies to improve your experience. You can disable cookies in your browser settings, but some platform features may not function correctly without them.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Third-Party Services</h2>
          <p>We use the following third-party services that may process your data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase</strong> — Database and authentication infrastructure.</li>
            <li><strong>Vercel</strong> — Hosting and deployment.</li>
          </ul>
          <p className="mt-2">Each service has its own privacy policy and data processing agreements.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Your Rights</h2>
          <p>Under applicable Indian data protection laws, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Withdraw consent for marketing communications at any time.</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <a href="mailto:info@skillzuvatechnologies.com" className="text-[#003A99] underline">info@skillzuvatechnologies.com</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Data Retention</h2>
          <p>We retain your account data for as long as your account is active or as required for legal compliance. Upon account deletion request, data is removed within 30 days except where retention is required by law.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on the platform. Continued use after changes constitutes acceptance.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Contact</h2>
          <p>For privacy-related queries:<br />
            <a href="mailto:info@skillzuvatechnologies.com" className="text-[#003A99] underline">info@skillzuvatechnologies.com</a><br />
            SkillZuva Technologies, Hyderabad, Telangana, India
          </p>
        </section>
      </div>
    </div>
  );
}
