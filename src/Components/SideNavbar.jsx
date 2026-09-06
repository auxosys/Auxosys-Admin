import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Send,
  CreditCard,
  Briefcase,
  Newspaper,
  Settings,
  Menu,
  X,
  Users,
  Search,
  ShieldCheck,
  LogOut,
  FileCheck,
  Scale,
  Award,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { apiClient } from "../helper/apiClient";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  const { profile, hasAccess } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const getLinkClass = (path) => {
    const base =
      "flex items-center gap-3 rounded-lg transition-colors text-[15px]";
    const active = "text-white bg-white/20 shadow-sm backdrop-blur-sm";
    const inactive = "hover:bg-white/10 hover:text-white transition-colors";
    const padding = isCollapsed ? "justify-center p-2.5" : "px-3 py-2";

    return `${base} ${padding} ${location.pathname === path ? active : inactive}`;
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("accessToken");
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
          fixed top-0 left-0 z-50 h-screen flex flex-col text-blue-100 border-r border-white/10
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:flex-shrink-0
        `}
        style={{
          background:
            "linear-gradient(135deg, #071b3a 0%, #132242 65%, #132242 100%)",
        }}
      >
        {/* Company Branding Header */}
        <div className={`flex ${isCollapsed ? "flex-col items-center justify-center pt-4 pb-2 gap-2" : "items-center justify-between px-5 pt-4 pb-2"} mb-1 relative`}>
          <Link to="/" className="flex items-center gap-3" title="AUXOSYS Dashboard">
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <img
                src="/icon.svg"
                alt="AUXOSYS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {!isCollapsed && (
              <span className="text-white text-[17px] font-bold tracking-wide truncate max-w-[130px]">
                AUXOSYS
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-blue-200/80 hover:text-white hover:bg-white/15 transition-all"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-blue-100/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
          {/* OVERVIEW */}
          {hasAccess("dashboard") && (
            <>
              {!isCollapsed ? (
                <div className="px-3 mb-2 text-xs font-semibold text-blue-200/70 uppercase tracking-wider">
                  Overview
                </div>
              ) : (
                <div className="my-2 border-t border-white/10" />
              )}
              <Link to="/" className={getLinkClass("/")} title="Dashboard">
                <LayoutDashboard size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="font-medium truncate">Dashboard</span>}
              </Link>
            </>
          )}

          {/* BUSINESS MANAGEMENT */}
          {(hasAccess("client_management") || hasAccess("contact") || hasAccess("outreach") || hasAccess("subscriptions")) && (
            <>
              {!isCollapsed ? (
                <div className="px-3 pt-3 mb-2 text-xs font-semibold text-blue-200/70 uppercase tracking-wider">
                  Business Management
                </div>
              ) : (
                <div className="my-2 border-t border-white/10" />
              )}
              {hasAccess("client_management") && (
                <Link to="/clients" className={getLinkClass("/clients")} title="Clients">
                  <Users size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium truncate">Clients</span>}
                </Link>
              )}
              {hasAccess("contact") && (
                <Link to="/contact" className={getLinkClass("/contact")} title="Contact Us">
                  <MessageSquare size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium truncate">Contact Us</span>}
                </Link>
              )}
              {hasAccess("outreach") && (
                <Link to="/outreach" className={getLinkClass("/outreach")} title="Outreach & Mailbox">
                  <Send size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium truncate">Outreach & Mailbox</span>}
                </Link>
              )}
              {hasAccess("subscriptions") && (
                <Link to="/subscriptions" className={getLinkClass("/subscriptions")} title="Subscriptions">
                  <CreditCard size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium truncate">Subscriptions</span>}
                </Link>
              )}
            </>
          )}

          {/* HR & RECRUITMENT */}
          {(hasAccess("careers") || hasAccess("offer_letters") || hasAccess("certificates_issued") || hasAccess("certificates_generate")) && (
            <>
              {!isCollapsed ? (
                <div className="px-3 pt-3 mb-2 text-xs font-semibold text-blue-200/70 uppercase tracking-wider">
                  HR & Recruitment
                </div>
              ) : (
                <div className="my-2 border-t border-white/10" />
              )}
              {hasAccess("careers") && (
                <Link to="/careers" className={getLinkClass("/careers")} title="Careers">
                  <Briefcase size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium truncate">Careers</span>}
                </Link>
              )}
              {hasAccess("offer_letters") && (
                <Link to="/offer-letters" className={getLinkClass("/offer-letters")} title="Offer Letters">
                  <FileCheck size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium truncate">Offer Letters</span>}
                </Link>
              )}
              {(hasAccess("certificates_issued") || hasAccess("certificates_generate")) && (
                <Link to="/certificates" className={getLinkClass("/certificates")} title="Certificates">
                  <Award size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium truncate">Certificates</span>}
                </Link>
              )}
            </>
          )}

          {/* CONTENT MANAGEMENT */}
          {hasAccess("newsroom") && (
            <>
              {!isCollapsed ? (
                <div className="px-3 pt-3 mb-2 text-xs font-semibold text-blue-200/70 uppercase tracking-wider">
                  Content Management
                </div>
              ) : (
                <div className="my-2 border-t border-white/10" />
              )}
              <Link to="/newsroom" className={getLinkClass("/newsroom")} title="Newsroom">
                <Newspaper size={20} className="flex-shrink-0" />
                {!isCollapsed && <span className="font-medium truncate">Newsroom</span>}
              </Link>
            </>
          )}

          {/* SITE MANAGEMENT */}
          {(hasAccess("seo") || hasAccess("access-control") || hasAccess("settings") || hasAccess("legal")) && (
            <>
              {!isCollapsed ? (
                <div className="px-3 pt-3 mb-2 text-xs font-semibold text-blue-200/70 uppercase tracking-wider">
                  Site Management
                </div>
              ) : (
                <div className="my-2 border-t border-white/10" />
              )}
              {hasAccess("seo") && (
                <Link to="/seo" className={getLinkClass("/seo")} title="SEO Dashboard">
                  <Search size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium truncate">SEO</span>}
                </Link>
              )}
              {hasAccess("legal") && (
                <Link to="/legal-pages" className={getLinkClass("/legal-pages")} title="Legal Pages">
                  <Scale size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium truncate">Legal Pages</span>}
                </Link>
              )}
              {hasAccess("settings") && (
                <Link to="/consent-logs" className={getLinkClass("/consent-logs")} title="Cookie Consent Logs">
                  <ShieldCheck size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium truncate">Cookie Consent Logs</span>}
                </Link>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-3 mt-auto border-t border-white/10 flex flex-col gap-1">
          {(hasAccess("settings") || profile?.email === "auxosys@gmail.com") && (
            <Link to="/settings" className={getLinkClass("/settings")} title="Settings">
              <Settings size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="font-medium truncate">Settings</span>}
            </Link>
          )}

          <div className={`flex items-center ${isCollapsed ? "justify-center p-1.5" : "justify-between px-2 py-2"} mt-1 bg-white/5 rounded-lg`}>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden flex-1 mr-2">
                <span className="text-sm font-semibold text-white truncate">{profile?.name || profile?.firstName || "Admin User"}</span>
                <span className="text-[11px] text-blue-200/70 truncate">{profile?.email || ""}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors flex-shrink-0"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
