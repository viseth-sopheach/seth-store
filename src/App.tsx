import { useState } from "react";
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

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-gray-800 flex flex-col">
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="pt-2.5 flex flex-1 w-full max-w-[1600px] mx-auto md:gap-4 md:px-4">
        {!isDashboard && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Content column: mobile menu trigger, routed pages, footer */}
        <div className="flex-1 min-w-0 flex flex-col">
          {!isDashboard && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center gap-2 m-4 px-3 py-2 rounded-2xl bg-white/40 border border-white/50 text-sm font-bold text-black w-fit"
            >
              <Menu size={18} className="text-neutral-950" />
              Categories
            </button> 
          )}

          <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-4">
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