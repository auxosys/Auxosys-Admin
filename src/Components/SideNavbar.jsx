import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Mail,
  Briefcase,
  Newspaper,
  Settings,
  Menu,
  X,
  Users,
  Search,
  ShieldCheck,
  LogOut,
  FileText,
} from "lucide-react";
import { apiClient } from "../helper/apiClient";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { profile, hasAccess } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const getLinkClass = (path) => {
    const base =
      "flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors text-[15px]";
    const active = "text-white bg-white/20 shadow-sm backdrop-blur-sm";
    const inactive = "hover:bg-white/10 hover:text-white transition-colors";

    return location.pathname === path
      ? `${base} ${active}`
      : `${base} ${inactive}`;
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("accessToken");
      // Optional: setProfile(null) but redirecting to login will re-mount anyway
      navigate("/login");
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 text-white rounded-md shadow-lg border border-white/20"
        style={{ background: "#071b3a" }}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 flex flex-col text-blue-100 border-r border-white/10
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:flex-shrink-0
        `}
        style={{
          background:
            "linear-gradient(135deg, #071b3a 0%, #0c55cc 65%, #0c55cc 100%)",
        }}
      >
        {/* Company Branding Header */}
        <div className="flex items-center justify-between px-6 py-4 mb-1">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/icon.svg"
                alt="AUXOSYS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-white text-[17px] font-bold tracking-wide truncate max-w-[140px]">
              AUXOSYS
            </span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-blue-100/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-semibold text-blue-200/70 uppercase tracking-wider">
            Overview
          </div>

          <Link to="/" className={getLinkClass("/")}>
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          {hasAccess("contact") && (
            <Link to="/contact" className={getLinkClass("/contact")}>
              <Mail size={20} />
              <span className="font-medium">Contact Us</span>
            </Link>
          )}

          {hasAccess("careers") && (
            <Link to="/careers" className={getLinkClass("/careers")}>
              <Briefcase size={20} />
              <span className="font-medium">Careers</span>
            </Link>
          )}

          {hasAccess("newsroom") && (
            <Link to="/newsroom" className={getLinkClass("/newsroom")}>
              <Newspaper size={20} />
              <span className="font-medium">Newsroom</span>
            </Link>
          )}

          {hasAccess("subscriptions") && (
            <Link to="/subscriptions" className={getLinkClass("/subscriptions")}>
              <Users size={20} />
              <span className="font-medium">Subscriptions</span>
            </Link>
          )}

          {(hasAccess("seo") || hasAccess("access-control") || hasAccess("settings") || hasAccess("legal")) && (
            <div className="px-3 pt-2 mb-1 text-xs font-semibold text-blue-200/70 uppercase tracking-wider">
              Site Management
            </div>
          )}

          {hasAccess("seo") && (
            <Link to="/seo" className={getLinkClass("/seo")}>
              <Search size={20} />
              <span className="font-medium">SEO</span>
            </Link>
          )}

          {hasAccess("access-control") && (
            <Link to="/access-control" className={getLinkClass("/access-control")}>
              <ShieldCheck size={20} />
              <span className="font-medium">Access Control</span>
            </Link>
          )}

          {hasAccess("legal") && (
            <Link to="/legal-pages" className={getLinkClass("/legal-pages")}>
              <FileText size={20} />
              <span className="font-medium">Legal Pages</span>
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-3 mt-auto border-t border-white/10 flex flex-col gap-1">
          {(hasAccess("settings") || profile?.email === "auxosys@gmail.com") && (
            <Link to="/settings" className={getLinkClass("/settings")}>
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors cursor-pointer w-full text-left"
          >
            <LogOut size={20} />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
