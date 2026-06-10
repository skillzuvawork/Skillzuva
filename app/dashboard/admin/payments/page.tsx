import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getProfileServer } from "@/services/profiles";
import { getAllOrdersServer } from "@/services/orders";
import AdminPaymentsClient from "@/components/dashboard/AdminPaymentsClient";

export const metadata: Metadata = { title: "Payments — Admin" };

export default async function AdminPaymentsPage() {
  const profile = await getProfileServer();
  if (!profile) redirect("/login");

  const orders = await getAllOrdersServer().catch(() => []);
  const initials = (profile.full_name ?? "AD").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <DashboardHeader title="Payments" userName={profile.full_name ?? "Admin"} userInitials={initials} />
      <AdminPaymentsClient orders={orders} />
    </>
  );
}
