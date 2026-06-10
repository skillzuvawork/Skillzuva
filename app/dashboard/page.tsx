import { redirect } from "next/navigation";

// The middleware intercepts /dashboard and redirects to /dashboard/admin or /dashboard/student
// based on the sz_role cookie. This page only renders if middleware is bypassed (shouldn't happen).
export default function DashboardPage() {
  redirect("/login");
}
