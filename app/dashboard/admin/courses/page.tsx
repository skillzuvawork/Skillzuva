import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getProfileServer } from "@/services/profiles";
import { getAllCoursesServer, getInstructorsServer } from "@/services/courses";
import AdminCoursesClient from "@/components/dashboard/AdminCoursesClient";
import type { CourseWithInstructor, Instructor } from "@/types/database";

export const metadata: Metadata = { title: "Courses â€” Admin" };

export default async function AdminCoursesPage() {
  const profile = await getProfileServer();
  if (!profile) redirect("/login");

  const [courses, instructors] = await Promise.all([
    getAllCoursesServer().catch(() => []),
    getInstructorsServer().catch(() => []),
  ]);

  const initials = (profile.full_name ?? "AD").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <DashboardHeader title="Courses" userName={profile.full_name ?? "Admin"} userInitials={initials} />
      <AdminCoursesClient initialCourses={courses} instructors={instructors} />
    </>
  );
}


