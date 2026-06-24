import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OfferLettersClient from "@/components/dashboard/OfferLettersClient";
import { getProfileServer } from "@/services/profiles";
import { getAllOfferLettersServer } from "@/services/offer-letters";

export const metadata: Metadata = { title: "Offer Letters — Admin" };

export default async function OfferLettersPage() {
  const profile = await getProfileServer();
  if (!profile || profile.role !== "admin") redirect("/login");

  const letters = await getAllOfferLettersServer().catch(() => []);

  const initials = (profile.full_name ?? "AD")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <DashboardHeader
        title="Offer Letters"
        userName={profile.full_name ?? "Admin"}
        userInitials={initials}
      />
      <OfferLettersClient letters={letters} />
    </>
  );
}
