import { CheckCircle, Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";

const contactCards = [
  {
    icon: MessageCircle,
    label: "WhatsApp / Phone",
    value: "+91 8885414673",
    href: "https://wa.me/918885414673",
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "info@skillvoratechnologies.in",
    href: "mailto:info@skillvoratechnologies.in",
    iconBg: "#e8f0fe",
    iconColor: "#003A99",
  },
  {
    icon: MapPin,
    label: "Find Us",
    value: "First Floor, Mind Space, Hitech City, Hyderabad, Telangana",
    href: "https://maps.google.com/?q=17.450132509662854,78.3631265957516",
    iconBg: "#fff5f0",
    iconColor: "#FF6B1A",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Mon–Sat, 9 AM – 6 PM IST",
    href: null,
    iconBg: "#f3f4f6",
    iconColor: "#6b7280",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-14" style={{ backgroundColor: "#003A99" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Contact Us</h1>
          <p className="text-blue-100 text-base max-w-lg mx-auto mb-6">
            Have questions or need help? Reach out — we&apos;re always happy to assist.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Reply within 24 hrs</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Trusted support</span>
            <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> Mon–Sat availability</span>
          </div>
        </div>
      </section>

      {/* Get in Touch */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Get in <span style={{ color: "#003A99" }}>Touch</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            {contactCards.map((card) => {
              const content = (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3 h-full transition-shadow hover:shadow-md">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: card.iconBg }}>
                    <card.icon className="w-6 h-6" style={{ color: card.iconColor }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{card.label}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.value}</p>
                </div>
              );

              return card.href ? (
                <a key={card.label} href={card.href} target="_blank" rel="noopener noreferrer" className="block">
                  {content}
                </a>
              ) : (
                <div key={card.label}>{content}</div>
              );
            })}
          </div>

          {/* Google Maps */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 h-64 shadow-sm">
            <iframe
              title="SkillZuva Office Location"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=17.450132509662854,78.3631265957516&z=16&output=embed"
            />
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/918885414673"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-center gap-2 w-full h-12 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#25D366" }}
          >
            <MessageCircle className="w-5 h-5" />
            Chat with us on WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
