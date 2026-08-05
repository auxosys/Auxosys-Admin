import React, { useState, useEffect } from 'react';
import { apiClient } from '../helper/apiClient';
import { Users, FileText, CheckCircle, XCircle, Sliders, Calendar, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CookieConsentLogs = () => {
  const [stats, setStats] = useState({ total: 0, acceptedAll: 0, rejectedAll: 0, customized: 0 });
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/cookies/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchLogs = async (pageNum) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/cookies/admin/logs?page=${pageNum}&limit=20`);
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchLogs(page);
  }, [page]);

  const exportData = async () => {
    try {
      const res = await apiClient.get('/cookies/admin/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cookie_consents.csv');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Error exporting logs:', err);
    }
  };

  const decodeCategories = (bitmask) => {
    const categories = [];
    if (bitmask & 1) categories.push('Necessary');
    if (bitmask & 2) categories.push('Analytics');
    if (bitmask & 4) categories.push('Functional');
    if (bitmask & 8) categories.push('Marketing');
    return categories.join(', ');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cookie Consent Logs</h1>
          <p className="text-gray-500">Audit trail of visitor cookie consent choices, kept for DPDP Act & GDPR compliance.</p>
        </div>
        <button 
          onClick={() => navigate('/cookie-management')}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-sm font-medium flex items-center gap-2"
        >
          <Settings size={18} /> Cookie Settings
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium whitespace-nowrap">Total Consents</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium whitespace-nowrap">Accepted All</div>
            <div className="text-2xl font-bold text-gray-900">{stats.acceptedAll}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg"><XCircle size={24} /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium whitespace-nowrap">Rejected Optional</div>
            <div className="text-2xl font-bold text-gray-900">{stats.rejectedAll}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><Sliders size={24} /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium whitespace-nowrap">Customised</div>
            <div className="text-2xl font-bold text-gray-900">{stats.customized}</div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-semibold text-gray-800">Recent Consent Activity</h2>
          <div className="flex gap-3">
            <input type="text" placeholder="Search by Consent ID..." className="input py-1.5 px-3 text-sm h-9 w-64 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0fb5a6] focus:border-[#0fb5a6]" />
            <button 
              onClick={exportData}
              className="px-3 py-1.5 bg-[#0fb5a6] text-white rounded-lg hover:bg-teal-600 transition-colors shadow-sm text-sm font-medium flex items-center gap-2 h-9 whitespace-nowrap"
            >
              <FileText size={16} /> Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm">
              <tr>
                <th className="py-3 px-4 font-medium border-b">Consent ID</th>
                <th className="py-3 px-4 font-medium border-b">Country</th>
                <th className="py-3 px-4 font-medium border-b">Categories Accepted</th>
                <th className="py-3 px-4 font-medium border-b">Status</th>
                <th className="py-3 px-4 font-medium border-b">Date</th>
                <th className="py-3 px-4 font-medium border-b">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-500">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-500">No consent records found.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs">{log.consent_id}</td>
                    <td className="py-3 px-4">{log.country_code || 'Unknown'}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {decodeCategories(log.categories)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {log.status === 1 && <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-medium">Active</span>}
                      {log.status === 2 && <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-xs font-medium">Expired</span>}
                      {log.status === 3 && <span className="text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-medium">Withdrawn</span>}
                    </td>
                    <td className="py-3 px-4 text-gray-500 flex items-center gap-1">
                      <Calendar size={14}/> {new Date(log.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => navigate(`/consent-details/${log.consent_id}`)}
                        className="text-[#0fb5a6] hover:underline font-medium text-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t flex justify-between items-center bg-gray-50">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-white border rounded text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-white border rounded text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentLogs;
