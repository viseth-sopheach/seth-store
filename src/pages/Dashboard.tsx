import { useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardSidebar, { type DashboardTab } from "../Admin/DashboardSidebar";
import Order from "../Admin/Order";
import Feedback from "../Admin/Feedback";
import Users from "../Admin/Users";
import { useNavbarContext } from "../components/Navbarcontext";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DashboardTab>("orders");
  const { user, authLoading } = useNavbarContext();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  if (authLoading) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-sans">
        <h2 className="text-gray-900 font-bold text-xl">Access Denied</h2>
        <p className="text-gray-500 mt-2 text-sm">Please log in to continue.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-6">
        <div className="text-center max-w-md">
          <h1 className="text-8xl font-extrabold text-gray-500 tracking-tight">
            404
          </h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-500">
            Page Not Found
          </h2>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderTab() {
    switch (activeTab) {
      case "feedbacks":
        return <Feedback />;
      case "users":
        return <Users />;
      case "orders":
      default:
        return <Order />;
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans antialiased text-gray-800">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 min-w-0">{renderTab()}</div>
    </div>
  );
}