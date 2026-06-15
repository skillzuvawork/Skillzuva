import { createClient } from "@/lib/supabase/client";

function sanitizeAuthError(error: { message?: string; status?: number }): string {
  const msg = error.message?.toLowerCase() ?? "";
  if (msg.includes("already registered") || msg.includes("user already exists"))
    return "An account with this email already exists. Please sign in instead.";
  if (msg.includes("invalid login") || msg.includes("invalid credentials") || msg.includes("email not confirmed"))
    return "Invalid email or password. Please try again.";
  if (msg.includes("password") && msg.includes("short"))
    return "Password must be at least 6 characters.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Too many attempts. Please wait a moment and try again.";
  if (msg.includes("network") || msg.includes("fetch"))
    return "Network error. Please check your connection.";
  return "Something went wrong. Please try again.";
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw new Error(sanitizeAuthError(error));
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(sanitizeAuthError(error));
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Sign out failed. Please try again.");
}

export async function sendPasswordReset(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  // Always show success to prevent email enumeration
  if (error) console.error("[sendPasswordReset]", error.message);
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(sanitizeAuthError(error));
}

