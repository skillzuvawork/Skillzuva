import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function getPublishedCoursesServer() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("courses")
    .select("*, instructors(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCourseBySlugServer(slug: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("courses")
    .select("*, instructors(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (error) return null;
  return data;
}

export async function getCourseVideosServer(courseId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("course_videos")
    .select("*")
    .eq("course_id", courseId)
    .order("video_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getAllCoursesServer() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("courses")
    .select("*, instructors(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getInstructorsServer() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("instructors")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}
