import React, { useState, useEffect } from "react";
import { Activity, FileText, AlertTriangle, Link as LinkIcon } from "lucide-react";
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
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
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

    </div>
  );
}
