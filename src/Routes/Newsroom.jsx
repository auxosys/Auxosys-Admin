import React, { useEffect, useState, useRef } from "react";
import { Plus, Calendar, Trash2, Edit2, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../helper/apiClient";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";

const Newsroom = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsError, setNewsError] = useState(false);
  const { hasPermission, isLoading: authLoading } = useAuth();
  const canPublish = hasPermission("newsroom", "Read & Write");

  // Prevents stale async callbacks from updating state / showing toasts
  // after the component unmounts (e.g. user navigates away mid-request).
  const abortRef = useRef(null);

  const fetchNews = async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setNewsError(false);
      const res = await apiClient.get("/news/admin/all", { signal: controller.signal });
      let list = res.data.data || [];
      list = list.map(item => ({ ...item, _id: item.id || item._id }));
      setNews(list);
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      setNewsError(true);
      toast.error("Failed to load newsroom posts");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await apiClient.delete(`/news/${id}`);
      toast.success("Post deleted");
      fetchNews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Permission denied");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center text-gray-400 py-20">Loading posts…</div>
      );
    }

    if (newsError) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-gray-500 text-sm">Failed to load newsroom posts.</p>
          <button
            onClick={fetchNews}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-white text-sm hover:bg-gray-50"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      );
    }

    if (news.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <p className="text-gray-500 text-sm">No posts yet.</p>
          {canPublish && (
            <button
              onClick={() => navigate("/newsroom/new")}
              className="flex items-center gap-2 bg-[#0c55cc] hover:bg-[#0c55cc] text-white px-4 py-2 rounded-lg font-medium shadow-sm text-sm"
            >
              <Plus size={14} strokeWidth={3} />
              Create your first post
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {news.map((item) => (
          <div
            key={item._id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="p-4 flex flex-col flex-1">
              <span className="inline-block w-fit px-2 py-0.5 rounded border border-blue-200 text-[#0c55cc] text-[10px] font-semibold uppercase mb-2">
                {item.category}
              </span>

              <h3 className="font-bold text-gray-800 text-sm leading-tight mb-2 line-clamp-2">
                {item.title}
              </h3>

              <div className="w-full h-28 rounded-lg overflow-hidden mb-2 bg-gray-100 shrink-0">
                <img
                  src={item.featured_image_url || item.featuredImageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed mb-3 flex-1 line-clamp-3">
                {item.summary}
              </p>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-auto">
                <span className="bg-[#0c55cc] text-white text-[10px] font-bold px-2 py-1 rounded">
                  {item.status}
                </span>
                <div className="flex items-center text-gray-400 text-[11px] font-medium">
                  <Calendar size={12} className="mr-1.5" />
                  {new Date(
                    item.publishedAt || item.createdAt
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              {canPublish && (
                <div className="flex justify-end gap-3 mt-4 text-gray-400">
                  <Edit2
                    size={16}
                    className="cursor-pointer hover:text-gray-600"
                    onClick={() => navigate(`/newsroom/edit/${item._id}`)}
                  />
                  <Trash2
                    size={16}
                    className="cursor-pointer hover:text-red-500"
                    onClick={() => deletePost(item._id)}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8 px-6">
      <div className="pt-6 mb-4 shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#0c55cc] hover:text-blue-800 transition font-semibold w-fit">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="flex justify-between items-start mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Newsroom</h1>
          <p className="text-gray-500 mt-1">
            Manage articles, case studies, and press releases.
          </p>
        </div>
        {canPublish && (
          <button
            onClick={() => navigate("/newsroom/new")}
            className="flex items-center gap-2 bg-[#0c55cc] hover:bg-[#0c55cc] text-white px-4 py-2 rounded-lg font-medium shadow-sm text-sm"
          >
            <Plus size={16} strokeWidth={3} />
            Post News
          </button>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

export default Newsroom;
