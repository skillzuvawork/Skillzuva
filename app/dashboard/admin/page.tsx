import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/StatCard";
import { getProfileServer, getAllProfilesServer } from "@/services/profiles";
import { getAllCoursesServer } from "@/services/courses";
import { getAllEnrollmentsServer } from "@/services/enrollments";
import { getOrderStatsServer } from "@/services/orders";
import { Users, BookOpen, UserCheck, IndianRupee, TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const profile = await getProfileServer();
  if (!profile) redirect("/login");

  const [users, courses, enrollments, orderStats] = await Promise.all([
    getAllProfilesServer().catch(() => []),
    getAllCoursesServer().catch(() => []),
    getAllEnrollmentsServer().catch(() => []),
    getOrderStatsServer().catch(() => ({ total: 0, revenue: 0 })),
  ]);

  const publishedCourses = courses.filter((c) => c.is_published);
  const recentEnrollments = enrollments.slice(0, 6);

  return (
    <>
      <DashboardHeader title="Admin Dashboard" userName={profile.full_name ?? "Admin"} userInitials="AD" />
      <main className="p-6 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Platform Overview</h2>
          <p className="text-sm text-gray-500 mt-1">All key metrics at a glance.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={users.length} icon={Users} color="blue" />
          <StatCard label="Published Courses" value={publishedCourses.length} icon={BookOpen} color="orange" />
          <StatCard label="Total Enrollments" value={enrollments.length} icon={UserCheck} color="blue" />
          <StatCard label="Revenue (Est.)" value={`₹${(orderStats.revenue / 1000).toFixed(0)}K`} icon={IndianRupee} color="orange" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Enrollments */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Recent Enrollments</h3>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {recentEnrollments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No enrollments yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Course</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentEnrollments.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900 text-sm">
                          {(e as { courses?: { title?: string } }).courses?.title ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(e.enrolled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs capitalize">{e.access_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* All Courses */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">All Courses</h3>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {courses.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No courses yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Title</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Price</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {courses.slice(0, 6).map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-900 text-xs max-w-[160px] truncate">{course.title}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs font-medium">₹{(course.discount_price ?? course.price).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${course.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {course.is_published ? "Published" : "Draft"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Top Performing */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-4">Top Performing Courses</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {publishedCourses.slice(0, 4).map((course) => (
              <div key={course.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#e8f0fe" }}>
                    <BookOpen className="w-4 h-4" style={{ color: "#003A99" }} />
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">{course.title}</h4>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-3">
                  <span>{course.total_students ?? 0} students</span>
                  <span className="flex items-center gap-1 font-medium" style={{ color: "#FF6B1A" }}>
                    <TrendingUp className="w-3 h-3" />
                    {course.rating ?? "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
