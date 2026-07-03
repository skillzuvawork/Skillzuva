"use server";

import { revalidatePath } from "next/cache";
import { createOfferLetterServer, deleteOfferLetterServer } from "@/services/offer-letters";

export async function createOfferLetterAction(formData: FormData) {
  const name         = (formData.get("name") as string).trim();
  const title        = (formData.get("title") as string).trim();
  const stipend      = parseFloat(formData.get("stipend") as string);
  const date         = formData.get("date") as string;
  const joining_date = (formData.get("joining_date") as string) || null;

  if (!name || !title || isNaN(stipend) || !date) {
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
      await createOfferLetterServer({ ...row, joining_date: row.joining_date });
      results.push({ success: true });
    } catch (e) {
      results.push({ success: false, error: e instanceof Error ? e.message : "Failed" });
    }
  }
  revalidatePath("/dashboard/admin/offer-letters");
  return results;
}
