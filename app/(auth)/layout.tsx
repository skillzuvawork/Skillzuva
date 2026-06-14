import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "#003A99" }}
      >
        {/* Background circles */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full border border-white/10" />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute top-1/2 right-[-40px] w-48 h-48 rounded-full border border-white/10" />

        {/* Logo */}
        <Link href="/" className="relative z-10">
          <Image
            src="/logo-removebg-preview.png"
            alt="SkillZuva"
            width={180}
            height={60}
            style={{ width: 180, height: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }}
            priority
          />
        </Link>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-8">
            Transform Knowledge<br />Into Skills
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "12,000+", label: "Active Students" },
              { value: "80+", label: "Courses" },
              { value: "30+", label: "Expert Instructors" },
              { value: "94%", label: "Completion Rate" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-blue-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 rounded-xl p-5">
          <p className="text-sm text-blue-100 italic leading-relaxed mb-3">
            &ldquo;SkillZuva&apos;s Digital Marketing course helped me land my first marketing role. The content is practical and instructor support is excellent.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
              PS
            </div>
            <div>
              <p className="text-sm font-medium text-white">Pooja Sharma</p>
              <p className="text-xs text-blue-300">MBA Student, SIBM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 bg-gray-50">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <Image
              src="/logo-removebg-preview.png"
              alt="SkillZuva"
              width={160}
              height={52}
              style={{ width: 160, height: "auto", objectFit: "contain" }}
              priority
            />
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
