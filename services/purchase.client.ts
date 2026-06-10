"use client";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types/database";

export async function createOrder(userId: string, courseId: string, amount: number): Promise<Order> {
  const supabase = createClient();
  const order_number = `SZ-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const { data, error } = await supabase
    .from("orders")
    .insert({ user_id: userId, course_id: courseId, amount, status: "completed", order_number })
    .select()
    .single();
  if (error) throw error;
  return data;
}

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

export async function createEnrollment(userId: string, courseId: string, orderId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("enrollments").insert({
    user_id: userId,
    course_id: courseId,
    order_id: orderId,
    access_type: "lifetime",
  });
  if (error) throw error;
}
