import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const hoverLift =
    "transition-all duration-200 hover:-translate-y-0.1 hover:border-[#B98A3D] hover:shadow-sm";

  const NavItem = ({ to, end, children, onClick }) => (
    <NavLink to={to} end={end} onClick={onClick} className="group relative">
      {({ isActive }) => (
        <>
          <span
            className={[
              "inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium",
              hoverLift,
              isActive
                ? "-translate-y-0.1 border-[#B98A3D] bg-white text-[#211F1C] shadow-sm"
                : "border-transparent text-[#6B6558] group-hover:text-[#211F1C]",
            ].join(" ")}
          >
            {children}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <nav className=" sticky top-0 z-50 w-full border-b border-[#E5DFD1] bg-[#FBF8F2]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <div className="flex items-center gap-6">
          <NavLink
            to="/"
            className={[
              "flex items-center gap-2 shrink-0 rounded-lg border border-transparent px-2 py-1",
              hoverLift,
            ].join(" ")}
          >
            <span
              className="text-lg tracking-tight text-[#211F1C]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Library
            </span>
          </NavLink>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2 border-l border-[#E5DFD1] pl-6">
            <NavItem to="/" end>
              Books
            </NavItem>
            {user && <NavItem to="/my-borrows">My Borrows</NavItem>}
            {isAdmin && <NavItem to="/admin/books">Manage Books</NavItem>}
          </div>
        </div>

        {/* Right side — desktop */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {user ? (
            <>
              <div
                className={[
                  "flex items-center gap-2 rounded-full border border-[#E5DFD1] bg-white py-1 pl-1 pr-3",
                  hoverLift,
                ].join(" ")}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3F5D42] text-xs font-semibold text-white">
                  {initials}
                </span>
                <span className="font-medium text-[#211F1C]">{user.name}</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className={[
                  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E5DFD1] bg-white px-4 text-xs font-semibold text-[#211F1C]",
                  hoverLift,
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F5D42]",
                ].join(" ")}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavItem to="/login">
                <button className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E5DFD1] bg-white px-4 text-xs font-semibold text-[#211F1C] hover:bg-[#E5DFD1]">
                  Log in
                </button>
              </NavItem>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className={[
            "md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5DFD1] text-[#211F1C]",
            hoverLift,
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3F5D42]",
          ].join(" ")}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />} 
        </button>
      </div>

      {/* Mobile panel */}
      <div
        className={[
          "md:hidden overflow-hidden border-t border-[#E5DFD1] bg-[#FBF8F2] transition-all duration-300 ease-out",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          <NavItem to="/" end onClick={() => setMobileOpen(false)}>
            Books
          </NavItem>
          {user && (
            <NavItem to="/my-borrows" onClick={() => setMobileOpen(false)}>
              My Borrows
            </NavItem>
          )}
          {isAdmin && (
            <NavItem to="/admin/books" onClick={() => setMobileOpen(false)}>
              Manage Books
            </NavItem>
          )}

          <div className="mt-2 flex flex-col gap-2 border-t border-[#E5DFD1] pt-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-[#211F1C]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3F5D42] text-xs font-semibold text-white">
                    {initials}
                  </span>
                  {user.name}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className={[
                    "inline-flex h-9 items-center justify-center rounded-lg border border-[#E5DFD1] bg-white px-4 text-xs font-semibold text-[#211F1C]",
                    hoverLift,
                  ].join(" ")}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavItem to="/login" onClick={() => setMobileOpen(false)}>
                  Log in
                </NavItem>
                <NavLink
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "inline-flex h-9 items-center justify-center rounded-lg border border-transparent bg-[#3F5D42] px-4 text-xs font-semibold text-white",
                    hoverLift,
                  ].join(" ")}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
