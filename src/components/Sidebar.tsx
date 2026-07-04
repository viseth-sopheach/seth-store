import { NavLink } from "react-router-dom";
import { Laptop, Cpu, Mouse, X, type LucideIcon } from "lucide-react";
import { glass } from "../components/glassTokens";

export type ProductCategory = "Laptop" | "Desktop" | "Accessory";

const CATEGORIES: { label: ProductCategory; icon: LucideIcon; path: string }[] =
  [
    { label: "Laptop", icon: Laptop, path: "/" },
    { label: "Desktop", icon: Cpu, path: "/desktop" },
    { label: "Accessory", icon: Mouse, path: "/accessory" },
  ];

interface SidebarProps {
  onSelectCategory?: (category: ProductCategory) => void;
  /** Controls the mobile drawer. Ignored at md and above, where the sidebar is always visible. */
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  onSelectCategory,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const handleSelect = (category: ProductCategory) => {
    onSelectCategory?.(category);
    onClose?.();
  };

  return (
    <div className="md:block md:shrink-0">
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
        />
      )}

      <aside
        className={`${glass} rounded-none md:rounded-3xl fixed md:sticky top-0 md:top-4 left-0 z-50 md:z-30
          h-screen md:h-[80vh] w-64 md:w-56 shrink-0 p-4 flex flex-col justify-center items-center gap-4
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Close Button Container - Positioned absolutely at the top so it doesn't break the central alignment */}
        <div className="absolute top-4 right-4 md:hidden">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 rounded-lg text-neutral-950 hover:bg-white/40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-black mb-3">
            Categories
          </h2>
        </div>

        {/* Centered Navigation Items */}
        <nav className="flex flex-col gap-2 w-full max-w-[180px]">
          {CATEGORIES.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={label}
              to={path}
              end={path === "/"}
              onClick={() => handleSelect(label)}
              className={({ isActive }) =>
                `flex items-center justify-center gap-3 px-4 py-2 rounded-2xl text-center text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/50 !text-neutral-950 border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                    : "!text-neutral-950 hover:bg-white/30 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.25 : 1.75}
                    aria-hidden="true"
                  />
                  <span style={{ color: "#020617" }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}
