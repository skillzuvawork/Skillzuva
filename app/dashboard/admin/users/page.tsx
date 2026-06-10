import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getProfileServer, getAllProfilesServer } from "@/services/profiles";
import { getAllEnrollmentsServer } from "@/services/enrollments";
import AdminUsersClient from "@/components/dashboard/AdminUsersClient";

export const metadata: Metadata = { title: "Users — Admin" };

export default async function AdminUsersPage() {
  const profile = await getProfileServer();
  if (!profile) redirect("/login");

  const [users, enrollments] = await Promise.all([
    getAllProfilesServer().catch(() => []),
    getAllEnrollmentsServer().catch(() => []),
  ]);

  const enrollmentsByUser = enrollments.reduce<Record<string, number>>((acc, e) => {
    acc[e.user_id] = (acc[e.user_id] ?? 0) + 1;
    return acc;
  }, {});

  const initials = (profile.full_name ?? "AD").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <DashboardHeader title="Users" userName={profile.full_name ?? "Admin"} userInitials={initials} />
      <AdminUsersClient users={users} enrollmentsByUser={enrollmentsByUser} />
    </>
  );
}
