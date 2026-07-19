"use server";

import { revalidatePath } from "next/cache";
import { createOfferLetterServer, deleteOfferLetterServer } from "@/services/offer-letters";

export async function createOfferLetterAction(formData: FormData) {
  const name         = String(formData.get("name") ?? "").trim();
  const title        = String(formData.get("title") ?? "").trim();
  const stipend      = parseFloat(String(formData.get("stipend") ?? ""));
  const date         = String(formData.get("date") ?? "").trim();
  const joining_date = String(formData.get("joining_date") ?? "").trim();

  if (!name || !title || isNaN(stipend) || stipend <= 0 || !date || !joining_date) {
    return { error: "All fields are required." };
  }

  try {
    await createOfferLetterServer({ name, title, stipend, date, joining_date });
    revalidatePath("/dashboard/admin/offer-letters");
    return { success: true };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to create offer letter." };
  }
}

export async function deleteOfferLetterAction(id: string) {
  try {
    await deleteOfferLetterServer(id);
    revalidatePath("/dashboard/admin/offer-letters");
    return { success: true };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to delete offer letter." };
  }
}

export async function bulkCreateOfferLettersAction(rows: {
  name: string;
  title: string;
  stipend: number;
  date: string;
  joining_date: string;
}[]) {
  const results = [];
  for (const row of rows) {
    try {
      if (
        !row.name?.trim() || !row.title?.trim() ||
        !Number.isFinite(row.stipend) || row.stipend <= 0 ||
        !row.date?.trim() || !row.joining_date?.trim()
      ) {
        results.push({ success: false, error: "All fields are required." });
        continue;
      }
      await createOfferLetterServer({ ...row, joining_date: row.joining_date });
      results.push({ success: true });
    } catch (e) {
      results.push({ success: false, error: e instanceof Error ? e.message : "Failed" });
    }
  }
  revalidatePath("/dashboard/admin/offer-letters");
  return results;
}
