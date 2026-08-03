import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Briefcase,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
 
import { apiClient } from "../helper/apiClient";

/* ---------------- MAIN ---------------- */

const PIE_COLORS = [
  "#3B82F6", // Vibrant Blue
  "#60A5FA", // Light Blue
  "#93C5FD", // Lighter Blue
  "#F59E0B",
  "#10B981",
  "#EF4444",
];

const DashboardHome = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiClient.get("/dashboard");
        if (res?.data?.success) {
          setDashboard(res.data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        setError(true);
      }
    };
    fetchDashboard();
  }, []);

  if (!dashboard && !error) return <div className="p-8 text-slate-500">Loading dashboard…</div>;
  if (error) return <div className="p-8 text-red-500">Failed to load dashboard. Please refresh.</div>;

  const { kpi = {}, charts = {}, lists = {} } = dashboard ?? {};

  const weeklyLabels = charts.weeklyActivity?.labels ?? [];
  const weeklySeries = charts.weeklyActivity?.series ?? [];
  const weeklyData = weeklyLabels.map((label, i) => ({
    name: label,
    contacts:
      weeklySeries.find((s) => s.name === "Contacts")?.data[i] ?? 0,
    applications:
      weeklySeries.find((s) => s.name === "Applications")?.data[i] ?? 0,
  }));

  const contactHistory = weeklySeries.find((s) => s.name === "Contacts")?.data || [0,0,0,0,0,0,0];
  const appHistory = weeklySeries.find((s) => s.name === "Applications")?.data || [0,0,0,0,0,0,0];
  const jobHistory = weeklySeries.find((s) => s.name === "Jobs")?.data || [0,0,0,0,0,0,0];
  const newsHistory = weeklySeries.find((s) => s.name === "News")?.data || [0,0,0,0,0,0,0];

  const mapToChartData = (arr) => arr.map(val => ({ y: val }));

  const contactLabels = charts.contactStatus?.labels ?? [];
  const contactCounts = charts.contactStatus?.data ?? [];
  const pieData = contactLabels.map((l, i) => ({
    name: l,
    value: contactCounts[i] ?? 0,
  }));

  const StatBlock = ({ label, value, color, data, icon: Icon }) => (
    <div className="flex flex-col items-center p-6 group">
      <span className="text-[32px] leading-tight font-semibold text-[#1a1a1a] mb-1">{value}</span>
      <span className="text-[13px] text-gray-700 font-medium mb-6 flex items-center justify-center gap-1.5">
        {label}
        {Icon && <Icon size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />}
      </span>
      <div className="h-10 w-full mt-auto relative border-b" style={{ borderColor: (!data || !data.some(d => d.y > 0)) ? color : 'transparent' }}>
        {data && data.some(d => d.y > 0) && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`color-${label.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="linear"
                dataKey="y"
                stroke={color}
                fillOpacity={1}
                fill={`url(#color-${label.replace(/\s+/g, '')})`}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 text-slate-600 min-h-screen pb-10 flex-1 flex flex-col h-full overflow-hidden relative px-6">
      
      <div className="pt-6 mb-4 shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#132242] hover:text-blue-800 transition font-semibold w-fit">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Top Header & Breadcrumbs */}
      <header className="w-full shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 sticky top-0 shadow-sm py-4 rounded-t-xl px-6 mb-6">
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl text-slate-900 font-bold tracking-tight">Overview</h2>
        </div>
      </header>

      {/* Scrollable Dashboard Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-[1280px] mx-auto flex flex-col gap-6">
          
          {/* 1. Unified KPI Grid */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              <StatBlock label="Total Enquiries" value={kpi?.totalContacts?.value ?? 0} color="#94a3b8" data={mapToChartData(contactHistory)} icon={MessageSquare} />
              <StatBlock label="Active Jobs" value={kpi?.activeJobs?.value ?? 0} color="#38bdf8" data={mapToChartData(jobHistory)} icon={Briefcase} />
              <StatBlock label="Open Job Apps" value={kpi?.jobApplications?.value ?? 0} color="#10b981" data={mapToChartData(appHistory)} icon={Briefcase} />
              <StatBlock label="Case Studies" value={kpi?.caseStudies?.value ?? 0} color="#f87171" data={mapToChartData(newsHistory)} icon={FileText} />
            </div>
          </section>

          {/* 2. Chart Row */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart */}
            <div className="bg-white rounded-xl p-6 lg:col-span-2 flex flex-col border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Weekly Activity</h3>
              </div>
              <div className="flex-1 min-h-[260px]">
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px", color: "#0f172a" }}
                      itemStyle={{ color: "#0f172a" }}
                    />
                    <Area type="monotone" dataKey="contacts" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorContacts)" />
                    <Area type="monotone" dataKey="applications" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-xl p-6 flex flex-col border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Enquiry Status</h3>
              </div>
              <div className="flex-1 min-h-[260px] relative">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={2} stroke="none">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px", color: "#0f172a" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 m-auto flex items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-slate-900">{contactCounts.reduce((a, b) => a + b, 0)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 3. List Row */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Contacts */}
            <div className="bg-white rounded-xl flex flex-col border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Recent Contacts</h3>
              </div>
              <div className="flex flex-col p-2">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-5">Name &amp; Role</div>
                  <div className="col-span-4">Date</div>
                  <div className="col-span-3 text-right">Status</div>
                </div>
                {(lists.recentContacts || []).slice(0, 5).map((c) => (
                  <div key={c._id || c.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 text-xs">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-sm text-slate-900 font-medium truncate">{c.name}</span>
                        <span className="text-xs text-slate-500 truncate">{c.subject}</span>
                      </div>
                    </div>
                    <div className="col-span-4 text-sm text-slate-500 truncate">
                      {c.timestamp ? new Date(c.timestamp).toLocaleDateString() : "—"}
                    </div>
                    <div className="col-span-3 flex justify-end">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${c.status === "Pending" ? "bg-red-100 text-red-600" : "bg-blue-100 text-[#132242]"}`}>
                        {c.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Applications */}
            <div className="bg-white rounded-xl flex flex-col border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Latest Applications</h3>
              </div>
              <div className="flex flex-col p-2">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-5">Candidate &amp; Role</div>
                  <div className="col-span-4">Date Applied</div>
                  <div className="col-span-3 text-right">Stage</div>
                </div>
                {(lists.recentApplications || []).slice(0, 5).map((a) => (
                  <div key={a._id || a.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 text-xs">
                        {a.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-sm text-slate-900 font-medium truncate">{a.name}</span>
                        <span className="text-xs text-slate-500 truncate">{a.jobTitle}</span>
                      </div>
                    </div>
                    <div className="col-span-4 text-sm text-slate-500 truncate">
                      {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : "—"}
                    </div>
                    <div className="col-span-3 flex justify-end">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                        {a.status || "Review"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
