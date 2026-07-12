import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { fetchAuthUser, type AuthUser } from "../api/fetchApi";
import type { ComputerShopOrder, Product } from "../api/fetchApi";

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
  user: AuthUser | null;
  authLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  refreshAuth: () => Promise<void>;
  orders: ComputerShopOrder[];
  setOrders: React.Dispatch<React.SetStateAction<ComputerShopOrder[]>>;
  ordersLoaded: boolean;
  setOrdersLoaded: (v: boolean) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  productsLoaded: boolean;
  setProductsLoaded: (v: boolean) => void; // ← this was missing
}

const NavbarContext = createContext<NavbarContextValue | null>(null);

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<NavbarData>({});
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<ComputerShopOrder[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const refreshAuth = useCallback(async () => {
    try {
      const u = await fetchAuthUser();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshAuth().finally(() => setAuthLoading(false));
  }, [refreshAuth]);

  useEffect(() => {
    const handler = () => refreshAuth();
    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, [refreshAuth]);

  const setNavbarData = useCallback((next: NavbarData) => {
    setData((prev) => {
      const keys = new Set([...Object.keys(prev), ...Object.keys(next)]) as Set<
        keyof NavbarData
      >;
      for (const key of keys) {
        if (prev[key] !== next[key]) {
          return next;
        }
      }
      return prev; // identical content -> keep the same reference, no update
    });
  }, []);

  const clearNavbarData = useCallback(() => setData({}), []);

  const value = useMemo(
    () => ({
      ...data,
      setNavbarData,
      clearNavbarData,
      user,
      authLoading,
      setUser,
      refreshAuth,
      orders,
      setOrders,
      ordersLoaded,
      setOrdersLoaded,
      products,
      setProducts,
      productsLoaded,
      setProductsLoaded,
    }),
    [data, user, authLoading, orders, ordersLoaded, products, productsLoaded],
  );

  return (
    <NavbarContext.Provider value={value}>{children}</NavbarContext.Provider>
  );
}

export function useNavbarContext() {
  const ctx = useContext(NavbarContext);
  if (!ctx) {
    throw new Error("useNavbarContext must be used within a NavbarProvider");
  }
  return ctx;
}

export function usePublishNavbarData(data: NavbarData) {
  const { setNavbarData, clearNavbarData } = useNavbarContext();
  const latestData = useRef(data);
  latestData.current = data;

  useEffect(() => {
    setNavbarData(latestData.current);
  }, [
    setNavbarData,
    data.productCount,
    data.loadingProducts,
    data.search,
    data.onAdd,
    data.onSearchChange,
  ]);

  useEffect(() => {
    return () => clearNavbarData();
  }, [clearNavbarData]);
}
