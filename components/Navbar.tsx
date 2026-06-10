"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, BookOpen, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/services/auth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userInitials, setUserInitials] = useState<string | null>(null);
  const [dashboardHref, setDashboardHref] = useState("/dashboard/student");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = user.user_metadata?.full_name as string | undefined;
      const initials = name
        ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : user.email?.[0]?.toUpperCase() ?? "U";
      setUserInitials(initials);
    });

    // Read role cookie to set correct dashboard link
    const role = document.cookie.split("; ").find((r) => r.startsWith("sz_role="))?.split("=")[1];
    if (role === "admin") setDashboardHref("/dashboard/admin");
  }, []);

  const isLoggedIn = userInitials !== null;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#003A99" }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: "#003A99" }}>
              Skill<span style={{ color: "#FF6B1A" }}>Zuva</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-[#003A99] transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link href={dashboardHref}>
                  <Button className="text-sm font-medium text-white flex items-center gap-2" style={{ backgroundColor: "#003A99" }}>
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                      {userInitials}
                    </span>
                    My Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-gray-600 hover:text-red-600 flex items-center gap-1.5"
                  onClick={async () => { await signOut(); window.location.href = "/"; }}
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-sm font-medium text-gray-600 hover:text-[#003A99]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="text-sm font-medium text-white" style={{ backgroundColor: "#003A99" }}>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <button onClick={() => setOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#003A99" }}>
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xl font-bold" style={{ color: "#003A99" }}>
                    Skill<span style={{ color: "#FF6B1A" }}>Zuva</span>
                  </span>
                </Link>
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                    className="text-base font-medium text-gray-700 hover:text-[#003A99] transition-colors">
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-3 pt-4 border-t">
                  {isLoggedIn ? (
                    <>
                      <Link href={dashboardHref} onClick={() => setOpen(false)}>
                        <Button className="w-full text-white" style={{ backgroundColor: "#003A99" }}>
                          My Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                        onClick={async () => { await signOut(); window.location.href = "/"; }}
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full">Sign In</Button>
                      </Link>
                      <Link href="/signup" onClick={() => setOpen(false)}>
                        <Button className="w-full text-white" style={{ backgroundColor: "#003A99" }}>
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
