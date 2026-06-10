import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CourseCard from "@/components/CourseCard";
import TestimonialCard from "@/components/TestimonialCard";
import SectionHeading from "@/components/SectionHeading";
import { testimonials } from "@/data/testimonials";
import { faqs } from "@/data/faqs";
import { getPublishedCoursesServer } from "@/services/courses";
import {
  ArrowRight, CheckCircle, BookOpen, Users, Award, TrendingUp,
  BarChart2, Briefcase, PenTool, FileText, UserCheck, Receipt, ShieldCheck,
} from "lucide-react";

export const revalidate = 3600; // revalidate homepage every 1 hour (ISR)

const categories = [
  { name: "Digital Marketing", icon: TrendingUp, href: "/courses/digital-marketing-with-ai" },
  { name: "HR Management", icon: Users, href: "/courses/human-resource-management" },
  { name: "Business Analytics", icon: BarChart2, href: "/courses/business-analytics-excel-power-bi" },
  { name: "Finance & GST", icon: Receipt, href: "/courses/finance-gst-practitioner" },
  { name: "HR Business Partner", icon: Briefcase, href: "/courses/hr-business-partner" },
  { name: "Labour Law", icon: FileText, href: "/courses/hr-labour-law-compliance" },
  { name: "Graphic Design", icon: PenTool, href: "/courses/graphic-design-content-creation" },
  { name: "HR with SEO", icon: UserCheck, href: "/courses/digital-marketing-with-seo" },
];

const whyUs = [
  { icon: BookOpen, title: "Structured Learning Paths", desc: "Every course is built by industry experts with clear learning objectives, structured modules, and real-world projects." },
  { icon: Award, title: "Recognized Certificates", desc: "Earn certificates valued by employers. Add them to your LinkedIn profile and resume to stand out." },
  { icon: Users, title: "Community Learning", desc: "Join thousands of students, participate in discussions, and learn alongside peers from top colleges." },
  { icon: TrendingUp, title: "Career-Focused Content", desc: "Courses designed around actual industry requirements — not just theory. Gain skills you can apply from day one." },
  { icon: CheckCircle, title: "Lifetime Access", desc: "Purchase once and access forever. Get all future updates to the course material at no additional cost." },
  { icon: ShieldCheck, title: "7-Day Money Back", desc: "Not satisfied? Get a full refund within 7 days, no questions asked. Your learning investment is completely safe." },
];

// Isolated async component — only this part waits for Supabase
async function FeaturedCourses() {
  const courses = await getPublishedCoursesServer().catch(() => []);
  const featured = courses.slice(0, 4);

  if (featured.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Courses coming soon.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {featured.map((course) => <CourseCard key={course.id} course={course} />)}
    </div>
  );
}

function FeaturedCoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm h-80 animate-pulse">
          <div className="h-44 bg-gray-100 rounded-t-xl" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero — renders instantly, no data dependency */}
      <section className="relative py-20 md:py-28 overflow-hidden" style={{ backgroundColor: "#003A99" }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full border border-white" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full border border-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-white" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6" style={{ backgroundColor: "#FF6B1A", color: "#fff" }}>
              India&apos;s #1 Business Skills Platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Transform Knowledge<br />
              <span style={{ color: "#FF6B1A" }}>Into Skills</span>
            </h1>
            <p className="text-base md:text-lg text-blue-100 leading-relaxed mb-8 max-w-xl">
              Learn industry-relevant business, finance, marketing, communication and management skills through structured online courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses">
                <Button size="lg" className="text-white font-semibold px-8 shadow-lg" style={{ backgroundColor: "#FF6B1A" }}>
                  Explore Courses <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" className="font-semibold px-8 bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#003A99] transition-colors">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses — streams in after Supabase responds */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Top Rated" title="Featured Courses" subtitle="Handpicked courses designed for business, commerce, and management students ready to upskill." />
          <Suspense fallback={<FeaturedCoursesSkeleton />}>
            <FeaturedCourses />
          </Suspense>
          <div className="text-center mt-10">
            <Link href="/courses">
              <Button size="lg" variant="outline" className="font-semibold border-[#003A99] text-[#003A99] hover:bg-[#003A99] hover:text-white transition-colors">
                View All Courses <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why SkillZuva — static, renders instantly */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Why Us" title="Why Choose SkillZuva?" subtitle="We're built for Indian students and professionals who want practical, career-ready skills — not just theoretical knowledge." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyUs.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: "#e8f0fe" }}>
                  <item.icon className="w-5 h-5" style={{ color: "#003A99" }} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories — static */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Explore" title="Learning Categories" subtitle="Browse by category and find the perfect course for your career goals." />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href}
                className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#003A99] transition-all text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform" style={{ backgroundColor: "#e8f0fe" }}>
                  <cat.icon className="w-6 h-6" style={{ color: "#003A99" }} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#003A99] transition-colors">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — static */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Students Love Us" title="What Our Students Say" subtitle="Real stories from students who transformed their skills and careers with SkillZuva." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => <TestimonialCard key={t.id} testimonial={t} index={i} />)}
          </div>
        </div>
      </section>

      {/* FAQ — static */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="FAQ" title="Frequently Asked Questions" subtitle="Everything you need to know about SkillZuva and our courses." />
          <Accordion className="space-y-3">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="bg-white border border-gray-100 rounded-xl px-5 shadow-sm">
                <AccordionTrigger className="text-sm font-medium text-gray-900 text-left py-4 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-500 leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA — static */}
      <section className="py-20" style={{ backgroundColor: "#003A99" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Build Your Skills?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Start your journey today with courses built for India&apos;s growing economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" className="text-white font-semibold px-10" style={{ backgroundColor: "#FF6B1A" }}>
                Start Learning Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" className="font-semibold px-10 bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#003A99] transition-colors">
                Talk to Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
