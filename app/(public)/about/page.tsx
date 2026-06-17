import type { Metadata } from "next";
import SectionHeading from "@/components/SectionHeading";
import { Target, Eye, Lightbulb, Heart, Users, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — SkillZuva",
  description: "Learn about SkillZuva — our mission, vision, team, and values.",
};

const team = [
  { initials: "DSB", name: "Dudekula Siddik Basha", role: "Founder & CEO" },
  { initials: "DRH", name: "Dudekula Rizwana Hussain", role: "Co-Founder" },
  { initials: "BJS", name: "Battula Jaya SaiRam", role: "Managing Director" },
  { initials: "ST", name: "Siddhartha Teluguntla", role: "CFO" },
  { initials: "RRT", name: "Sampangi Vamshi", role: "Business Unit Director" },
];

const values = [
  { icon: Lightbulb, title: "Innovation", desc: "Constantly evolving our teaching methods." },
  { icon: Heart, title: "Passion", desc: "Driven by love for education." },
  { icon: Users, title: "Community", desc: "Building a supportive learning network." },
  { icon: ShieldCheck, title: "Integrity", desc: "Transparent and honest in everything." },
];

const impact = [
  { title: "Industry-Aligned Learning", desc: "Our curriculum is reviewed to align with current hiring trends and practical project workflows." },
  { title: "Mentorship-First Approach", desc: "Students receive mentor guidance, regular checkpoints, and clear improvement paths." },
  { title: "Career Acceleration", desc: "From portfolio guidance to interview preparation, we support career growth beyond course completion." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20" style={{ backgroundColor: "#003A99" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5" style={{ backgroundColor: "#FF6B1A", color: "#fff" }}>
            About SkillZuva
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            About SkillZuva Technologies
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-2xl mx-auto">
            We&apos;re on a mission to democratize quality education and empower the next generation of skilled innovators.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{ color: "#FF6B1A", backgroundColor: "#fff5f0" }}>
                Our Story
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                A Platform Built by Educators and Industry Experts
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Founded in 2022, SkillZuva was born out of a simple belief: quality education should be accessible to everyone. Our founders, experienced tech professionals and educators, saw a gap between what traditional institutions taught and what the industry needed.
              </p>
              <p className="text-gray-500 leading-relaxed mb-4">
                Starting with just 3 courses and 50 students, we&apos;ve grown to a thriving community of over 500 learners across 5+ courses. Our project-based approach ensures students don&apos;t just learn theory — they build real-world skills that employers value.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Today, we work with students, early professionals, and institutions to bridge the gap between classroom knowledge and job-ready capabilities. Every program at SkillZuva combines conceptual clarity with execution discipline so learners can confidently solve real business and technical problems.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {[
                { value: "500+", label: "Students Enrolled" },
                { value: "5+", label: "Courses Available" },
                { value: "2022", label: "Founded" },
                { value: "100%", label: "Career Focused" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl p-6 text-center border border-gray-100 shadow-sm">
                  <p className="text-3xl font-bold mb-1" style={{ color: "#003A99" }}>{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl p-8 text-white" style={{ backgroundColor: "#003A99" }}>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-blue-100 leading-relaxed">
                To provide accessible, industry-relevant, and practical tech education that empowers individuals to achieve their career goals and drive innovation.
              </p>
              <p className="text-blue-100 leading-relaxed mt-3">
                We focus on clarity, consistency, and confidence: clear roadmaps, consistent practice, and confidence through real implementation.
              </p>
            </div>

            <div className="rounded-2xl p-8 text-white" style={{ backgroundColor: "#FF6B1A" }}>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-orange-100 leading-relaxed">
                To become the leading EdTech platform in India, recognized for transforming lives through technology education and fostering a generation of skilled innovators.
              </p>
              <p className="text-orange-100 leading-relaxed mt-3">
                We aim to build a learning ecosystem where outcomes are measurable, mentorship is continuous, and opportunities are inclusive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Create Impact */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Our Approach"
            title="How We Create Impact"
            subtitle="Our training model combines structured learning, real-world execution, and career guidance."
          />
          <div className="grid sm:grid-cols-3 gap-6">
            {impact.map((item, i) => (
              <div key={item.title} className="rounded-xl p-6 border border-gray-100 shadow-sm text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg" style={{ backgroundColor: "#003A99" }}>
                  {i + 1}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="Our People"
            title="Meet Our Team"
            subtitle="The passionate people behind your learning journey."
          />
          <div className="flex flex-wrap justify-center gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center w-48">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-sm" style={{ backgroundColor: "#003A99" }}>
                  {member.initials}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-xs font-medium" style={{ color: "#FF6B1A" }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            label="What Drives Us"
            title="Our Values"
            subtitle="The principles that guide every decision we make at SkillZuva."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val) => (
              <div key={val.title} className="text-center p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#e8f0fe" }}>
                  <val.icon className="w-6 h-6" style={{ color: "#003A99" }} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{val.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
