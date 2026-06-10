import { createClient } from "./client";

const BUCKET = "skillzuva";

export async function uploadCourseImage(file: File, courseSlug: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `course-images/${courseSlug}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCourseVideo(file: File, courseSlug: string, order: number): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `course-videos/${courseSlug}-${order}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
