import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="admin" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
