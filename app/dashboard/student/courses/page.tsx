import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProfileServer } from "@/services/profiles";
import { getMyEnrollmentsServer } from "@/services/enrollments";
import type { EnrollmentWithCourse } from "@/types/database";
import { BookOpen, ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = { title: "My Courses" };

export default async function MyCoursesPage() {
  const profile = await getProfileServer();
  if (!profile) redirect("/login");

  const enrollments = await getMyEnrollmentsServer().catch(() => []);

  const initials = (profile.full_name ?? "ST").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <DashboardHeader title="My Courses" userName={profile.full_name ?? "Student"} userInitials={initials} />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{enrollments.length} course{enrollments.length !== 1 ? "s" : ""} enrolled</p>
          <Link href="/courses">
            <Button className="text-white text-sm" style={{ backgroundColor: "#003A99" }}>
              Browse More <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "#003A99" }} />
            <h3 className="text-base font-semibold text-gray-700 mb-2">No courses yet</h3>
            <p className="text-sm text-gray-400 mb-5">Enroll in a course to start learning.</p>
            <Link href="/courses">
              <Button className="text-white" style={{ backgroundColor: "#003A99" }}>Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrollments.map((enrollment) => {
              const course = enrollment.courses;
              return (
                <div key={enrollment.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="h-32 flex items-center justify-center" style={{ backgroundColor: "#e8f0fe" }}>
                    <BookOpen className="w-10 h-10" style={{ color: "#003A99" }} />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 leading-snug">{course?.title ?? "Course"}</h3>
                      <Badge className="text-xs text-white border-0 shrink-0 flex items-center gap-1" style={{ backgroundColor: "#16a34a" }}>
                        <CheckCircle className="w-3 h-3" /> Enrolled
                      </Badge>
                    </div>
                    {course?.category && <p className="text-xs text-gray-400 mb-1">{course.category}</p>}
                    <p className="text-xs text-gray-400 mb-5">
                      Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 capitalize">{enrollment.access_type} access</span>
                      <Link href={`/courses/${course?.slug ?? ""}`}>
                        <Button size="sm" className="text-xs h-7 text-white" style={{ backgroundColor: "#003A99" }}>
                          View Course
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

