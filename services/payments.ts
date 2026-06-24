import { createClient } from "@/lib/supabase/client";

export async function createPayment(orderId: string, amount: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { data, error } = await supabase
    .from("payments")
    .insert({ order_id: orderId, provider: "mock", status: "paid", amount })
    .select()
    .single();
  if (error) throw error;
  return data;
}
