import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function getAllOrdersServer() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*, profiles(full_name, email), courses(title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOrderStatsServer() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("amount, status");
  if (error) throw error;
  const orders = data ?? [];
  const revenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.amount ?? 0), 0);
  return { total: orders.length, revenue };
}
