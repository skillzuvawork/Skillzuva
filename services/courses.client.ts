"use client";
import { createClient } from "@/lib/supabase/client";
import { CourseInsert, CourseUpdate, CourseVideoInsert, CourseVideoUpdate } from "@/types/database";

export async function createCourse(payload: CourseInsert) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data, error } = await supabase.from("courses").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateCourse(id: string, payload: CourseUpdate) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { error } = await supabase.from("courses").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function deleteCourse(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
}

export async function createVideo(payload: CourseVideoInsert) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data, error } = await supabase.from("course_videos").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateVideo(id: string, payload: CourseVideoUpdate) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { error } = await supabase.from("course_videos").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteVideo(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { error } = await supabase.from("course_videos").delete().eq("id", id);
  if (error) throw error;
}
