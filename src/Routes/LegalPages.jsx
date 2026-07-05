import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit2, GripVertical, AlertTriangle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../helper/apiClient";
import { toast } from "react-toastify";

const LegalPages = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [canPublish, setCanPublish] = useState(false);
  
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const abortRef = useRef(null);

  const fetchPermission = async () => {
    try {
      const res = await apiClient.get("/profile/me");
      const admin = res.data?.data?.admin;
      if (!admin) {
        setCanPublish(false);
        return;
      }
      if (admin.email === "auxosys@gmail.com") {
        setCanPublish(true);
      } else {
        const perms = admin.permissions || [];
        const hasWrite = perms.some(p => {
          if (typeof p === 'string') return p === "legalPages";
          return p.module === "legalPages" && p.access === "Read & Write";
        });
        setCanPublish(hasWrite);
      }
    } catch {
      setCanPublish(false);
    }
  };

  const fetchPages = async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(false);
      const res = await apiClient.get("/legal/admin/all", { signal: controller.signal });
      setPages(res.data.data || []);
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      setError(true);
      toast.error("Failed to load legal pages");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermission();
    fetchPages();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleDelete = async (id) => {
    if (!canPublish) {
      toast.error("You don't have permission to delete pages");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this legal page? This action cannot be undone.")) {
      return;
    }

    try {
      await apiClient.delete(`/legal/${id}`);
      toast.success("Page deleted successfully");
      fetchPages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete page");
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    if (!canPublish) {
      e.preventDefault();
      return;
    }
    setDraggedItemIndex(index);
    // Allow dragging
    e.dataTransfer.effectAllowed = "move";
    // Slight delay to allow drag image to render before applying dragging class
    setTimeout(() => {
      e.target.style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newPages = [...pages];
    const draggedItem = newPages[draggedItemIndex];
    newPages.splice(draggedItemIndex, 1);
    newPages.splice(index, 0, draggedItem);

    setDraggedItemIndex(index);
    setPages(newPages);
  };

  const handleDragEnd = async (e) => {
    e.target.style.opacity = "1";
    setDraggedItemIndex(null);

    // Save the new order to the backend
    try {
      const payload = pages.map((p, idx) => ({ id: p._id, order: idx }));
      await apiClient.put("/legal/reorder", { pages: payload });
      toast.success("Page order saved!");
    } catch (err) {
      toast.error("Failed to save page order");
      fetchPages(); // Revert to original order on failure
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 bg-gray-50 min-h-screen overflow-hidden relative">
      <div className="pt-2 mb-4 shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#0c55cc] hover:text-blue-800 transition font-semibold w-fit">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Legal Pages</h1>
            <p className="text-sm text-gray-500 mt-1">Manage terms, privacy, and other legal documents</p>
          </div>
          
          <button
            onClick={() => {
              if (!canPublish) return toast.error("You don't have permission to create pages");
              navigate("/legal/new");
            }}
            className="flex items-center gap-2 bg-[#0c55cc] hover:bg-[#0a45a6] text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add New Page
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading pages...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3" />
              Failed to load pages. Please refresh.
            </div>
          ) : pages.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No legal pages found</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first legal page to display in the website footer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                    <th className="px-6 py-4 font-medium">Order</th>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">URL Slug</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page, index) => (
                    <tr 
                      key={page._id} 
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors group cursor-grab active:cursor-grabbing"
                      draggable={canPublish}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-[#0c55cc] transition-colors">
                          <GripVertical className="w-5 h-5" />
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{page.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          page.status === 'Published' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : page.status === 'Archived'
                            ? 'bg-gray-50 text-gray-700 border-gray-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {page.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded w-fit">/{page.slug}</p>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/legal/edit/${page._id}`); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(page._id); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalPages;
