"use client";

import { useState, useMemo } from "react";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  created_at: string;
  student_profiles?: { college_name?: string | null; degree_type?: string | null } | null;
}

interface Props {
  users: User[];
  enrollmentsByUser: Record<string, number>;
}

export default function AdminUsersClient({ users, enrollmentsByUser }: Props) {
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");

  const degrees = useMemo(() => {
    const set = new Set(users.map((u) => u.student_profiles?.degree_type).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.full_name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.student_profiles?.college_name?.toLowerCase().includes(q);
      const matchesDegree =
        degreeFilter === "all" || u.student_profiles?.degree_type === degreeFilter;
      return matchesSearch && matchesDegree;
    });
  }, [users, search, degreeFilter]);

  return (
    <main className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email or college…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        <select
          value={degreeFilter}
          onChange={(e) => setDegreeFilter(e.target.value)}
          aria-label="Filter by degree"
          className="h-9 rounded-lg border border-gray-200 text-sm px-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#003A99]/20"
        >
          <option value="all">All Degrees</option>
          {degrees.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <span className="text-sm text-gray-500 shrink-0">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#003A99]" />
          <p className="text-sm text-gray-400">No students found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">College</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Degree</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Courses</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{user.full_name || "—"}</td>
                    <td className="px-5 py-3.5 text-gray-500">{user.email}</td>
                    <td className="px-5 py-3.5 text-gray-500">{user.phone_number || "—"}</td>
                    <td className="px-5 py-3.5 text-gray-500">{user.student_profiles?.college_name || "—"}</td>
                    <td className="px-5 py-3.5 text-gray-500">{user.student_profiles?.degree_type || "—"}</td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium">{enrollmentsByUser[user.id] ?? 0}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
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
