import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/StatCard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getProfileServer } from "@/services/profiles";
import { getMyEnrollmentsServer } from "@/services/enrollments";
import { getAllProgressServer } from "@/services/progress";
import { BookOpen, CheckCircle, PlayCircle, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Student Dashboard" };

export default async function StudentDashboardPage() {
  const profile = await getProfileServer();
  if (!profile) redirect("/login");

  const [enrollments, allProgress] = await Promise.all([
    getMyEnrollmentsServer().catch(() => []),
    getAllProgressServer().catch(() => []),
  ]);

  const totalCourses = enrollments.length;
  const completedVideoIds = new Set(allProgress.filter((p) => p.completed).map((p) => p.video_id));

  const courseProgress = enrollments.map((e) => {
    const course = e.courses;
    const totalVideos = course?.total_videos ?? 0;
    const completedInCourse = allProgress.filter((p) => p.course_id === e.course_id && p.completed).length;
    const pct = totalVideos > 0 ? Math.round((completedInCourse / totalVideos) * 100) : 0;
    return { enrollment: e, course, completedInCourse, totalVideos, pct };
  });

  const completedCourses = courseProgress.filter((cp) => cp.pct === 100).length;
  const activeCourses = courseProgress.filter((cp) => cp.pct > 0 && cp.pct < 100).length;

  const firstName = profile.full_name?.split(" ")[0] ?? "Student";
  const initials = (profile.full_name ?? "ST").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <DashboardHeader title="Dashboard" userName={profile.full_name ?? "Student"} userInitials={initials} />
      <main className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Welcome back, {firstName}!</h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeCourses > 0
                ? `You have ${activeCourses} course${activeCourses > 1 ? "s" : ""} in progress. Keep going!`
                : totalCourses === 0
                ? "Start learning by enrolling in a course."
                : "All caught up!"}
            </p>
          </div>
          <Link href="/courses">
            <Button className="text-white text-sm hidden sm:flex" style={{ backgroundColor: "#003A99" }}>
              Browse Courses <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Enrolled Courses" value={totalCourses} icon={BookOpen} color="blue" />
          <StatCard label="Completed" value={completedCourses} icon={CheckCircle} color="orange" />
          <StatCard label="In Progress" value={activeCourses} icon={PlayCircle} color="blue" />
          <StatCard label="Videos Watched" value={completedVideoIds.size} icon={Clock} color="orange" />
        </div>

        {enrollments.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Continue Learning</h3>
              <Link href="/dashboard/student/courses" className="text-sm font-medium hover:underline" style={{ color: "#003A99" }}>
                View All
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseProgress.slice(0, 3).map(({ enrollment, course, completedInCourse, totalVideos, pct }) => (
                <div key={enrollment.id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="w-full h-24 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "#e8f0fe" }}>
                    <BookOpen className="w-8 h-8" style={{ color: "#003A99" }} />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{course?.title ?? "Course"}</h4>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{completedInCourse}/{totalVideos || "?"} videos</span>
                      <span className="font-medium" style={{ color: pct === 100 ? "#16a34a" : "#003A99" }}>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">
                      {new Date(enrollment.enrolled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                    <Link href={`/courses/${course?.slug ?? ""}`}>
                      <Button size="sm" className="text-xs h-7 text-white" style={{ backgroundColor: pct === 100 ? "#16a34a" : "#003A99" }}>
                        {pct === 100 ? "Review" : "Continue"}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "#003A99" }} />
            <h3 className="text-base font-semibold text-gray-700 mb-2">No courses yet</h3>
            <p className="text-sm text-gray-400 mb-5">Browse our catalog and enroll in your first course.</p>
            <Link href="/courses">
              <Button className="text-white" style={{ backgroundColor: "#003A99" }}>Browse Courses</Button>
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
