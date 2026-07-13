import { useState, useRef, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import PcProduct from "./pages/ProductListPage";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import { NavbarProvider, useNavbarContext } from "./components/Navbarcontext";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useNavbarContext();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  if (authLoading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) return;

    const updateNavbarHeight = () => {
      document.documentElement.style.setProperty(
        "--navbar-height",
        `${navbar.offsetHeight}px`,
      );
    };

    updateNavbarHeight();
    const observer = new ResizeObserver(updateNavbarHeight);
    observer.observe(navbar);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-800 antialiased">
      <div
        ref={navbarRef}
        className="sticky top-0 z-[100] border-b border-stone-200 bg-white"
      >
        <Navbar />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-3 py-3 sm:px-4 lg:flex-row lg:gap-6 lg:px-6 lg:py-6">
        {!isDashboard && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <div className="flex flex-1 flex-col">
          {!isDashboard && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 lg:hidden"
            >
              <Menu size={15} strokeWidth={2} className="text-stone-500" />
              Categories
            </button>
          )}

          <main className="flex-1 rounded-lg border border-stone-200 bg-white p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<PcProduct pageType="laptop" />} />
              <Route
                path="/desktop"
                element={<PcProduct pageType="desktop" />}
              />
              <Route
                path="/accessory"
                element={<PcProduct pageType="accessory" />}
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <Dashboard />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
          </main>

          {!isDashboard && <Footer />}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <NavbarProvider>
      <AppContent />
    </NavbarProvider>
  );
}

export default App;
