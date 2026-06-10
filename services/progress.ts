import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function getLessonProgressServer(courseId: string) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId);
  if (error) throw error;
  return data ?? [];
}

export async function getAllProgressServer() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id);
  if (error) throw error;
  return data ?? [];
}
