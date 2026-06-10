import type { Metadata } from "next";
import { getPublishedCoursesServer } from "@/services/courses";
import CoursesClient from "./CoursesClient";

export const metadata: Metadata = { title: "Browse Courses — SkillZuva" };

export default async function CoursesPage() {
  const courses = await getPublishedCoursesServer().catch(() => []);
  return <CoursesClient courses={courses} />;
}
