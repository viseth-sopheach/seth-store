import { ClipboardList, MessageSquare, Users } from "lucide-react";

export type DashboardTab = "orders" | "feedbacks" | "users";

const navItems: { tab: DashboardTab; label: string; icon: typeof ClipboardList }[] = [
  {
    tab: "orders",
    label: "Orders",
    icon: ClipboardList,
  },
  {
    tab: "feedbacks",
    label: "Feedbacks",
    icon: MessageSquare,
  },
  {
    tab: "users",
    label: "Users",
    icon: Users,
  },
];

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export default function DashboardSidebar({
  activeTab,
  onTabChange,
}: DashboardSidebarProps) {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
        <p className="text-xs text-gray-400 mt-0.5">Manage your store</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ tab, label, icon: Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}