import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="student" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
