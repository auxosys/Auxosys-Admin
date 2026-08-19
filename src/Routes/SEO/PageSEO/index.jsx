import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Globe } from "lucide-react";
import { apiClient } from "../../../helper/apiClient";
import { toast } from "react-toastify";
import PageSEOForm from "./PageSEOForm";

export default function PageSEO({ canWrite }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list' | 'form'
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (view === "list") fetchPages();
  }, [view]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/v1/seo/pages");
      setPages(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch SEO pages");
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this page's SEO? It will fall back to Global SEO.")) return;
    try {
      await apiClient.delete(`/api/v1/seo/pages/${id}`);
      setPages(pages.filter((p) => p.id !== id));
      toast.success("Page SEO deleted");
    } catch (err) {
      toast.error("Failed to delete page SEO");
    }
  };

  if (view === "form") {
    return <PageSEOForm pageId={editingId} onBack={() => setView("list")} canWrite={canWrite} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Page SEO Overrides</h2>
          <p className="text-sm text-gray-500 mt-1">Configure individual SEO settings for specific routes.</p>
        </div>
        {canWrite && (
          <button
            onClick={() => {
              setEditingId(null);
              setView("form");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#132242] hover:bg-[#0d1830] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add Page SEO
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-semibold">Route Slug</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Score</th>
                {canWrite && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-6 text-gray-400">Loading...</td></tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-400 text-sm">
                    No page overrides configured yet
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-blue-600 mb-0.5">{p.page_slug}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Globe size={10} /> {p.canonical || "No canonical"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        p.status === 'Published' ? 'bg-green-100 text-green-700' :
                        p.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                        p.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.status || 'Published'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${p.seo_score >= 80 ? 'bg-green-500' : p.seo_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${p.seo_score || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-6">{p.seo_score || 0}</span>
                      </div>
                    </td>
                    {canWrite && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => {
                              setEditingId(p.id);
                              setView("form");
                            }}
                            className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => deletePage(p.id)}
                            className="text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
