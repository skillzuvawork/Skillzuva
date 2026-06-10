"use client";
import { createClient } from "@/lib/supabase/client";

export async function markVideoComplete(courseId: string, videoId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      video_id: videoId,
      completed: true,
      watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,video_id" }
  );
  if (error) throw error;
}
