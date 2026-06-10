"use client";
import { createClient } from "@/lib/supabase/client";
import { CourseInsert, CourseUpdate, CourseVideoInsert, CourseVideoUpdate } from "@/types/database";

export async function createCourse(payload: CourseInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("courses")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCourse(id: string, payload: CourseUpdate) {
  const supabase = createClient();
  const { error } = await supabase
    .from("courses")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCourse(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
}

export async function createVideo(payload: CourseVideoInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("course_videos")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateVideo(id: string, payload: CourseVideoUpdate) {
  const supabase = createClient();
  const { error } = await supabase.from("course_videos").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteVideo(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("course_videos").delete().eq("id", id);
  if (error) throw error;
}
