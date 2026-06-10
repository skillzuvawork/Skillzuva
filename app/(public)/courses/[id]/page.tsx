import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCourseBySlugServer, getAllCoursesServer } from "@/services/courses";
import { isEnrolledServer } from "@/services/enrollments";
import BuyCourseButton from "@/components/BuyCourseButton";
import {
  Star, Clock, Users, CheckCircle, ArrowLeft,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseBySlugServer(id);
  if (!course) return { title: "Course Not Found" };
  return {
    title: course.title,
    description: course.short_description ?? course.description ?? undefined,
    openGraph: { title: course.title, description: course.short_description ?? undefined },
  };
}

export async function generateStaticParams() {
  try {
    const courses = await getAllCoursesServer();
    return courses.map((c) => ({ id: c.slug }));
  } catch {
    return [];
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const { id: slug } = await params;
  const course = await getCourseBySlugServer(slug);
  if (!course) notFound();

  const enrolled = await isEnrolledServer(course.id).catch(() => false);
  const price = course.discount_price ?? course.price;
  const discount = course.discount_price ? Math.round((1 - course.discount_price / course.price) * 100) : 0;
  const instructor = course.instructors;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner */}
      <section className="py-12" style={{ backgroundColor: "#003A99" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-blue-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.category && (
                  <Badge className="text-xs text-white border-0" style={{ backgroundColor: "#FF6B1A" }}>{course.category}</Badge>
                )}
                {course.level && (
                  <Badge className="text-xs text-white border-0 bg-white/20">{course.level}</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{course.title}</h1>
              <p className="text-blue-100 text-base leading-relaxed mb-6">
                {course.short_description ?? course.description}
              </p>
              <div className="flex flex-wrap gap-5 text-sm text-blue-100">
                {course.rating && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-[#FF6B1A] text-[#FF6B1A]" />
                    <span className="font-semibold text-white">{course.rating}</span>
                    <span>rating</span>
                  </div>
                )}
                {course.total_students ? (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{course.total_students.toLocaleString()} students</span>
                  </div>
                ) : null}
                {course.duration_hours ? (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration_hours} hours</span>
                  </div>
                ) : null}
              </div>

              {instructor && (
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: "#FF6B1A" }}>
                    {instructor.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{instructor.name}</p>
                    {instructor.company_name && <p className="text-blue-200 text-xs">{instructor.company_name}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-xl sticky top-20">
                <div className="mb-5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold" style={{ color: "#003A99" }}>₹{price.toLocaleString()}</span>
                    {discount > 0 && (
                      <span className="text-gray-400 line-through text-lg">₹{course.price.toLocaleString()}</span>
                    )}
                  </div>
                  {discount > 0 && (
                    <span className="inline-block text-sm font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#FF6B1A" }}>
                      {discount}% OFF
                    </span>
                  )}
                </div>

                {enrolled ? (
                  <Link href="/dashboard/student/courses">
                    <Button className="w-full text-white font-semibold h-12 text-base mb-3 bg-green-600 hover:bg-green-700">
                      Go to My Courses
                    </Button>
                  </Link>
                ) : (
                  <BuyCourseButton courseId={course.id} courseTitle={course.title} price={price} />
                )}

                <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                  {[
                    course.duration_hours ? `${course.duration_hours} hours of content` : null,
                    "Lifetime access",
                    "Certificate of completion",
                    "Access on mobile & desktop",
                  ].filter(Boolean).map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#003A99" }} />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {course.description && (
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
                </div>
              )}

              {instructor && (
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-5">About the Instructor</h2>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0" style={{ backgroundColor: "#003A99" }}>
                      {instructor.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{instructor.name}</h3>
                      {instructor.company_name && <p className="text-sm font-medium" style={{ color: "#FF6B1A" }}>{instructor.company_name}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            
          </div>
        </div>
      </section>
    </div>
  );
}
