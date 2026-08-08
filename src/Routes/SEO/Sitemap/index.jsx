import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Search, RefreshCw, Eye, Activity } from "lucide-react";
import { apiClient } from "../../../helper/apiClient";
import { toast } from "react-toastify";

export default function SitemapManager({ canWrite }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [validating, setValidating] = useState(null);
  
  const [form, setForm] = useState({
    id: null,
    url: "",
    changefreq: "weekly",
    priority: 0.8,
    status: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await apiClient.get("/api/v1/seo/sitemap-links"); 
      setLinks(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch sitemap links");
    } finally {
      setLoading(false);
    }
  };

  const saveLink = async () => {
    if (!form.url) return toast.error("URL is required");
    setIsSubmitting(true);
    try {
      if (form.id) {
        await apiClient.post(`/api/v1/seo/sitemap-links`, form);
        toast.success("Sitemap link updated");
      } else {
        await apiClient.post("/api/v1/seo/sitemap-links", form);
        toast.success("Sitemap link added");
      }
      setForm({ id: null, url: "", changefreq: "weekly", priority: 0.8, status: true });
      fetchLinks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeLink = async (id) => {
    try {
      await apiClient.delete(`/api/v1/seo/sitemap-links/${id}`);
      setLinks(links.filter((l) => l.id !== id));
      toast.success("Link removed");
    } catch (err) {
      toast.error("Failed to remove link");
    }
  };

  const handleEdit = (l) => {
    setForm({
      id: l.id,
      url: l.url,
      changefreq: l.changefreq || "weekly",
      priority: l.priority || 0.8,
      status: l.status
    });
  };

  const toggleStatus = async (link, newStatus) => {
    try {
      await apiClient.post(`/api/v1/seo/sitemap-links`, { ...link, status: newStatus });
      setLinks(links.map(l => l.id === link.id ? { ...l, status: newStatus } : l));
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const validateUrl = async (url, id) => {
    setValidating(id);
    try {
      const res = await apiClient.post("/api/v1/seo/sitemap-links/validate", { url });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid URL");
    } finally {
      setValidating(null);
    }
  };

  const handleBulkAction = async (action) => {
    if (!selectedIds.length) return toast.warning("Select items first");
    try {
      await apiClient.post("/api/v1/seo/sitemap-links/bulk", { ids: selectedIds, action });
      toast.success(`Bulk ${action} successful`);
      setSelectedIds([]);
      fetchLinks();
    } catch (err) {
      toast.error(`Bulk ${action} failed`);
    }
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(filteredLinks.map(l => l.id));
    else setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredLinks = links.filter(l => l.url.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Custom Sitemap Manager</h2>
          <p className="text-sm text-gray-500 mt-1">Manage custom links to dynamically insert into the XML sitemap.</p>
        </div>
        <div className="flex gap-2">
           <a
              href="https://www.auxosys.com/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs bg-white border border-emerald-200 px-3 py-2 rounded-lg shadow-sm text-emerald-700 font-medium hover:bg-emerald-50 whitespace-nowrap"
            >
              <Eye size={14} /> Preview XML
            </a>
        </div>
      </div>

      <div className="p-6">
        {canWrite && (
          <div className="flex flex-wrap items-end gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex-1 min-w-[300px]">
              <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1.5">Custom URL Path</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. /landing-page-1"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1.5">Priority</label>
              <input
                type="number"
                step="0.1" min="0" max="1"
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseFloat(e.target.value) })}
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1.5">Freq</label>
              <select
                className="input"
                value={form.changefreq}
                onChange={(e) => setForm({ ...form, changefreq: e.target.value })}
              >
                <option value="always">Always</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="never">Never</option>
              </select>
            </div>
            <button
              onClick={saveLink}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 bg-[#132242] hover:bg-[#0d1830] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 h-[42px]"
            >
              {form.id ? <Edit2 size={14} /> : <Plus size={14} />} 
              {form.id ? "Update Link" : "Add Link"}
            </button>
            {form.id && (
              <button
                onClick={() => setForm({ id: null, url: "", changefreq: "weekly", priority: 0.8, status: true })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium h-[42px]"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
            <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search custom links..." 
                    className="input pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {selectedIds.length > 0 && canWrite && (
                <div className="flex gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <span className="text-xs font-semibold text-blue-800 self-center mr-2">{selectedIds.length} selected</span>
                    <button onClick={() => handleBulkAction('enable')} className="text-xs bg-white text-gray-700 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">Enable</button>
                    <button onClick={() => handleBulkAction('disable')} className="text-xs bg-white text-gray-700 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50">Disable</button>
                    <button onClick={() => handleBulkAction('delete')} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 hover:bg-red-100">Delete</button>
                </div>
            )}
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-semibold w-10">
                    <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length > 0 && selectedIds.length === filteredLinks.length} />
                </th>
                <th className="px-4 py-3 font-semibold">URL Path</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Freq</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500 flex justify-center items-center gap-2">
                    <RefreshCw className="animate-spin" size={16} /> Loading custom links...
                  </td>
                </tr>
              ) : filteredLinks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No custom links found. Note: Published Page SEO records are automatically included in the sitemap.
                  </td>
                </tr>
              ) : (
                filteredLinks.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-3">
                         <input type="checkbox" checked={selectedIds.includes(l.id)} onChange={() => toggleSelect(l.id)} />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 break-all pr-8 max-w-[400px]">
                      {l.url}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.priority}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{l.changefreq}</td>
                    <td className="px-4 py-3 text-center">
                        <button 
                           onClick={() => toggleStatus(l, !l.status)}
                           disabled={!canWrite}
                           className={`px-2 py-1 rounded-full text-xs font-medium border ${
                               l.status ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"
                           }`}
                        >
                            {l.status ? 'Enabled' : 'Disabled'}
                        </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="Validate URL"
                          onClick={() => validateUrl(l.url, l.id)}
                          disabled={validating === l.id}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                        >
                          {validating === l.id ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />}
                        </button>
                        {canWrite && (
                          <>
                            <button
                              onClick={() => handleEdit(l)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to remove this link?")) {
                                  removeLink(l.id);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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
