import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../helper/apiClient";
import { Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usePermissions } from "../hooks/usePermissions";

const STATUS_OPTIONS = [
  "Active",
  "Invalid",
  "Unsubscribed",
  "Paused",
];

export default function Subscriptions() {
  const navigate = useNavigate();
  const { canWrite } = usePermissions("subscriptions");
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchSubs = useCallback(async () => {
    try {
      setLoading(true);
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await apiClient.get("/subscriptions", { params });
      setSubs(res.data.data || []);
    } catch {
      setSubs([]);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  const updateStatus = async (id, status) => {
    try {
      await apiClient.patch(`/subscriptions/${id}/status`, { status });
      fetchSubs();
    } catch {
      toast.error("Failed to update subscription status");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete subscription?")) return;
    try {
      await apiClient.delete(`/subscriptions/${id}`);
      fetchSubs();
    } catch {
      toast.error("Failed to delete subscription");
    }
  };

  const downloadCSV = async () => {
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    let allSubs = [];

    try {
      const params = { limit: 10000, ...(statusFilter ? { status: statusFilter } : {}) };
      const res = await apiClient.get("/subscriptions", { params });
      allSubs = res?.data?.data || [];
    } catch {
      toast.error("Failed to download subscriptions CSV");
      return;
    }

    if (!allSubs.length) {
      toast.warning("No subscriptions available to export");
      return;
    }

    const headers = [
      "S.No",
      "Email",
      "Status",
      "Subscription Date",
      "Notifications Status",
    ];

    const csvContent = [
      headers.join(","),
      ...allSubs.map((sub, index) => {
        const email = sub.email || "-";
        const status = sub.status || "Active";
        const subscriptionDate = formatDate(sub.createdAt);
        const notificationsStatus = sub.notifications ? "Enabled" : "Disabled";

        return [
          index + 1,
          `"${email}"`,
          `"${status}"`,
          subscriptionDate,
          `"${notificationsStatus}"`,
        ].join(",");
      }),
    ].join("\n");

    const BOM = "﻿";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `subscriptions-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8 px-6">
      <div className="pt-6 mb-4 shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#0c55cc] hover:text-blue-800 transition font-semibold w-fit">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Newsletter Subscriptions</h1>
        <button
          onClick={downloadCSV}
          disabled={subs.length === 0}
          className="flex items-center gap-2 bg-[#111827] text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <Download size={18} />
          Download CSV
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs">Email</th>
              <th className="px-6 py-3 text-left text-xs">Status</th>
              <th className="px-6 py-3 text-left text-xs">Date</th>
              <th className="px-6 py-3 text-right text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="py-10 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : subs.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-10 text-center text-gray-400">
                  No subscriptions found.
                </td>
              </tr>
            ) : (
              subs.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="px-6 py-4">{s.email}</td>
                  <td className="px-6 py-4">
                    {canWrite ? (
                      <select
                        value={s.status}
                        onChange={(e) => updateStatus(s._id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm">{s.status}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canWrite && (
                      <button
                        onClick={() => remove(s._id)}
                        className="text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
