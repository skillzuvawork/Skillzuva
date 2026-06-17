import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Read the Terms and Conditions for using SkillZuva's platform and courses.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms &amp; Conditions</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: June 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-600">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using the SkillZuva platform (&ldquo;Service&rdquo;) operated by SkillZuva Technologies (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Use of the Platform</h2>
          <p>SkillZuva provides online educational courses and learning resources. You agree to use the platform only for lawful purposes and in a manner that does not infringe the rights of others or restrict their use of the platform.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>You must be at least 16 years of age to use this Service.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You must not share your account or course access with others.</li>
            <li>Unauthorized reproduction or distribution of course content is strictly prohibited.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Course Enrollment &amp; Payment</h2>
          <p>Upon successful payment, you will receive lifetime access to the enrolled course. All payments are processed securely. Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Refund Policy</h2>
          <p>We offer a 7-day money-back guarantee on all courses. If you are not satisfied with a course, you may request a full refund within 7 days of purchase by contacting us at <a href="mailto:info@skillzuvatechnologies.com" className="text-[#003A99] underline">info@skillzuvatechnologies.com</a>. Refunds will not be issued after 7 days or if more than 30% of the course content has been accessed.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Intellectual Property</h2>
          <p>All content on the SkillZuva platform — including course videos, materials, graphics, and branding — is the intellectual property of SkillZuva Technologies and is protected under applicable copyright and trademark laws. You may not reproduce, distribute, or create derivative works without explicit written consent.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Certificates</h2>
          <p>Certificates of completion are issued upon successfully finishing a course. SkillZuva certificates are for educational purposes and do not constitute a professional license or accreditation unless explicitly stated.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Limitation of Liability</h2>
          <p>SkillZuva Technologies shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability to you shall not exceed the amount paid by you for the specific course in question.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated Terms. We will notify registered users of material changes via email.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Governing Law</h2>
          <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana, India.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Contact</h2>
          <p>For any questions regarding these Terms, contact us at:<br />
            <a href="mailto:info@skillzuvatechnologies.com" className="text-[#003A99] underline">info@skillzuvatechnologies.com</a><br />
            SkillZuva Technologies, Hyderabad, Telangana, India
          </p>
        </section>
      </div>
    </div>
  );
}
