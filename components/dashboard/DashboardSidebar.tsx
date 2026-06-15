"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, TrendingUp, User,
  CreditCard, Users, BarChart2, LogOut, GraduationCap,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/services/auth";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { label: "My Courses", href: "/dashboard/student/courses", icon: BookOpen },
  { label: "Browse Courses", href: "/courses", icon: GraduationCap },
  { label: "Learning Progress", href: "/dashboard/student/progress", icon: TrendingUp },
  { label: "Profile", href: "/dashboard/student/profile", icon: User },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "Courses", href: "/dashboard/admin/courses", icon: BookOpen },
  { label: "Payments", href: "/dashboard/admin/payments", icon: CreditCard },
  { label: "Reports", href: "/dashboard/admin/reports", icon: BarChart2 },
];

const navByRole = { student: studentNav, admin: adminNav };
const roleLabels = { student: "Student Portal", admin: "Admin Portal" };

interface DashboardSidebarProps {
  role: "student" | "admin";
}

export default function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = navByRole[role];

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-gray-100 h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-0.5">
        <Link href="/">
          <Image
            src="/logo-removebg-preview.png"
            alt="SkillZuva"
            width={90}
            height={30}
            style={{ width: "90px", height: "auto", objectFit: "contain" }}
            priority
          />
        </Link>
        <p className="text-[11px] text-gray-400 leading-none">{roleLabels[role]}</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : "text-gray-600 hover:text-[#003A99] hover:bg-[#f0f4ff]"
                  )}
                  style={isActive ? { backgroundColor: "#003A99" } : {}}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
