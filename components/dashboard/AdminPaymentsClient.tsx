"use client";

import { useState, useMemo } from "react";
import { Search, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  profiles?: { full_name?: string | null; email?: string } | null;
  courses?: { title?: string | null } | null;
}

interface Props {
  orders: Order[];
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

export default function AdminPaymentsClient({ orders }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        o.profiles?.full_name?.toLowerCase().includes(q) ||
        o.profiles?.email?.toLowerCase().includes(q) ||
        o.courses?.title?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalRevenue = filtered
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.amount, 0);

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by student or course…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-gray-200 text-sm px-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003A99]/20"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <span className="text-sm text-gray-500 shrink-0">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""} · ₹{totalRevenue.toLocaleString("en-IN")} collected
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#003A99]" />
          <p className="text-sm text-gray-400">No payments found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Student</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Course</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">
                      {order.profiles?.full_name || order.profiles?.email || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{order.courses?.title || "—"}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">₹{order.amount.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
