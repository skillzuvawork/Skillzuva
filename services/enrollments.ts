import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { EnrollmentWithCourse } from "@/types/database";

export async function getMyEnrollmentsServer(): Promise<EnrollmentWithCourse[]> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EnrollmentWithCourse[];
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

export type EnrollmentWithDetails = {
  id: string;
  user_id: string;
  course_id: string;
  order_id: string | null;
  access_type: string;
  enrolled_at: string;
  courses: { title: string } | null;
  profiles: { full_name: string | null; email: string } | null;
};

export async function getAllEnrollmentsServer(): Promise<EnrollmentWithDetails[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("enrollments")
    .select("*, courses(title), profiles(full_name, email)")
    .order("enrolled_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EnrollmentWithDetails[];
}
