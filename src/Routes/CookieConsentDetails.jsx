import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../helper/apiClient';
import { ArrowLeft, Clock, Monitor, Globe, ShieldCheck } from 'lucide-react';

const CookieConsentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await apiClient.get(`/cookies/admin/consent/${id}`);
        if (res.data.success) {
          setDetails(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const decodeCategories = (bitmask) => {
    const categories = [];
    if (bitmask & 1) categories.push('Necessary');
    if (bitmask & 2) categories.push('Analytics');
    if (bitmask & 4) categories.push('Functional');
    if (bitmask & 8) categories.push('Marketing');
    return categories.length > 0 ? categories.join(', ') : 'None';
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (!details) return <div className="p-8 text-center text-red-500">Consent record not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium text-sm transition-colors"
      >
        <ArrowLeft size={16} /> Back to Logs
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Consent Record <span className="text-gray-400 font-mono text-lg font-normal">#{details.consent_id}</span>
          </h1>
          <p className="text-gray-500 mt-1">Detailed history and technical footprint for compliance auditing.</p>
        </div>
        <div className="flex gap-2">
          {details.status === 1 && <span className="px-3 py-1 bg-green-100 text-green-700 font-medium text-sm rounded-full flex items-center gap-1"><ShieldCheck size={16}/> Active Consent</span>}
          {details.status === 2 && <span className="px-3 py-1 bg-orange-100 text-orange-700 font-medium text-sm rounded-full">Expired</span>}
          {details.status === 3 && <span className="px-3 py-1 bg-red-100 text-red-700 font-medium text-sm rounded-full">Withdrawn</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Identity & Origin */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Identity & Origin</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Visitor ID</span>
              <span className="font-mono font-medium text-gray-900">{details.visitor_id}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Session ID</span>
              <span className="font-mono font-medium text-gray-900">{details.session_id}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Country</span>
              <span className="font-medium text-gray-900 flex items-center gap-2">
                <Globe size={14} className="text-gray-400"/> {details.country_code || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">IP Hash (Anonymized)</span>
              <span className="font-mono text-xs text-gray-600 truncate block" title={details.ip_hash}>{details.ip_hash?.substring(0, 20)}...</span>
            </div>
          </div>
        </div>

        {/* Device & Acquisition */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Device & Acquisition</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Device Type</span>
              <span className="font-medium text-gray-900 flex items-center gap-2 capitalize">
                <Monitor size={14} className="text-gray-400"/> {details.device_type || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Referrer</span>
              <span className="font-medium text-gray-900">{details.referrer || 'Direct'}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Entry Page</span>
              <span className="font-medium text-gray-900">{details.page_slug || '/'}</span>
            </div>
            {details.utm_campaign && (
              <div>
                <span className="text-gray-500 block text-xs">UTM Campaign</span>
                <span className="font-medium text-gray-900">{details.utm_campaign} ({details.utm_source})</span>
              </div>
            )}
          </div>
        </div>

        {/* Consent State */}
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Current State</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500 block text-xs mb-1">Categories Accepted</span>
              <div className="flex flex-wrap gap-2">
                {decodeCategories(details.categories).split(', ').map(cat => (
                  <span key={cat} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded border">{cat}</span>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <span className="text-gray-500 block text-xs">Consent Version</span>
              <span className="font-medium text-gray-900">{details.consent_version || 'v1.0'}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Created At</span>
              <span className="font-medium text-gray-900">{new Date(details.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Expires At</span>
              <span className="font-medium text-gray-900">{details.expires_at ? new Date(details.expires_at).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Timeline */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock size={20} className="text-[#0fb5a6]" /> Consent Timeline & Audit Trail
      </h2>
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
          {details.audit_logs && details.audit_logs.map((log, index) => (
            <div key={log.id} className="relative pl-6">
              <div className="absolute w-3 h-3 bg-[#0fb5a6] rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {log.action} Preferences
                  </h4>
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border inline-block">
                    {log.changed_fields && Object.entries(log.changed_fields).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 mb-1 last:mb-0">
                        <span className="font-medium capitalize text-gray-700">{key}:</span>
                        {key === 'categories' ? (
                          <span className="text-[#0fb5a6] font-medium">{decodeCategories(value)}</span>
                        ) : (
                          <span className="text-gray-900">{value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {new Date(log.changed_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {(!details.audit_logs || details.audit_logs.length === 0) && (
            <div className="text-gray-500 pl-4 text-sm">No audit logs available for this record.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsentDetails;
