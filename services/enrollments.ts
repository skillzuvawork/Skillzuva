import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function getMyEnrollmentsServer() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function isEnrolledServer(courseId: string): Promise<boolean> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle();
  return !!data;
}

export async function getAllEnrollmentsServer() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*, courses(title), profiles(full_name, email)")
    .order("enrolled_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
