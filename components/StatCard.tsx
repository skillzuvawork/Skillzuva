import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  positive?: boolean;
  color?: "blue" | "orange" | "gray";
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  change,
  positive = true,
  color = "blue",
}: StatCardProps) {
  const iconColors = {
    blue: { bg: "#e8f0fe", icon: "#003A99" },
    orange: { bg: "#fff0e6", icon: "#FF6B1A" },
    gray: { bg: "#f3f4f6", icon: "#6b7280" },
  };

  const { bg, icon: iconColor } = iconColors[color];

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-xs mt-1 font-medium ${positive ? "text-green-600" : "text-red-500"}`}>
              {positive ? "↑" : "↓"} {change}
            </p>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: bg }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}
