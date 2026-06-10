import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse all online courses on SkillZuva — digital marketing, HR management, business analytics, banking, finance, sales, communication, and leadership skills.",
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
