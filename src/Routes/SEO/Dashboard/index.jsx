import React, { useState, useEffect } from "react";
import { Activity, FileText, AlertTriangle, Link as LinkIcon, Users, Globe, Search, Clock, X, CheckCircle, RotateCcw } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { apiClient } from "../../../helper/apiClient";

const InsightModal = ({ issue, onClose }) => {
  if (!issue) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${issue.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{issue.title}</h3>
              <p className="text-xs text-gray-500 font-mono">{issue.affected_url}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Observed Data</h4>
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Detected Value</p>
                <p className="text-sm font-bold text-gray-900 break-words">{issue.detected_value || "Missing"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Data Source</p>
                <p className="text-sm font-medium text-gray-900">{issue.source}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Evidence</p>
                <p className="text-sm font-medium text-gray-900">{issue.evidence}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Why It Matters</h4>
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-blue-900 leading-relaxed">{issue.why_it_matters}</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3">Fix Recommendation</h4>
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
              <p className="text-sm text-emerald-900 leading-relaxed">{issue.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HealthDashboard() {
  const [period, setPeriod] = useState('30daysAgo');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [issues, setIssues] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [gscData, setGscData] = useState(null);
  const [pages, setPages] = useState([]);
  const [redirects, setRedirects] = useState([]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, issuesRes, analyticsRes, gscRes, pagesRes, redirectsRes] = await Promise.all([
        apiClient.get("/api/v1/seo/overview").catch(() => ({ data: { data: null } })),
        apiClient.get("/api/v1/seo/issues").catch(() => ({ data: { data: [] } })),
        apiClient.get(`/api/v1/seo/analytics?startDate=${period}&endDate=today`).catch(() => ({ data: null })),
        apiClient.get(`/api/v1/seo/gsc?startDate=${period}&endDate=today`).catch(() => ({ data: null })),
        apiClient.get("/api/v1/seo/pages").catch(() => ({ data: { data: [] } })),
        apiClient.get("/api/v1/seo/redirects").catch(() => ({ data: { data: [] } }))
      ]);

      if (overviewRes.data?.data) setOverview(overviewRes.data.data);
      if (issuesRes.data?.data) setIssues(issuesRes.data.data);
      if (analyticsRes.data) setAnalyticsData(analyticsRes.data);
      if (gscRes.data) setGscData(gscRes.data);
      if (pagesRes.data?.data) setPages(pagesRes.data.data);
      if (redirectsRes.data?.data) setRedirects(redirectsRes.data.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerCrawl = async () => {
    setIsCrawling(true);
    try {
      await apiClient.post("/api/v1/seo/crawl");
      setTimeout(() => fetchDashboardData(), 15000);
    } catch (err) {
      console.error("Crawl error", err);
    } finally {
      setTimeout(() => setIsCrawling(false), 3000);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200">Loading Live Data...</div>;
  }

  const searchScore = overview?.categories?.searchPerformance !== null ? overview.categories.searchPerformance : '--';
  const clicks = gscData?.summary?.clicks || 0;
  const impressions = gscData?.summary?.impressions || 0;
  const pubPages = pages.filter(p => p.status === 'Published').length;
  const dftPages = pages.filter(p => p.status === 'Draft').length;

  return (
    <div className="space-y-6 relative">
      <InsightModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
        <div className="flex items-center gap-4 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 border-r border-gray-200 pr-3">
            <span className={`w-2 h-2 rounded-full ${overview?.freshness?.ga4 === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            Google Analytics 4
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-600 border-r border-gray-200 pr-3">
            <span className={`w-2 h-2 rounded-full ${overview?.freshness?.gsc === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            Search Console
          </div>
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm font-medium text-gray-700 bg-transparent outline-none cursor-pointer"
          >
            <option value="7daysAgo">Last 7 Days</option>
            <option value="30daysAgo">Last 30 Days</option>
            <option value="90daysAgo">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Perf. Score */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-600">Search Perf. Score</h3>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <Activity size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900">{searchScore}</span>
              <span className="text-xs font-medium text-gray-400">/ 100</span>
            </div>
            {gscData?.summary?.scoreFactors && (
              <p className="text-[10px] font-medium text-emerald-500 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> CTR ({gscData.summary.scoreFactors.ctrPoints}) + Pos ({gscData.summary.scoreFactors.positionPoints})
              </p>
            )}
          </div>
        </div>

        {/* Organic Clicks */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-600">Organic Clicks</h3>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Search size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900">{clicks.toLocaleString()}</span>
            </div>
            <p className="text-xs font-medium text-gray-400 mt-2">{impressions.toLocaleString()} Impressions</p>
          </div>
        </div>

        {/* Total Pages */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-600">Total Pages</h3>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <FileText size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900">{pages.length}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {pubPages} Pub</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300"></span> {dftPages} Dft</span>
            </div>
          </div>
        </div>

        {/* Active Redirects */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-bold text-gray-600">Active Redirects</h3>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <LinkIcon size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gray-900">{redirects.length}</span>
            </div>
            <p className="text-xs font-medium text-gray-400 mt-2">Tracking 301, 302, 410</p>
          </div>
        </div>
      </div>

      {/* Traffic & Engagement */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Traffic & Engagement</h3>
          <p className="text-sm text-gray-500">Google Analytics 4</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <Users size={18} />
            </div>
            <div className="text-xl font-black text-gray-900">{analyticsData?.summary?.uniqueVisitors || 0}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Active Users</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
              <Globe size={18} />
            </div>
            <div className="text-xl font-black text-gray-900">{analyticsData?.summary?.totalPageviews || 0}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Total Pageviews</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
              <Activity size={18} />
            </div>
            <div className="text-xl font-black text-gray-900">{analyticsData?.summary?.bounceRate || "0%"}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Bounce Rate</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-3">
              <Clock size={18} />
            </div>
            <div className="text-xl font-black text-gray-900">{analyticsData?.summary?.avgSession || "0s"}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Avg Session</div>
          </div>
        </div>
      </div>

      {/* Traffic Trend Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-6">Traffic Trend</h3>
        <div className="h-[250px] w-full">
          {analyticsData?.chartData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-medium text-gray-400 bg-gray-50 rounded-xl">
              No traffic data available.
            </div>
          )}
        </div>
      </div>

      {/* Issues */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500" />
            Action Required
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-500">{issues.length} issues detected</span>
            <button
              onClick={triggerCrawl}
              disabled={isCrawling}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all ${isCrawling ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <RotateCcw size={12} className={isCrawling ? 'animate-spin' : ''} />
              {isCrawling ? 'Crawling...' : 'Rescan'}
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {issues.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="text-emerald-500" size={24} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">Looking Good!</h3>
              <p className="text-xs text-gray-500 max-w-[250px]">No significant SEO issues detected. Run a Live Audit to refresh data.</p>
            </div>
          ) : (
            issues.map((issue, i) => (
              <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 w-full">
                  <div className={`mt-0.5 shrink-0 p-1.5 rounded-md ${issue.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    <AlertTriangle size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-gray-900 truncate">{issue.title}</p>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wide">{issue.category}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate font-mono">{issue.affected_url}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedIssue(issue)} className="shrink-0 px-3 py-1.5 text-xs font-medium text-[#132242] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  View Fix
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
