import React, { useState, useEffect } from "react";
import { LinkIcon, Plus, Trash2, Edit2, AlertCircle } from "lucide-react";
import { apiClient } from "../../../helper/apiClient";
import { toast } from "react-toastify";

export default function RedirectsManager({ canWrite }) {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    id: null,
    old_path: "",
    new_path: "",
    redirect_type: 301
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    try {
      const res = await apiClient.get("/api/v1/seo/redirects"); 
      setRedirects(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch redirects");
    } finally {
      setLoading(false);
    }
  };

  const saveRedirect = async () => {
    if (!form.old_path || !form.new_path) return toast.error("Paths are required");
    setIsSubmitting(true);
    try {
      if (form.id) {
        await apiClient.patch(`/api/v1/seo/redirects/${form.id}`, {
          old_path: form.old_path,
          new_path: form.new_path,
          redirect_type: form.redirect_type
        });
        toast.success("Redirect updated");
      } else {
        await apiClient.post("/api/v1/seo/redirects", {
          old_path: form.old_path,
          new_path: form.new_path,
          redirect_type: form.redirect_type
        });
        toast.success("Redirect added");
      }
      setForm({ id: null, old_path: "", new_path: "", redirect_type: 301 });
      fetchRedirects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save redirect");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeRedirect = async (id) => {
    try {
      await apiClient.delete(`/api/v1/seo/redirects/${id}`);
      setRedirects(redirects.filter((r) => r.id !== id));
      toast.success("Redirect removed");
    } catch (err) {
      toast.error("Failed to remove redirect");
    }
  };

  const handleEdit = (r) => {
    setForm({
      id: r.id,
      old_path: r.old_path,
      new_path: r.new_path,
      redirect_type: r.redirect_type
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Redirect Manager</h2>
          <p className="text-sm text-gray-500 mt-1">Manage 301, 302, and 410 URL redirects.</p>
        </div>
      </div>

      <div className="p-6">
        {canWrite && (
          <div className="flex flex-wrap items-end gap-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1.5">Old Path</label>
              <input
                type="text"
                className="input"
                placeholder="/old-url"
                value={form.old_path}
                onChange={(e) => setForm({ ...form, old_path: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1.5">New Path</label>
              <input
                type="text"
                className="input"
                placeholder="/new-url"
                value={form.new_path}
                onChange={(e) => setForm({ ...form, new_path: e.target.value })}
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1.5">Type</label>
              <select
                className="input"
                value={form.redirect_type}
                onChange={(e) => setForm({ ...form, redirect_type: parseInt(e.target.value) })}
              >
                <option value={301}>301 Permanent</option>
                <option value={302}>302 Temporary</option>
                <option value={410}>410 Gone</option>
              </select>
            </div>
            <button
              onClick={saveRedirect}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2 bg-[#132242] hover:bg-[#0d1830] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 h-[42px]"
            >
              {form.id ? <Edit2 size={14} /> : <Plus size={14} />} 
              {form.id ? "Update redirect" : "Add redirect"}
            </button>
            {form.id && (
              <button
                onClick={() => setForm({ id: null, old_path: "", new_path: "", redirect_type: 301 })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium h-[42px]"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-semibold">Old path</th>
                <th className="px-4 py-3 font-semibold">New path</th>
                <th className="px-4 py-3 font-semibold text-center">Type</th>
                <th className="px-4 py-3 font-semibold text-right">Hits</th>
                <th className="px-4 py-3 font-semibold text-right">Last Used</th>
                {canWrite && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-6 text-gray-400">Loading...</td></tr>
              ) : redirects.length === 0 ? (
                <tr>
                  <td colSpan={canWrite ? 6 : 5} className="text-center py-10 text-gray-400 text-sm">
                    No redirects configured yet
                  </td>
                </tr>
              ) : (
                redirects.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.old_path}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.new_path}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                        r.redirect_type === 301 ? "bg-purple-100 text-purple-700" : 
                        r.redirect_type === 410 ? "bg-red-100 text-red-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        {r.redirect_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500 font-mono">{r.hit_count || 0}</td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500">
                      {r.last_used ? new Date(r.last_used).toLocaleDateString() : 'Never'}
                    </td>
                    {canWrite && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEdit(r)}
                            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 text-xs font-medium"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => removeRedirect(r.id)}
                            className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            <Trash2 size={12} /> Remove
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
