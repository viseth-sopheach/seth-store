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
    <div className="lg:w-56 lg:shrink-0">
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-stone-950/25 lg:hidden"
          style={{ top: "var(--navbar-height, 0px)" }}
        />
      )}

      <aside
        role="dialog"
        aria-modal={isOpen}
        className={`${glass} fixed z-40 flex w-64 flex-col overflow-hidden p-4 transition-transform duration-300 ease-out
          top-[var(--navbar-height,0px)] h-[calc(100vh-var(--navbar-height,0px))]
          left-0
          lg:left-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] lg:w-56 lg:translate-x-0 lg:rounded-[1.5rem]
          lg:h-[calc(100vh-var(--navbar-height,0px)-1.5rem)]
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex shrink-0 items-center justify-between lg:justify-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">
              Browse
            </p>
            <h2 className="mt-1 text-sm font-semibold text-stone-900">
              Categories
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-5 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {CATEGORIES.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={label}
              to={path}
              end={path === "/"}
              onClick={() => handleSelect(label)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
                  isActive
                    ? "bg-stone-900 text-white shadow-sm"
                    : "text-stone-700 hover:bg-stone-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.7}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}
