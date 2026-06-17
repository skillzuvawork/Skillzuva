import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

const courseLinks = [
  { label: "Digital Marketing with AI", href: "/courses/digital-marketing-with-ai" },
  { label: "Digital Marketing with SEO", href: "/courses/digital-marketing-with-seo" },
  { label: "HR & Labour Law Compliance", href: "/courses/hr-labour-law-compliance" },
  { label: "Human Resource Management", href: "/courses/human-resource-management" },
  { label: "HR Business Partner", href: "/courses/hr-business-partner" },
  { label: "Finance & GST Practitioner", href: "/courses/finance-gst-practitioner" },
  { label: "Business Analytics", href: "/courses/business-analytics-excel-power-bi" },
  { label: "Graphic Design & Content Creation", href: "/courses/graphic-design-content-creation" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Contact", href: "/contact" },
  { label: "Student Dashboard", href: "/dashboard/student" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Brand + Contact */}
          <div>
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logo-removebg-preview.png"
                alt="SkillZuva"
                width={0}
                height={0}
                sizes="180px"
                style={{ width: "180px", height: "auto", objectFit: "contain" }}
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              India&apos;s premier online learning platform for business, finance, marketing, and professional skills.
            </p>
            <div className="flex flex-col gap-2.5 text-sm text-gray-400">
              <a href="mailto:info@skillzuvatechnologies.com" className="flex items-start gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-[#FF6B1A] shrink-0 mt-0.5" />
                <span>info@skillzuvatechnologies.com</span>
              </a>
              <a href="tel:+919381021835" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4 text-[#FF6B1A] shrink-0" />
                <span>+91 93810 21835</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B1A] shrink-0 mt-0.5" />
                <span>First Floor, Mind Space, Hitech City,<br />Hyderabad, Telangana</span>
              </div>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Our Courses</h3>
            <ul className="space-y-2">
              {courseLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SkillZuva. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-white transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
