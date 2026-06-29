import { createContext, useContext, useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";

// ─── NavbarContext ────────────────────────────────────────────────────────────
// Navbar is rendered once in App.tsx, outside <Routes>, so it has no direct
// access to page-level state (product count, search text, +Add handler).
// This context lets a page (e.g. PcProduct) publish that data, and lets
// Navbar read it — without prop drilling through App.tsx.

interface NavbarData {
  productCount?: number;
  loadingProducts?: boolean;
  search?: string;
  onSearchChange?: (v: string) => void;
  onAdd?: () => void;
}

interface NavbarContextValue extends NavbarData {
  setNavbarData: (data: NavbarData) => void;
  clearNavbarData: () => void;
}

const NavbarContext = createContext<NavbarContextValue | null>(null);

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<NavbarData>({});

  const setNavbarData = (next: NavbarData) => setData(next);
  const clearNavbarData = () => setData({});

  const value = useMemo(
    () => ({ ...data, setNavbarData, clearNavbarData }),
    [data],
  );

  return (
    <NavbarContext.Provider value={value}>{children}</NavbarContext.Provider>
  );
}

// Used by Navbar.tsx to read the published data
export function useNavbarContext() {
  const ctx = useContext(NavbarContext);
  if (!ctx) {
    throw new Error("useNavbarContext must be used within a NavbarProvider");
  }
  return ctx;
}

// Used by a page (e.g. PcProduct) to publish its data to Navbar.
// Automatically clears on unmount so stale data doesn't leak into other pages.
export function usePublishNavbarData(data: NavbarData) {
  const { setNavbarData, clearNavbarData } = useNavbarContext();

  useEffect(() => {
    setNavbarData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data.productCount,
    data.loadingProducts,
    data.search,
    data.onSearchChange,
    data.onAdd,
  ]);

  useEffect(() => {
    return () => clearNavbarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
