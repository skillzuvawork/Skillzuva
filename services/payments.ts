import { createClient } from "@/lib/supabase/client";

export async function createPayment(orderId: string, amount: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payments")
    .insert({ order_id: orderId, provider: "mock", status: "paid", amount })
    .select()
    .single();
  if (error) throw error;
  return data;
}
