import { Routes, Route } from "react-router-dom";
import PcProduct from "./pages/PcProduct";
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import { NavbarProvider } from "./pages/Navbarcontext";

function App() {
  return (
    <NavbarProvider>
      <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
        <Navbar />
        <Routes>
          <Route path="/" element={<PcProduct />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      {/* <Dashboard /> */}
    </NavbarProvider>
  );
}

export default App;