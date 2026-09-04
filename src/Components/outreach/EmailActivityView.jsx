import React, { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, CheckCircle2, Eye, MousePointer, AlertOctagon, CornerUpLeft, Clock, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { listEmailActivity } from '../../api/mailboxApi';

export default function EmailActivityView() {
  const [activity, setActivity] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchActivity = async (searchTerm = search) => {
    try {
      setLoading(true);
      const res = await listEmailActivity({ search: searchTerm });
      setActivity(res.activity || []);
      setTotal(res.total || 0);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch email activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchActivity(search);
  };

  const getStatusBadge = (status, openedAt, clickedAt, repliedAt) => {
    if (repliedAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <CornerUpLeft size={13} /> Replied
        </span>
      );
    }
    if (clickedAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <MousePointer size={13} /> Clicked
        </span>
      );
    }
    if (openedAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Eye size={13} /> Opened
        </span>
      );
    }
    if (status === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={13} /> Delivered
        </span>
      );
    }
    if (['bounced', 'failed'].includes(status)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <AlertOctagon size={13} /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
        <Clock size={13} /> {status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-blue-600" size={26} />
            Email Audit & Activity Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time delivery, open, click, bounce, and reply logs with Brevo Message IDs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search recipient or Brevo ID..."
              className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </form>

          <button
            onClick={() => fetchActivity()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white border text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm text-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3.5 px-5 font-semibold text-gray-700">Recipient Email</th>
              <th className="py-3.5 px-5 font-semibold text-gray-700">Sender Profile</th>
              <th className="py-3.5 px-5 font-semibold text-gray-700">Campaign</th>
              <th className="py-3.5 px-5 font-semibold text-gray-700">Delivery Status</th>
              <th className="py-3.5 px-5 font-semibold text-gray-700">Brevo Message ID</th>
              <th className="py-3.5 px-5 font-semibold text-gray-700">Dispatched At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  Loading activity log...
                </td>
              </tr>
            ) : activity.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <FileText size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="font-medium text-gray-700">No email activity logs recorded yet.</p>
                </td>
              </tr>
            ) : (
              activity.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/70 transition">
                  <td className="py-3.5 px-5 font-semibold text-gray-900">
                    {l.recipient_email}
                  </td>
                  <td className="py-3.5 px-5 text-gray-700">
                    {l.sender_emails?.email || 'Central Brevo'}
                  </td>
                  <td className="py-3.5 px-5 text-gray-600">
                    {l.campaigns?.name || 'Direct Outreach'}
                  </td>
                  <td className="py-3.5 px-5">
                    {getStatusBadge(l.status, l.opened_at, l.clicked_at, l.replied_at)}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-xs text-gray-500 truncate max-w-[180px]" title={l.brevo_message_id || 'Pending'}>
                    {l.brevo_message_id || 'N/A'}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-gray-500">
                    {l.created_at ? new Date(l.created_at).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 flex justify-between items-center">
          <span>Showing {activity.length} of {total} email logs</span>
        </div>
      </div>
    </div>
  );
}
