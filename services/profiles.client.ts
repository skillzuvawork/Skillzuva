import { createClient } from "@/lib/supabase/client";
import { createBrowserClient } from "@supabase/ssr";
import { Database, StudentProfileUpdate } from "@/types/database";

export async function updateProfile(updates: { full_name?: string; phone_number?: string; avatar_url?: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw error;
}

export async function upsertStudentProfile(updates: StudentProfileUpdate) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("student_profiles")
    .upsert(
      { ...updates, user_id: user.id, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  if (error) throw error;
}

// Used right after signUp() — uses the fresh session token to immediately save profile data
export async function upsertStudentProfileWithToken(
  accessToken: string,
  userId: string,
  updates: StudentProfileUpdate & { phone_number?: string | null }
) {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await supabase.auth.setSession({ access_token: accessToken, refresh_token: "" });

  const { phone_number, ...studentUpdates } = updates;

  const { error } = await supabase
    .from("student_profiles")
    .upsert(
      { ...studentUpdates, user_id: userId, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  if (error) throw error;

  if (phone_number) {
    await supabase
      .from("profiles")
      .update({ phone_number, updated_at: new Date().toISOString() })
      .eq("id", userId);
  }
}
