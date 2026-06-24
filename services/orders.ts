import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { Order } from "@/types/database";

export type OrderWithDetails = Order & {
  profiles: { full_name: string | null; email: string } | null;
  courses: { title: string } | null;
};

export async function getAllOrdersServer(): Promise<OrderWithDetails[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*, profiles(full_name, email), courses(title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrderWithDetails[];
}

export async function getOrderStatsServer() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("amount, status");
  if (error) throw error;
  const orders = (data ?? []) as { amount: number; status: string }[];
  const revenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.amount ?? 0), 0);
  return { total: orders.length, revenue };
}
