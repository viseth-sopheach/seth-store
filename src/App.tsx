import { Routes, Route, Navigate } from "react-router-dom";
import PcProduct from "./pages/PcProduct";
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import { NavbarProvider, useNavbarContext } from "./pages/Navbarcontext";

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useNavbarContext();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  if (authLoading) return null;

  if (!user) return <Navigate to="/" replace />;

  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function App() {
  return (
    <NavbarProvider>
      <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
        <Navbar />
        <Routes>
          <Route path="/" element={<PcProduct />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedAdminRoute>
                <Dashboard />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </div>
    </NavbarProvider>
  );
}

export default App;
