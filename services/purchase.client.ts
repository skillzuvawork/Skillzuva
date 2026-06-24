"use client";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types/database";

export async function createOrder(userId: string, courseId: string, amount: number): Promise<Order> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const order_number = `SZ-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const { data, error } = await supabase
    .from("orders")
    .insert({ user_id: userId, course_id: courseId, amount, status: "completed", order_number })
    .select()
    .single();
  if (error) throw error;
  return data as Order;
}

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

export async function createEnrollment(userId: string, courseId: string, orderId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;
  const { error } = await supabase.from("enrollments").insert({
    user_id: userId,
    course_id: courseId,
    order_id: orderId,
    access_type: "lifetime",
  });
  if (error) throw error;
}
