import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Search, X, Mail, FileText, ArrowLeft, Calendar, Phone, MapPin, Briefcase, GraduationCap, Filter, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { apiClient } from "../helper/apiClient";
import { toast } from "react-toastify";
import { usePermissions } from "../hooks/usePermissions";
import ResumeViewer from "../Components/ResumeViewer";

const COLUMNS = ["Pending", "Reviewed", "Shortlisted", "Hired", "Rejected"];

// Helper component for the All Details modal
const DetailRow = ({ label, value, link, isTextarea }) => {
  if (!value || value === "" || value === "null" || value === "undefined") return null;
  return (
    <div className={`flex flex-col gap-1 ${isTextarea ? "col-span-full" : ""}`}>
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      {link ? (
        <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:underline break-words">
          {value}
        </a>
      ) : isTextarea ? (
        <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">{value}</div>
      ) : (
        <span className="text-sm text-gray-800 font-medium break-words">{value}</span>
      )}
    </div>
  );
};

// Memoized Kanban Card for performance
const KanbanCard = React.memo(({ applicant, canWrite, handleDragStart, handleDragEnd, setSelectedApplicant, fullName }) => {
  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, applicant)}
      onDragEnd={handleDragEnd}
      onClick={() => setSelectedApplicant(applicant)}
      className="group bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-gray-900 text-sm tracking-tight">{fullName(applicant)}</h3>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Mail size={14} className="text-gray-400" />
          <span className="truncate">{applicant.email}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Calendar size={14} className="text-gray-400" />
          {new Date(applicant.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {applicant.resumeKey && (
          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide flex items-center gap-1">
            <FileText size={12} />
            Resume
          </span>
        )}
        {applicant.totalWorkExperience && (
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide">
            {applicant.totalWorkExperience} exp
          </span>
        )}
      </div>
    </div>
  );
});

const CareerApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { canWrite } = usePermissions("careers");

  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [viewMode, setViewMode] = useState("kanban");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Filtering and Sorting States
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest"); 
  const [filterLocation, setFilterLocation] = useState("All");
  const [filterEdu, setFilterEdu] = useState("All");
  const [filterExp, setFilterExp] = useState("All");
  const [filterDate, setFilterDate] = useState("All");


  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/job/applicants/${jobId}`, {
        params: { page: 1, limit: 1000000, search },
      });
      let list = res?.data?.data || [];
      if (!Array.isArray(list)) list = [];
      list = list.map(a => ({ ...a, _id: a._id || a.id }));

      setApplicants(list);
    } catch {
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  }, [jobId, search]);

  const fetchJobDetails = useCallback(async () => {
    try {
      const res = await apiClient.get(`/job/${jobId}`);
      setJobTitle(res?.data?.data?.title || "");
    } catch {
      // non-critical
    }
  }, [jobId]);

  useEffect(() => { fetchJobDetails(); }, [fetchJobDetails]);
  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  const searchTimer = useRef(null);
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchApplicants();
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search, fetchApplicants]);

  const updateStatus = async (id, newStatus, notes = "") => {
    if (!canWrite) {
      toast.error("You don't have permission to perform this action");
      return;
    }

    // Capture old status for potential revert
    const applicant = applicants.find(a => a._id === id);
    const oldStatus = applicant?.status;

    // Optimistic UI update: instantly move the card to the new column
    setApplicants(prev => prev.map(a => a._id === id ? { ...a, status: newStatus, notes: notes || a.notes } : a));

    try {
      await apiClient.patch(`/job/applicants/${id}/status`, {
        status: newStatus,
        notes,
      });
      toast.success("Applicant updated");
      if (selectedApplicant && selectedApplicant._id === id) {
        setSelectedApplicant((prev) => ({ ...prev, status: newStatus, notes: notes || prev.notes }));
      }
      // Re-fetch to ensure data synchronization across tabs/devices
      await fetchApplicants();
    } catch {
      toast.error("Failed to update applicant");
      // Revert on failure
      if (oldStatus) {
        setApplicants(prev => prev.map(a => a._id === id ? { ...a, status: oldStatus } : a));
      }
    }
  };


  const fullName = (a) =>
    [a.firstName, a.lastName].filter(Boolean).join(" ") || a.email;

  // HTML5 Drag and Drop
  const handleDragStart = (e, applicant) => {
    if (!canWrite) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("applicantId", applicant._id || applicant.id);
    e.dataTransfer.effectAllowed = "move";
    
    // Slight delay to allow the browser to capture the fully opaque ghost image
    setTimeout(() => {
      if (e.target) e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const applicantId = e.dataTransfer.getData("applicantId");
    if (applicantId) {
      const applicant = applicants.find(a => a._id === applicantId);
      if (applicant && applicant.status !== newStatus) {
        updateStatus(applicantId, newStatus);
      }
    }
  };

  const downloadCSV = async () => {
    if (!applicants.length) { toast.warning("No applicants to export"); return; }

    const formatPhone = (phone) => {
      if (!phone) return "";
      const cleaned = String(phone).replace(/\D/g, "");
      if (cleaned.length === 10) return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
      return cleaned ? `+91 ${cleaned}` : "";
    };

    const formatDate = (date) => {
      if (!date) return "";
      try {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
      } catch { return ""; }
    };

    const headers = ["S.No", "Candidate Name", "Email", "Job Title", "Phone", "Applied Date", "Status"];
    const rows = applicants.map((a, i) => [
      String(i + 1),
      fullName(a),
      String(a.email || ""),
      String(jobTitle || ""),
      String(formatPhone(a.phone)),
      String(formatDate(a.createdAt)),
      String(a.status || ""),
    ]);

    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${jobTitle}-applications-${new Date().toISOString().split("T")[0]}.csv`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const getColumnConfig = (col) => {
    const config = {
      Pending: { borderTop: "border-gray-400" },
      Reviewed: { borderTop: "border-blue-500" },
      Shortlisted: { borderTop: "border-amber-500" },
      Hired: { borderTop: "border-emerald-500" },
      Rejected: { borderTop: "border-red-500" },
    };
    return config[col] || config.Pending;
  };

  const cleanFilterString = (str) => {
    if (!str) return "";
    const cleaned = str.trim();
    if (["NA", "N/A", "NONE", "-", "0"].includes(cleaned.toUpperCase())) return "";
    return cleaned;
  };

  const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  const STANDARD_EDU = ["Diploma", "B.Tech", "M.Tech", "MBA", "PhD", "Design", "Marketing", "Social Media", "B.A", "B.Sc", "Other"];
  const STANDARD_EXP = ["Fresher", "Intern", "Freelancing", "6 Months", "1 Year", "2 Years", "3 Years", "4 Years", "5 Years", "6 Years", "7 Years", "8 Years", "9 Years", "10+ Years"];

  const normalizeExperience = (expString) => {
    if (!expString) return "";
    let cleaned = expString.trim().toLowerCase();
    
    if (["na", "n/a", "none", "-", "0", "fresher"].includes(cleaned)) return "Fresher";
    if (cleaned === "intern" || cleaned === "internship") return "Intern";
    if (cleaned === "freelancing" || cleaned === "freelancer") return "Freelancing";
    
    // Handle '6 months' specifically
    if (cleaned === "6 months" || cleaned === "6 month") return "6 Months";
    
    // Map any numeric "X", "X year", "X years", "X yrs" to "X Years" (or "1 Year", "10+ Years")
    const yrMatch = cleaned.match(/^(\d+)\s*(?:years?|yrs?|\+)?$/);
    if (yrMatch) {
      const num = parseInt(yrMatch[1], 10);
      if (num === 0) return "Fresher";
      if (num === 1) return "1 Year";
      if (num >= 10) return "10+ Years";
      return `${num} Years`;
    }
    
    // If it's a specific month count, e.g. "14 months", normalize to Years if >= 12
    const monthMatch = cleaned.match(/^(\d+)\s*months?$/);
    if (monthMatch) {
      const months = parseInt(monthMatch[1], 10);
      if (months === 6) return "6 Months";
      if (months < 12 && months > 0) return "6 Months";
      if (months >= 12) {
        const numYrs = Math.floor(months/12);
        if (numYrs === 1) return "1 Year";
        if (numYrs >= 10) return "10+ Years";
        return `${numYrs} Years`;
      }
    }

    const standardMatch = STANDARD_EXP.find(s => s.toLowerCase() === cleaned);
    if (standardMatch) return standardMatch;

    return cleanFilterString(expString);
  };

  const formatLocationToState = (address) => {
    if (!address) return "";
    const parts = address.split(',').map(s => s.trim()).filter(Boolean);
    let lastPart = parts[parts.length - 1];
    if (!lastPart) return "";
    // Remove pin codes/zip codes
    lastPart = lastPart.replace(/[- ]?\d+$/, '').trim();
    if (!lastPart) return "";
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  };

  const parseExperience = (expString) => {
    if (!expString) return 0;
    const lower = expString.toLowerCase();
    const numMatch = lower.match(/(\d+(\.\d+)?)/);
    if (!numMatch) return 0;
    let num = parseFloat(numMatch[1]);
    if (lower.includes("month")) num = num / 12;
    return num;
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] pb-8 px-8 font-sans">
      <div className="pt-6 mb-4 flex justify-between items-center w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#0c55cc] hover:text-blue-800 transition font-semibold w-fit">
          <ArrowLeft size={16} /> Back to Jobs
        </button>
        <button
          onClick={downloadCSV}
          className="bg-indigo-600 px-5 py-2 text-white rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 flex-shrink-0"
        >
          <Download size={16} /> Export
        </button>
      </div>

      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40 flex justify-between items-center w-full py-4 mb-6 gap-4 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-indigo-900 tracking-tight whitespace-nowrap">Applicant Tracking</h1>
          {jobTitle && (
            <>
              <div className="hidden sm:block h-8 w-px bg-gray-200"></div>
              <div className="flex flex-col">
                <span className="text-gray-800 font-semibold leading-tight whitespace-nowrap">{jobTitle}</span>
                <span className="text-xs text-gray-500 mt-0.5 font-medium whitespace-nowrap">Total Applications: {applicants.length}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 xl:gap-4 flex-shrink-0">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 w-full transition-all outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 border flex-shrink-0 ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter size={16} /> Filters
          </button>
          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200/60 flex-shrink-0">
            <button 
              onClick={() => setViewMode("kanban")} 
              className={`p-1.5 rounded-md flex items-center transition-all ${viewMode === "kanban" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
              title="Kanban View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode("table")} 
              className={`p-1.5 rounded-md flex items-center transition-all ${viewMode === "table" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* LinkedIn Style Filter Bar */}
      {showFilters && (
        <div className="bg-white border-y border-gray-200 shadow-sm mb-6 animate-in slide-in-from-top-2">
          <div className="px-6 py-3 flex flex-wrap items-center gap-4">
            <span className="text-gray-500 font-semibold text-xs flex items-center gap-1 uppercase tracking-wider"><Filter size={14} /> Filters</span>
            
            <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 hover:bg-gray-100 transition-colors outline-none cursor-pointer text-gray-700 max-w-[180px] truncate">
              <option value="All">Location (All)</option>
              {INDIAN_STATES.sort().map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            
            <select value={filterEdu} onChange={(e) => setFilterEdu(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 hover:bg-gray-100 transition-colors outline-none cursor-pointer text-gray-700 max-w-[160px] truncate">
              <option value="All">Education (All)</option>
              {[...new Set([...STANDARD_EDU, ...applicants.map(a => cleanFilterString(a.highestQualification)).filter(Boolean)])].filter(e => e !== "All").sort((a, b) => { if (a === "Other") return 1; if (b === "Other") return -1; return a.localeCompare(b); }).map(edu => <option key={edu} value={edu}>{edu}</option>)}
            </select>

            <select value={filterExp} onChange={(e) => setFilterExp(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 hover:bg-gray-100 transition-colors outline-none cursor-pointer text-gray-700 max-w-[150px] truncate">
              <option value="All">Experience (All)</option>
              {[...new Set([...STANDARD_EXP, ...applicants.map(a => normalizeExperience(a.totalWorkExperience)).filter(Boolean)])].filter(e => e !== "All").sort((a, b) => parseExperience(a) - parseExperience(b)).map(exp => <option key={exp} value={exp}>{exp}</option>)}
            </select>

            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 hover:bg-gray-100 transition-colors outline-none cursor-pointer text-gray-700">
              <option value="All">Date (Any Time)</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>

            <div className="h-6 w-px bg-gray-300 mx-2 hidden md:block"></div>

            <span className="text-gray-500 font-semibold text-xs flex items-center gap-1 uppercase tracking-wider hidden md:flex"><SlidersHorizontal size={14} /> Sort</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500 hover:bg-gray-100 transition-colors outline-none cursor-pointer text-gray-700">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="exp-high">Experience High to Low</option>
              <option value="exp-low">Experience Low to High</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
              <option value="name-desc">Alphabetical (Z-A)</option>
            </select>
          </div>
          
          {/* Active Pills Strip */}
          {(filterLocation !== "All" || filterEdu !== "All" || filterExp !== "All" || filterDate !== "All" || sortBy !== "newest") && (
            <div className="bg-gray-50/50 px-6 py-2.5 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-medium mr-2">Active:</span>
              
              {filterLocation !== "All" && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium border border-indigo-100">
                  Location: {filterLocation} <X size={12} className="cursor-pointer hover:text-indigo-900" onClick={() => setFilterLocation("All")}/>
                </span>
              )}
              {filterEdu !== "All" && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium border border-indigo-100">
                  Education: {filterEdu} <X size={12} className="cursor-pointer hover:text-indigo-900" onClick={() => setFilterEdu("All")}/>
                </span>
              )}
              {filterExp !== "All" && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium border border-indigo-100">
                  Experience: {filterExp} <X size={12} className="cursor-pointer hover:text-indigo-900" onClick={() => setFilterExp("All")}/>
                </span>
              )}
              {filterDate !== "All" && (
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium border border-indigo-100">
                  Date: {filterDate} <X size={12} className="cursor-pointer hover:text-indigo-900" onClick={() => setFilterDate("All")}/>
                </span>
              )}
              
              <button 
                onClick={() => { setSortBy("newest"); setFilterLocation("All"); setFilterEdu("All"); setFilterExp("All"); setFilterDate("All"); }}
                className="ml-auto text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors underline"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-200px)]">
        {loading ? (
          <div className="text-gray-400 text-sm p-4">Loading applicants...</div>
        ) : (() => {
          // Process applicants dynamically before mapping columns
          let processed = [...applicants];
          if (filterLocation !== "All") processed = processed.filter(a => formatLocationToState(a.currentAddress) === filterLocation);
          if (filterEdu !== "All") processed = processed.filter(a => cleanFilterString(a.highestQualification) === filterEdu);
          if (filterExp !== "All") processed = processed.filter(a => normalizeExperience(a.totalWorkExperience) === filterExp);
          
          if (filterDate === "Last 7 Days") {
            const d = new Date(); d.setDate(d.getDate() - 7);
            processed = processed.filter(a => new Date(a.createdAt) >= d);
          } else if (filterDate === "Last 30 Days") {
            const d = new Date(); d.setDate(d.getDate() - 30);
            processed = processed.filter(a => new Date(a.createdAt) >= d);
          }
          
          processed.sort((a, b) => {
            if (sortBy === "newest" || sortBy === "oldest") {
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              return sortBy === "newest" ? dateB - dateA : dateA - dateB;
            }
            if (sortBy === "exp-high" || sortBy === "exp-low") {
              const expA = parseExperience(a.totalWorkExperience);
              const expB = parseExperience(b.totalWorkExperience);
              return sortBy === "exp-high" ? expB - expA : expA - expB;
            }
            if (sortBy === "name-asc" || sortBy === "name-desc") {
              const nameA = fullName(a).toLowerCase();
              const nameB = fullName(b).toLowerCase();
              if (nameA < nameB) return sortBy === "name-asc" ? -1 : 1;
              if (nameA > nameB) return sortBy === "name-asc" ? 1 : -1;
              return 0;
            }
            return 0;
          });

          if (viewMode === "table") {
            return (
              <div className="w-full h-full bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden flex flex-col">
                <div className="overflow-auto custom-scrollbar flex-1">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-[11px]">Name</th>
                        <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                        <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-[11px]">Email</th>
                        <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-[11px]">Phone</th>
                        <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-[11px]">Experience</th>
                        <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-[11px]">Education</th>
                        <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-[11px]">Location</th>
                        <th className="px-5 py-3.5 font-semibold uppercase tracking-wider text-[11px]">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {processed.map((a) => (
                        <tr 
                          key={a._id} 
                          onClick={() => setSelectedApplicant(a)}
                          className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                        >
                          <td className="px-5 py-3.5 font-bold text-slate-900">{fullName(a)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
                              a.status === 'Hired' ? 'bg-emerald-100 text-emerald-700' :
                              a.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                              a.status === 'Shortlisted' ? 'bg-amber-100 text-amber-700' :
                              a.status === 'Reviewed' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{a.email}</td>
                          <td className="px-5 py-3.5 text-slate-600">{a.phone}</td>
                          <td className="px-5 py-3.5 text-slate-600">{normalizeExperience(a.totalWorkExperience) || '-'}</td>
                          <td className="px-5 py-3.5 text-slate-600">{cleanFilterString(a.highestQualification) || '-'}</td>
                          <td className="px-5 py-3.5 text-slate-600 truncate max-w-[150px]">{formatLocationToState(a.currentAddress) || '-'}</td>
                          <td className="px-5 py-3.5 text-slate-600">{new Date(a.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          return COLUMNS.map((col) => {
            const config = getColumnConfig(col);
            const count = processed.filter(a => a.status === col).length;

            return (
              <div
                key={col}
                className={`flex-shrink-0 w-80 flex flex-col h-full bg-gray-50/80 rounded-xl border border-gray-200/60`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col)}
              >
                <div className={`p-4 flex items-center justify-between border-t-4 ${config.borderTop} rounded-t-xl bg-white shadow-sm`}>
                  <span className="font-semibold text-gray-800 text-sm">{col} &bull; {count}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {processed
                    .filter((a) => a.status === col)
                    .map((a) => (
                      <KanbanCard 
                        key={a._id || a.id} 
                        applicant={a}
                        canWrite={canWrite}
                        handleDragStart={handleDragStart}
                        handleDragEnd={handleDragEnd}
                        setSelectedApplicant={setSelectedApplicant}
                        fullName={fullName}
                      />
                    ))}
                </div>
              </div>
            );
          })
        })()}
      </div>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6"
          onClick={() => setSelectedApplicant(null)}
        >
          <div
            className="bg-white w-full max-w-6xl h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedApplicant(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full text-gray-400 hover:text-gray-700 bg-gray-100/50 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Left Sidebar (1/3) */}
            <div className="w-full md:w-1/3 bg-gray-50/80 p-6 md:p-8 border-r border-gray-200 overflow-y-auto flex flex-col gap-6">
              {/* Candidate Identity */}
              <div className="flex flex-col items-center text-center gap-4 pt-4">
                <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl font-bold shadow-sm border-4 border-white uppercase">
                  {selectedApplicant.firstName?.[0]}{selectedApplicant.lastName?.[0]}
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-gray-900">{fullName(selectedApplicant)}</h2>
                  <p className="text-sm text-gray-500">{selectedApplicant.email}</p>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Phone size={18} /></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phone</span>
                    <span className="text-sm text-gray-800 font-medium">{selectedApplicant.phone || "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><MapPin size={18} /></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Location</span>
                    <span className="text-sm text-gray-800 font-medium">{selectedApplicant.country || "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><Briefcase size={18} /></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Experience</span>
                    <span className="text-sm text-gray-800 font-medium">{selectedApplicant.experience || "—"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600"><GraduationCap size={18} /></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Education</span>
                    <span className="text-sm text-gray-800 font-medium">
                      {selectedApplicant.qualification} {selectedApplicant.college ? `at ${selectedApplicant.college}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* View All Details Button (Prominent) */}
              <button
                onClick={() => setShowAllDetails(true)}
                className="w-full bg-indigo-50 border-2 border-indigo-500 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-bold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-[15px] mt-2 mb-2 animate-pulse-slight"
              >
                <FileText size={18} />
                View Full Candidate Details
              </button>

              {/* Actions */}
              <div className="flex flex-col gap-5 mt-auto pt-2">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Update Status</label>
                  <select
                    disabled={!canWrite}
                    value={selectedApplicant.status}
                    onChange={(e) =>
                      setSelectedApplicant((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Internal Notes</label>
                  <textarea
                    disabled={!canWrite}
                    value={selectedApplicant.notes || ""}
                    onChange={(e) =>
                      setSelectedApplicant((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm resize-none min-h-[100px] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Add confidential hiring notes..."
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {canWrite && (
                    <button
                      onClick={() =>
                        updateStatus(
                          selectedApplicant._id,
                          selectedApplicant.status,
                          selectedApplicant.notes || ""
                        )
                      }
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      Save Changes
                    </button>
                  )}
                  <a
                    href={`mailto:${selectedApplicant.email}`}
                    className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail size={18} />
                    Contact Candidate
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column (2/3) */}
            <div className="w-full md:w-2/3 bg-white flex flex-col p-6 md:p-8 overflow-y-auto">
              {/* Use ResumeViewer component for tabbed document viewing */}
              <ResumeViewer applicant={selectedApplicant} />
            </div>
          </div>
        </div>
      )}

      {/* All Details Modal */}
      {showAllDetails && selectedApplicant && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 md:p-6"
          onClick={() => setShowAllDetails(false)}
        >
          <div
            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold shadow-sm border-2 border-white uppercase">
                  {selectedApplicant.firstName?.[0]}{selectedApplicant.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">Complete Application Profile</h3>
                  <p className="text-sm text-gray-500 font-medium">{fullName(selectedApplicant)} &bull; Applied on {new Date(selectedApplicant.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllDetails(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 overflow-y-auto bg-slate-50 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Section: Personal Information */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider border-b pb-2 mb-3">Personal & Contact</h4>
                  <DetailRow label="Full Name" value={fullName(selectedApplicant)} />
                  <DetailRow label="Email" value={selectedApplicant.email} link={`mailto:${selectedApplicant.email}`} />
                  <DetailRow label="Phone" value={selectedApplicant.phone} link={`tel:${selectedApplicant.phone}`} />
                  <DetailRow label="Location" value={[selectedApplicant.city, selectedApplicant.state, selectedApplicant.country].filter(Boolean).join(", ")} />
                </div>

                {/* Section: Links & Social */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider border-b pb-2 mb-3">Professional Links</h4>
                  <DetailRow label="LinkedIn" value={selectedApplicant.linkedin} link={selectedApplicant.linkedin} />
                  <DetailRow label="GitHub" value={selectedApplicant.github} link={selectedApplicant.github} />
                  <DetailRow label="Portfolio" value={selectedApplicant.portfolio} link={selectedApplicant.portfolio} />
                </div>

                {/* Section: Professional Experience */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 md:col-span-2">
                  <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider border-b pb-2 mb-3">Work Experience</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow label="Total Experience" value={selectedApplicant.experience || selectedApplicant.totalWorkExperience} />
                    <DetailRow label="Notice Period" value={selectedApplicant.noticePeriod} />
                    <DetailRow label="Current Company" value={selectedApplicant.currentCompany} />
                    <DetailRow label="Current Designation" value={selectedApplicant.currentDesignation} />
                    <DetailRow label="Current CTC" value={selectedApplicant.currentCtc} />
                    <DetailRow label="Expected CTC" value={selectedApplicant.expectedCtc} />
                    <DetailRow label="Internship Experience" value={selectedApplicant.internshipExperience} />
                  </div>
                </div>

                {/* Section: Education */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 md:col-span-2">
                  <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider border-b pb-2 mb-3">Educational Background</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailRow label="Highest Qualification" value={selectedApplicant.qualification || selectedApplicant.highestQualification} />
                    <DetailRow label="Degree/Program" value={selectedApplicant.degree} />
                    <DetailRow label="Stream/Branch" value={selectedApplicant.stream || selectedApplicant.streamOfQualification} />
                    <DetailRow label="College/University" value={selectedApplicant.college} />
                    <DetailRow label="Graduation Year" value={selectedApplicant.graduationYear} />
                    <DetailRow label="CGPA/Percentage" value={selectedApplicant.cgpa} />
                    <DetailRow label="Current Semester" value={selectedApplicant.currentSemester} />
                    <DetailRow label="Other Qualification" value={selectedApplicant.otherQualification} />
                  </div>
                </div>

                {/* Section: Skills & Additional Info */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4 md:col-span-2">
                  <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider border-b pb-2 mb-3">Skills & Additional Information</h4>
                  <DetailRow label="Technical Skills" value={selectedApplicant.skills} />
                  <DetailRow label="Relevant Skills" value={selectedApplicant.relevantSkills} />
                  <DetailRow label="Why Auxosys?" value={selectedApplicant.whyAuxosys} isTextarea />
                  <DetailRow label="Additional Notes" value={selectedApplicant.additionalNotes} isTextarea />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-white p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAllDetails(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerApplicants;
