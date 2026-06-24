import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { OfferLetter } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export async function getAllOfferLettersServer(): Promise<OfferLetter[]> {
  const supabase: AnySupabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("offer_letters")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as OfferLetter[];
}

export async function createOfferLetterServer(input: {
  name: string;
  title: string;
  stipend: number;
  date: string;
}): Promise<OfferLetter> {
  const supabase: AnySupabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("offer_letters")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as OfferLetter;
}

export async function deleteOfferLetterServer(id: string): Promise<void> {
  const supabase: AnySupabase = await createServerSupabase();
  const { error } = await supabase.from("offer_letters").delete().eq("id", id);
  if (error) throw error;
}
