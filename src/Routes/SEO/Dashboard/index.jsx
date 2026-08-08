import React, { useState, useEffect } from "react";
import { Activity, FileText, AlertTriangle, Link as LinkIcon, Users, MousePointer2, Clock, Globe } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { apiClient } from "../../../helper/apiClient";

export default function HealthDashboard() {
  const [stats, setStats] = useState({
    totalPages: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    missingMetadata: 0,
    missingSchema: 0,
    redirects: 0,
    avgScore: 0
  });

  const [analyticsData, setAnalyticsData] = useState({
    chartData: [],
    summary: {
      uniqueVisitors: 0,
      totalPageviews: 0,
      bounceRate: "0%",
      avgSession: "0m 0s"
    }
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await apiClient.get("/api/v1/seo/analytics");
      if (res.data) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics data", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchHealthData = async () => {
    try {
      const [pagesRes, redirectsRes] = await Promise.all([
        apiClient.get("/api/v1/seo/pages"),
        apiClient.get("/api/v1/seo/redirects")
      ]);
      
      const pages = pagesRes.data.data || [];
      const redirects = redirectsRes.data.data || [];
      
      let published = 0;
      let draft = 0;
      let scheduled = 0;
      let missingMeta = 0;
      let missingSchema = 0;
      let totalScore = 0;
      
      pages.forEach(p => {
        if (p.status === 'Published') published++;
        if (p.status === 'Draft') draft++;
        if (p.status === 'Scheduled') scheduled++;
        
        if (!p.title || !p.description) missingMeta++;
        if (!p.schema_type || p.schema_type === 'None') missingSchema++;
        
        totalScore += (p.seo_score || 0);
      });

      setStats({
        totalPages: pages.length,
        published,
        draft,
        scheduled,
        missingMetadata: missingMeta,
        missingSchema: missingSchema,
        redirects: redirects.length,
        avgScore: pages.length > 0 ? Math.round(totalScore / pages.length) : 0
      });
    } catch (err) {
      console.error("Failed to fetch health stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Health Data...</div>;

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Avg SEO Score</h3>
            <div className={`p-2 rounded-lg ${stats.avgScore >= 80 ? 'bg-green-100 text-green-700' : stats.avgScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              <Activity size={18} />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.avgScore}</span>
            <span className="text-sm text-gray-500 mb-1">/ 100</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Total Pages</h3>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileText size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPages}</div>
          <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> {stats.published} Pub</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> {stats.scheduled} Sch</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400"></div> {stats.draft} Dft</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Active Redirects</h3>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <LinkIcon size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.redirects}</div>
          <p className="text-xs text-gray-500 font-medium">Tracking 301, 302, 410</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600">Action Required</h3>
            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Missing Metadata</span>
              <span className="font-semibold text-red-600">{stats.missingMetadata}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Missing Schema</span>
              <span className="font-semibold text-orange-600">{stats.missingSchema}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Overview */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Traffic Overview</h2>
            <p className="text-sm text-gray-500">Live data from Google Analytics</p>
          </div>
        </div>

        {analyticsLoading ? (
          <div className="p-12 text-center text-gray-500 bg-white border border-gray-200 rounded-xl shadow-sm">
            Loading Google Analytics...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Unique Visitors", value: analyticsData.summary.uniqueVisitors.toLocaleString(), trend: "Live", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
                { label: "Total Pageviews", value: analyticsData.summary.totalPageviews.toLocaleString(), trend: "Live", icon: Globe, color: "text-emerald-600", bg: "bg-emerald-100" },
                { label: "Bounce Rate", value: analyticsData.summary.bounceRate, trend: "Live", icon: MousePointer2, color: "text-amber-600", bg: "bg-amber-100" },
                { label: "Avg Session", value: analyticsData.summary.avgSession, trend: "Live", icon: Clock, color: "text-purple-600", bg: "bg-purple-100" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon size={18} className={stat.color} />
                    </div>
                    <span className={`text-xs font-bold text-blue-600`}>
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-[350px]">
              <h3 className="text-sm font-bold text-gray-700 mb-6">Visitors (Last 30 Days)</h3>
              {analyticsData.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#111827', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Waiting for traffic data...
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
