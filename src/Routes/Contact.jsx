import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../helper/apiClient";
import { toast } from "react-toastify";
import { usePermissions } from "../hooks/usePermissions";

import {
  Search,
  Filter,
  X,
  Mail,
  Phone,
  Trash2,
  ArrowLeft,
  Calendar,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Reply,
  Tag,
  Star,
  RefreshCw
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const safeStr = (v) => (v === null || v === undefined ? "" : String(v));

const STATUS_OPTIONS = ["New", "Reviewed", "Resolved", "Closed"];

const STATUS_STYLE = {
  New:      { pill: "bg-blue-100 text-blue-700 border border-blue-200",      dot: "bg-[#132242]"    },
  Reviewed: { pill: "bg-violet-100 text-violet-700 border border-violet-200", dot: "bg-violet-500"  },
  Resolved: { pill: "bg-emerald-100 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  Closed:   { pill: "bg-slate-100 text-slate-600 border border-slate-200",    dot: "bg-slate-400"   },
};

const AVATAR_COLORS = [
  "bg-[#132242]", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-fuchsia-500",
];

function getAvatarColor(name) {
  const c = (name || "?").charAt(0).toUpperCase();
  return AVATAR_COLORS[c.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0];
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
// eslint-disable-next-line no-unused-vars
function formatDateLong(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}
function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative pb-3 text-sm font-semibold flex items-center gap-2 transition-colors ${
        active ? "text-[#132242]" : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {label}
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
        active ? "bg-[#132242] text-white" : "bg-slate-200 text-slate-600"
      }`}>
        {count}
      </span>
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#132242] rounded-t-full" />
      )}
    </button>
  );
}

// ─── Message Card ─────────────────────────────────────────────────────────────
function MessageCard({ c, active, onClick }) {
  const isNew = c.status === "New";
  const avatarBg = active ? "bg-[#132242]" : getAvatarColor(c.name);
  const initial = (c.name || "?").charAt(0).toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 group ${
        active
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-white border-slate-100 hover:border-blue-100 hover:shadow-sm shadow-sm"
      }`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white ${avatarBg}`}>
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          {/* Row 1: name + date */}
          <div className="flex items-center justify-between mb-0.5">
            <p className={`font-bold text-sm truncate pr-2 ${active ? "text-blue-700" : "text-slate-900"}`}>
              {c.name || "Unknown Sender"}
            </p>
            <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{formatDate(c.createdAt)}</span>
          </div>

          {/* Row 2: subject + unread dot */}
          <div className="flex items-center justify-between mt-0.5 mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              {c.isStarred && <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />}
              <p className={`text-xs font-semibold truncate ${active ? "text-[#132242]" : "text-slate-700"}`}>
                {c.subject || "No Subject"}
              </p>
            </div>
            {isNew && <span className="w-2 h-2 rounded-full bg-[#132242] shrink-0" />}
          </div>

          {/* Row 3: message preview + status badge */}
          <div className="flex items-end justify-between">
            <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed pr-2">
              {c.message || "…"}
            </p>
            {c.status && !isNew && (
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${STATUS_STYLE[c.status]?.pill || "bg-slate-100 text-slate-500"}`}>
                {c.status}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Reading Pane ─────────────────────────────────────────────────────────────
function ReadingPane({ contact, onDelete, onStatusChange, onStarToggle, canWrite }) {
  if (!contact) {
    return (
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 text-slate-400 min-h-0 overflow-hidden">
        <Mail size={40} strokeWidth={1.2} />
        <p className="text-sm font-medium">Select a message to read</p>
      </div>
    );
  }

  const initial = (contact.name || "?").charAt(0).toUpperCase();
  const statusStyle = STATUS_STYLE[contact.status || "New"] || STATUS_STYLE.New;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
      
      {/* ── Top Action Bar (Aligned with left tabs) ── */}
      <div className="flex items-center justify-end gap-3 border-b border-transparent mb-4 px-1 shrink-0 h-[38px] pb-2">
        {canWrite && (
          <>
            <div className="relative">
              <select
                value={contact.status || "New"}
                onChange={(e) => onStatusChange(contact._id, e.target.value)}
                className={`appearance-none cursor-pointer pl-3.5 pr-8 py-1.5 rounded-full text-xs font-bold outline-none transition-colors shadow-sm ${statusStyle.pill}`}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
            </div>
            <button
              onClick={() => onDelete(contact)}
              className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1.5 hover:bg-white px-3 py-1.5 rounded-lg transition-colors shadow-sm bg-white/50 border border-slate-200/50"
              title="Delete"
            >
              <Trash2 size={14} /> Delete
            </button>
          </>
        )}
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden min-h-0">
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>

          {/* ── Header ── */}
          <div className="flex items-start gap-4 mb-8">
            {/* Large avatar */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 text-white shadow-md ${getAvatarColor(contact.name)}`}>
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                <h2 className="text-xl font-bold text-slate-900 leading-tight break-words">{contact.name || "Unknown"}</h2>
                {contact.isStarred && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold tracking-wide uppercase shrink-0">
                    <Star size={10} className="fill-amber-700" /> Starred
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5 break-all">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-[#132242] transition-colors">
                    {contact.email || "—"}
                  </a>
                </span>
                {contact.phone && (
                  <span className="flex items-center gap-1.5 shrink-0">
                    <Phone size={13} className="text-slate-400 shrink-0" />
                    {contact.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

        {/* ── Meta bar ── */}
        <div className="grid grid-cols-3 gap-0 mb-8 rounded-2xl border border-slate-100 bg-slate-50/60 overflow-hidden">
          {[
            { icon: <Tag size={15} className="text-blue-500" />, label: "Subject", value: contact.subject || "No Subject" },
            { icon: <Calendar size={15} className="text-blue-500" />, label: "Date",    value: formatDate(contact.createdAt) },
            { icon: <Clock size={15} className="text-blue-500" />,    label: "Time",    value: formatTime(contact.createdAt) },
          ].map((item, i) => (
            <div key={i} className={`px-5 py-4 ${i > 0 ? "border-l border-slate-100" : ""}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                {item.icon}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm leading-snug">{item.value}</p>
            </div>
          ))}
        </div>

        {/* ── Message body ── */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
          <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap font-[Georgia,serif]">
            {safeStr(contact.message) || <em className="text-slate-400">No message provided.</em>}
          </p>
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="px-8 py-4 border-t border-slate-100 bg-white/80 backdrop-blur-sm flex items-center gap-3 shrink-0">
        {contact.email && (
          <button 
            onClick={() => window.location.href = `mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject || 'Your Enquiry')}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#132242] hover:bg-[#132242] active:scale-95 text-white rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-500/20"
          >
            <Reply size={15} /> Reply
          </button>
        )}
        
        {canWrite && contact.status !== "New" && (
          <button 
            onClick={() => onStatusChange(contact._id, "New")}
            title="Mark as Unread"
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 active:scale-95 text-slate-700 rounded-xl font-semibold text-sm transition-all whitespace-nowrap"
          >
            <Mail size={15} /> Mark Unread
          </button>
        )}
        
        <div className="flex-1" />
        <button 
          onClick={() => onStarToggle(contact._id, contact.isStarred)}
          className={`w-9 h-9 flex items-center justify-center border hover:bg-slate-50 rounded-xl transition-colors ${
            contact.isStarred ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-white border-slate-200 text-slate-500'
          }`} 
          title={contact.isStarred ? "Unstar" : "Star"}
        >
          <Star size={15} className={contact.isStarred ? "fill-amber-500" : ""} />
        </button>
      </div>
    </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ target, onCancel, onConfirm }) {
  if (!target) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Delete message?</h3>
        <p className="text-sm text-slate-500 mb-6">
          This will permanently delete the enquiry from <strong className="text-slate-700">{target.name}</strong>. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Contact() {
  const navigate = useNavigate();
  const { canWrite } = usePermissions("contact");

  const [contacts, setContacts]       = useState([]);
  const [selectedId, setSelectedId]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [onlyWithPhone, setOnlyWithPhone]     = useState(false);
  const [onlyWithSubject, setOnlyWithSubject] = useState(false);
  const [statusFilter, setStatusFilter]       = useState("all");
  const [activeTab, setActiveTab]     = useState("Unread");
  const [sortBy, setSortBy]           = useState("newest");
  const [deleteOpen, setDeleteOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  const autoReviewedRef = useRef(new Set());

  // ── Fetch ──
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/contact");
      const items = res?.data?.data || [];
      setContacts(items);
      if (items.length > 0) setSelectedId(items[0]._id);
    } catch {
      toast.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const unreadCount = useMemo(
    () => contacts.filter((c) => safeStr(c.status) === "New").length,
    [contacts]
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let list = [...contacts];
    if (activeTab === "Unread") {
      list = list.filter((c) => safeStr(c.status) === "New");
    }
    if (q) list = list.filter((c) =>
      [c.name, c.email, c.phone, c.contactNumber, c.mobile, c.subject, c.message]
        .map(safeStr).join(" ").toLowerCase().includes(q)
    );
    if (onlyWithPhone) list = list.filter((c) => safeStr(c.phone || c.contactNumber || c.mobile).trim().length > 0);
    if (onlyWithSubject) list = list.filter((c) => safeStr(c.subject).trim().length > 0);
    if (statusFilter !== "all") list = list.filter((c) => safeStr(c.status || "New") === statusFilter);
    if (sortBy === "name") list.sort((a, b) => safeStr(a.name).localeCompare(safeStr(b.name)));
    else if (sortBy === "oldest") list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    else list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }, [contacts, searchTerm, onlyWithPhone, onlyWithSubject, statusFilter, sortBy, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selected = useMemo(
    () => filtered.find((c) => c._id === selectedId) || filtered[0] || null,
    [filtered, selectedId]
  );

  // Keep selectedId valid when filter changes
  useEffect(() => {
    if (filtered.length === 0) { setSelectedId(null); return; }
    if (!filtered.some((c) => c._id === selectedId)) setSelectedId(filtered[0]._id);
  }, [filtered, selectedId]);

  // Auto-mark New → Reviewed on open
  useEffect(() => {
    const run = async () => {
      if (!selected?._id) return;
      if (safeStr(selected.status || "New") !== "New") return;
      if (autoReviewedRef.current.has(selected._id)) return;
      autoReviewedRef.current.add(selected._id);
      setContacts((prev) => prev.map((c) => c._id === selected._id ? { ...c, status: "Reviewed" } : c));
      try {
        await apiClient.patch(`/contact/${selected._id}/status`, { status: "Reviewed" });
      } catch {
        setContacts((prev) => prev.map((c) => c._id === selected._id ? { ...c, status: "New" } : c));
      }
    };
    run();
  }, [selectedId, selected]);

  const patchStatus = async (id, status) => {
    try {
      await apiClient.patch(`/contact/${id}/status`, { status });
      setContacts((prev) => prev.map((c) => (c._id === id ? { ...c, status } : c)));
      toast.success("Status updated");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update status");
    }
  };

  const toggleStar = async (id, currentIsStarred) => {
    const newStarred = !currentIsStarred;
    setContacts((prev) => prev.map((c) => (c._id === id ? { ...c, isStarred: newStarred } : c)));
    try {
      await apiClient.patch(`/contact/${id}/star`, { isStarred: newStarred });
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to update star status");
      setContacts((prev) => prev.map((c) => (c._id === id ? { ...c, isStarred: currentIsStarred } : c)));
    }
  };

  const openDeleteModal  = (c) => { setDeleteTarget(c); setDeleteOpen(true); };
  const cancelDelete     = () => { setDeleteOpen(false); setDeleteTarget(null); };
  const confirmDelete    = async () => {
    if (!deleteTarget?._id) return;
    try {
      await apiClient.delete(`/contact/${deleteTarget._id}`);
      toast.success("Message deleted");
      setContacts((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      if (selectedId === deleteTarget._id) setSelectedId(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete message");
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleSelectMessage = (id) => setSelectedId(id);

  return (
    <div
      className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden min-h-0 px-6"
      style={{ background: "#F4F6FB", fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <div className="pt-6 mb-4 shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#132242] hover:text-blue-800 transition font-semibold w-fit">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mb-1.5">Contact Us</h1>
          <p className="text-sm text-slate-500">Manage and review all contact enquiries submitted<br />from the website.</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-[220px] shadow-sm"
              placeholder="Search messages…"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 border rounded-xl text-slate-500 shadow-sm transition-colors ${showFilters ? "bg-blue-50 border-blue-200 text-[#132242]" : "bg-white border-slate-200 hover:bg-slate-50"}`}
          >
            <Filter size={17} />
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-9 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Sort by Name</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Refresh */}
          <button onClick={fetchContacts} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm transition-colors">
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-5 shrink-0 flex flex-wrap gap-5 items-center relative">
          <button onClick={() => setShowFilters(false)} className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600">
            <X size={15} />
          </button>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input type="checkbox" checked={onlyWithPhone} onChange={(e) => setOnlyWithPhone(e.target.checked)} className="rounded border-slate-300 accent-blue-600" />
            Must include phone
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input type="checkbox" checked={onlyWithSubject} onChange={(e) => setOnlyWithSubject(e.target.checked)} className="rounded border-slate-300 accent-blue-600" />
            Must include subject
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">Status:</span>
            <select
              className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 outline-none bg-white font-medium text-slate-700"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ── Main Split ── */}
      <div className="flex-1 flex gap-5 min-h-0 overflow-hidden">

        {/* ── Left: Inbox ── */}
        <div className="w-[400px] flex flex-col shrink-0 h-full overflow-hidden min-h-0 relative pb-[60px]">

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200 mb-4 px-1 shrink-0">
            <TabBtn label="All Messages" count={contacts.length} active={activeTab === "All Messages"} onClick={() => { setActiveTab("All Messages"); setCurrentPage(1); }} />
            <TabBtn label="Unread" count={unreadCount} active={activeTab === "Unread"} onClick={() => { setActiveTab("Unread"); setCurrentPage(1); }} />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>
            {loading ? (
              <div className="space-y-2.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-full p-4 rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                        <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                        <div className="h-2 bg-slate-100 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">
                <Mail size={32} className="mx-auto mb-3 opacity-40" strokeWidth={1.2} />
                No messages found.
              </div>
            ) : (
              paginated.map((c) => (
                <MessageCard
                  key={c._id}
                  c={c}
                  active={c._id === selectedId}
                  onClick={() => handleSelectMessage(c._id)}
                />
              ))
            )}
          </div>
          
          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="absolute bottom-0 left-0 w-full bg-[#F4F6FB] pt-3 pb-1 flex justify-center items-center gap-1 z-10 shrink-0">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === p
                      ? "bg-[#132242] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              {totalPages > 5 && <span className="text-slate-400 text-xs mx-0.5">…</span>}
              {totalPages > 5 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50`}
                >
                  {totalPages}
                </button>
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Reading Pane ── */}
        <ReadingPane
          contact={selected}
          onDelete={openDeleteModal}
          onStatusChange={patchStatus}
          onStarToggle={toggleStar}
          canWrite={canWrite}
        />
      </div>

      {/* ── Delete Modal ── */}
      <DeleteModal target={deleteOpen ? deleteTarget : null} onCancel={cancelDelete} onConfirm={confirmDelete} />
    </div>
  );
}
