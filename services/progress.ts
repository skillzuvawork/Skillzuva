import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { LessonProgress } from "@/types/database";

export async function getLessonProgressServer(courseId: string): Promise<LessonProgress[]> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId);
  if (error) throw error;
  return (data ?? []) as LessonProgress[];
}

export async function getAllProgressServer(): Promise<LessonProgress[]> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id);
  if (error) throw error;
  return (data ?? []) as LessonProgress[];
}
