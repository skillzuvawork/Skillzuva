"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

interface DashboardHeaderProps {
  title: string;
  userName?: string;
  userInitials?: string;
}

export default function DashboardHeader({
  title,
  userName = "User",
  userInitials = "U",
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-4">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search..." className="pl-9 h-9 w-48 lg:w-64 text-sm bg-gray-50 border-gray-200" />
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs font-semibold text-white" style={{ backgroundColor: "#003A99" }}>
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">{userName}</span>
        </div>

        <Link href="/" className="hidden lg:block">
          <Button variant="ghost" size="sm" className="text-xs text-gray-500">← Back to Site</Button>
        </Link>
      </div>
    </header>
  );
}
