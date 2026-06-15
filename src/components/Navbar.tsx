import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const navLinkClass = (path: string): string => {
    return `px-4 py-2 rounded-lg transition duration-200 ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
        <Link to="/" className={navLinkClass("/")}>
          Products
        </Link>

        <Link to="/dashboard" className={navLinkClass("/dashboard")}>
          Dashboard
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
