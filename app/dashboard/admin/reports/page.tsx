import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/StatCard";
import { getProfileServer, getAllProfilesServer } from "@/services/profiles";
import { getAllCoursesServer } from "@/services/courses";
import { getAllEnrollmentsServer } from "@/services/enrollments";
import { getAllOrdersServer, getOrderStatsServer } from "@/services/orders";
import { IndianRupee, TrendingUp, Users, UserCheck } from "lucide-react";

export const metadata: Metadata = { title: "Reports â€” Admin" };

export default async function AdminReportsPage() {
  const profile = await getProfileServer();
  if (!profile) redirect("/login");

  const [users, courses, enrollments, orders, orderStats] = await Promise.all([
    getAllProfilesServer().catch(() => []),
    getAllCoursesServer().catch(() => []),
    getAllEnrollmentsServer().catch(() => []),
    getAllOrdersServer().catch(() => []),
    getOrderStatsServer().catch(() => ({ total: 0, revenue: 0 })),
  ]);

  const initials = (profile.full_name ?? "AD").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const convRate = users.length > 0 ? Math.round((enrollments.length / users.length) * 100) : 0;

  const enrollmentsByCourse = enrollments.reduce<Record<string, number>>((acc, e) => {
    acc[e.course_id] = (acc[e.course_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <DashboardHeader title="Reports & Analytics" userName={profile.full_name ?? "Admin"} userInitials={initials} />
      <main className="p-6 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={`â‚¹${(orderStats.revenue / 1000).toFixed(1)}K`} icon={IndianRupee} color="blue" />
          <StatCard label="Total Enrollments" value={enrollments.length} icon={Users} color="orange" />
          <StatCard label="Conversion Rate" value={`${convRate}%`} icon={TrendingUp} color="blue" />
          <StatCard label="Total Orders" value={orderStats.total} icon={UserCheck} color="orange" />
        </div>

        {/* Orders by status */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Orders by Status</h3>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {(["completed", "pending", "failed", "refunded"] as const).map((status) => {
                const count = orders.filter((o) => o.status === status).length;
                const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                const colors: Record<string, string> = { completed: "#16a34a", pending: "#ca8a04", failed: "#ef4444", refunded: "#6b7280" };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="capitalize font-medium">{status}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct || 1}%`, backgroundColor: colors[status] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Course Performance */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-5">Course Performance</h3>
          {courses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No courses yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Course</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Category</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Enrollments</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Rating</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Price</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{course.title}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{course.category ?? "â€”"}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{enrollmentsByCourse[course.id] ?? 0}</td>
                      <td className="px-4 py-3 text-gray-700">{course.rating ?? "â€”"}</td>
                      <td className="px-4 py-3 font-semibold text-xs" style={{ color: "#003A99" }}>
                        â‚¹{(course.discount_price ?? course.price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${course.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {course.is_published ? "Published" : "Draft"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

