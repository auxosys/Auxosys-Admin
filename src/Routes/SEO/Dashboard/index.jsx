import React, { useState, useEffect } from "react";
import { Activity, FileText, AlertTriangle, Link as LinkIcon, Users, MousePointer2, Clock, Globe, Search, X } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { apiClient } from "../../../helper/apiClient";

const InsightModal = ({ issue, onClose }) => {
  if (!issue) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${issue.severity === 'Critical' ? 'bg-red-100 text-red-700' : issue.severity === 'Warning' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{issue.metric} Issue</h3>
              <p className="text-xs text-gray-500 font-mono">{issue.page}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Observed Data */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Observed Data</h4>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Value</p>
                <p className="text-lg font-bold text-gray-900">{issue.currentValue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Previous Period</p>
                <p className="text-lg font-bold text-gray-600">{issue.previousValue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Change</p>
                <p className="text-sm font-medium text-gray-900">{issue.change}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Data Source</p>
                <p className="text-sm font-medium text-gray-900">{issue.dataSource}</p>
              </div>
            </div>
          </div>

          {/* AI / System Analysis */}
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">System Analysis</h4>
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-blue-900 leading-relaxed">{issue.explanation}</p>
            </div>
          </div>

          {/* Recommended Action */}
          <div>
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3">Recommended Action</h4>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
              <p className="text-sm text-emerald-900 leading-relaxed">{issue.recommendedAction}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HealthDashboard() {
  const [period, setPeriod] = useState('30daysAgo');
  
  const [stats, setStats] = useState({ totalPages: 0, published: 0, draft: 0, scheduled: 0, redirects: 0 });
  const [analyticsData, setAnalyticsData] = useState({ chartData: [], summary: { uniqueVisitors: 0, totalPageviews: 0, bounceRate: "0%", avgSession: "0m 0s" } });
  const [gscData, setGscData] = useState({ chartData: [], summary: { clicks: 0, impressions: 0, ctr: "0%", avgPosition: "0", score: 0, scoreFactors: {} } });
  const [insights, setInsights] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [pagesRes, redirectsRes, analyticsRes, gscRes, insightsRes] = await Promise.all([
        apiClient.get("/api/v1/seo/pages"),
        apiClient.get("/api/v1/seo/redirects"),
        apiClient.get(`/api/v1/seo/analytics?startDate=${period}&endDate=today`),
        apiClient.get(`/api/v1/seo/gsc?startDate=${period}&endDate=today`),
        apiClient.get("/api/v1/seo/insights")
      ]);
      
      const pages = pagesRes.data.data || [];
      const redirects = redirectsRes.data.data || [];
      
      let published = 0, draft = 0, scheduled = 0;
      pages.forEach(p => {
        if (p.status === 'Published') published++;
        if (p.status === 'Draft') draft++;
        if (p.status === 'Scheduled') scheduled++;
      });

      setStats({ totalPages: pages.length, published, draft, scheduled, redirects: redirects.length });
      if (analyticsRes.data) setAnalyticsData(analyticsRes.data);
      if (gscRes.data) setGscData(gscRes.data);
      if (insightsRes.data) setInsights(insightsRes.data);
      
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <InsightModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Google Analytics 4 Connected</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Search Console Connected</span>
          </div>
        </div>
        <select 
          className="input text-sm font-medium bg-gray-50 border-gray-200"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option value="7daysAgo">Last 7 Days</option>
          <option value="28daysAgo">Last 28 Days</option>
          <option value="30daysAgo">Last 30 Days</option>
          <option value="90daysAgo">Last 90 Days</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">
          Loading Live Data...
        </div>
      ) : (
        <>
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
            
            {/* Dynamic Search Performance Score */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 group relative cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">Search Perf. Score</h3>
                <div className={`p-2 rounded-lg ${gscData.summary.score >= 80 ? 'bg-emerald-100 text-emerald-700' : gscData.summary.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                  <Activity size={18} />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-gray-900">{gscData.summary.score}</span>
                <span className="text-sm text-gray-500 mb-1">/ 100</span>
              </div>
              <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-4 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
                <p className="font-bold mb-2">Score Breakdown (GSC):</p>
                <div className="flex justify-between mb-1"><span>CTR ({gscData.summary.ctr}):</span> <span>{gscData.summary.scoreFactors.ctrPoints}/50</span></div>
                <div className="flex justify-between"><span>Avg Pos ({gscData.summary.avgPosition}):</span> <span>{gscData.summary.scoreFactors.positionPoints}/50</span></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">Organic Clicks</h3>
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Search size={18} /></div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{gscData.summary.clicks.toLocaleString()}</div>
              <p className="text-xs text-gray-500 font-medium">{gscData.summary.impressions.toLocaleString()} Impressions</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">Total Pages</h3>
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><FileText size={18} /></div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPages}</div>
              <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {stats.published} Pub</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400"></div> {stats.draft} Dft</span>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">Active Redirects</h3>
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><LinkIcon size={18} /></div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.redirects}</div>
              <p className="text-xs text-gray-500 font-medium">Tracking 301, 302, 410</p>
            </div>
          </div>

          {/* Dynamic Action Required Engine */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-500" />
                Dynamic Action Required
              </h2>
              <span className="text-xs font-medium text-gray-500">{insights.length} issues detected</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
              {insights.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">No significant issues detected in this period.</div>
              ) : (
                insights.map((issue, i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-md ${issue.severity === 'Critical' ? 'bg-red-100 text-red-700' : issue.severity === 'Warning' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        <AlertTriangle size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{issue.metric} <span className="text-gray-400 font-normal ml-1">on {issue.page}</span></p>
                        <p className="text-xs text-gray-500 mt-0.5">{issue.explanation}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedIssue(issue)} className="shrink-0 px-3 py-1.5 text-xs font-medium text-[#132242] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Traffic Overview (GA4) */}
          <div>
            <div className="flex items-center justify-between mb-4 mt-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Traffic & Engagement</h2>
                <p className="text-sm text-gray-500">Google Analytics 4</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Active Users", value: analyticsData.summary.uniqueVisitors.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
                { label: "Total Pageviews", value: analyticsData.summary.totalPageviews.toLocaleString(), icon: Globe, color: "text-emerald-600", bg: "bg-emerald-100" },
                { label: "Bounce Rate", value: analyticsData.summary.bounceRate, icon: MousePointer2, color: "text-amber-600", bg: "bg-amber-100" },
                { label: "Avg Session", value: analyticsData.summary.avgSession, icon: Clock, color: "text-purple-600", bg: "bg-purple-100" },
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon size={18} className={stat.color} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-[350px]">
              <h3 className="text-sm font-bold text-gray-700 mb-6">Traffic Trend</h3>
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
                  No data available for this period.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
