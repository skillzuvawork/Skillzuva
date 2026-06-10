import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getProfileServer, getStudentProfileServer } from "@/services/profiles";
import ProfileForm from "@/components/dashboard/ProfileForm";

export const metadata: Metadata = { title: "Profile" };

export default async function StudentProfilePage() {
  const [profile, studentProfile] = await Promise.all([
    getProfileServer(),
    getStudentProfileServer(),
  ]);
  if (!profile) redirect("/login");

  const initials = (profile.full_name ?? "ST").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <DashboardHeader title="Profile" userName={profile.full_name ?? "Student"} userInitials={initials} />
      <main className="p-6">
        <ProfileForm profile={profile} studentProfile={studentProfile} />
      </main>
    </>
  );
}
