import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { Profile, StudentProfile } from "@/types/database";

export async function getProfileServer(): Promise<Profile | null> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data;
}

export async function getStudentProfileServer(): Promise<StudentProfile | null> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return data;
}

export async function getAllProfilesServer() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, student_profiles(*)")
    .eq("role", "student")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
