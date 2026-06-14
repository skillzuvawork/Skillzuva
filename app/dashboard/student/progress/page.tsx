import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, PlayCircle, BookOpen } from "lucide-react";
import { getProfileServer } from "@/services/profiles";
import { getMyEnrollmentsServer } from "@/services/enrollments";
import { getAllProgressServer } from "@/services/progress";
import { getCourseVideosServer } from "@/services/courses";
import type { EnrollmentWithCourse, LessonProgress, CourseVideo } from "@/types/database";

export const metadata: Metadata = { title: "Learning Progress" };

export default async function ProgressPage() {
  const profile = await getProfileServer();
  if (!profile) redirect("/login");

  const [enrollments, allProgress] = await Promise.all([
    getMyEnrollmentsServer().catch(() => []),
    getAllProgressServer().catch(() => []),
  ]);

  // Fetch videos for each enrolled course
  const courseData = await Promise.all(
    enrollments.map(async (e) => {
      const videos: CourseVideo[] = await getCourseVideosServer(e.course_id).catch(() => []);
      const completedVideoIds = new Set(
        allProgress.filter((p) => p.course_id === e.course_id && p.completed).map((p) => p.video_id)
      );
      const pct = videos.length > 0 ? Math.round((completedVideoIds.size / videos.length) * 100) : 0;
      return { enrollment: e, course: e.courses, videos, completedVideoIds, pct };
    })
  );

  const completedCount = courseData.filter((cd) => cd.pct === 100).length;
  const inProgressCount = courseData.filter((cd) => cd.pct > 0 && cd.pct < 100).length;
  const notStartedCount = courseData.filter((cd) => cd.pct === 0).length;

  const initials = (profile.full_name ?? "ST").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <DashboardHeader title="Learning Progress" userName={profile.full_name ?? "Student"} userInitials={initials} />
      <main className="p-6 space-y-6">
        {/* Overall */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Overall Progress</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { label: "Completed", value: completedCount, color: "#16a34a" },
              { label: "In Progress", value: inProgressCount, color: "#003A99" },
              { label: "Not Started", value: notStartedCount, color: "#d1d5db" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-4xl font-bold mb-1" style={{ color: item.color }}>{item.value}</p>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {courseData.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "#003A99" }} />
            <p className="text-sm text-gray-400">No enrolled courses to show progress for.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {courseData.map(({ enrollment, course, videos, completedVideoIds, pct }) => (
              <div key={enrollment.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">{course?.title ?? "Course"}</h4>
                  <span className="text-sm font-bold" style={{ color: "#003A99" }}>{pct}%</span>
                </div>
                <Progress value={pct} className="h-2 mb-5" />
                {videos.length > 0 ? (
                  <div className="space-y-2">
                    {videos.map((video) => {
                      const completed = completedVideoIds.has(video.id);
                      return (
                        <div key={video.id} className="flex items-center gap-3">
                          {completed
                            ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#16a34a" }} />
                            : pct > 0
                            ? <PlayCircle className="w-4 h-4 shrink-0" style={{ color: "#003A99" }} />
                            : <Circle className="w-4 h-4 shrink-0 text-gray-300" />}
                          <span className={`text-sm ${!completed && pct === 0 ? "text-gray-400" : "text-gray-700"}`}>
                            {video.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No videos available yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

