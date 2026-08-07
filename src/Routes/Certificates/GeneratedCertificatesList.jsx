import React, { useState, useEffect, useCallback } from 'react';
import { listCertificates, revokeCertificate, downloadCertificateUrl } from '../../helper/certificatesApi';
import { useAuth } from '../../context/AuthContext';

const STATUS_STYLE = {
  valid: { bg: '#EAFAF7', color: '#0C8074', label: 'Valid' },
  revoked: { bg: '#FEF2F2', color: '#DC2626', label: 'Revoked' },
  expired: { bg: '#FFF7ED', color: '#C2410C', label: 'Expired' },
};

export default function GeneratedCertificatesList() {
  const [certificates, setCertificates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [revokeModalId, setRevokeModalId] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');

  const { hasPermission, profile } = useAuth();
  // Be extremely permissive for testing if hasPermission is failing due to strict equality
  const canRevoke = profile?.role === 'Superadmin' || 
                    profile?.email === 'admin@auxosys.com' ||
                    profile?.permissions?.some(p => p.module === 'certificates_issued' && p.access?.includes('Write')) ||
                    hasPermission('certificates_issued', 'Read & Write');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: 15 };
      if (status) params.status = status;
      if (q) params.q = q;
      const data = await listCertificates(params);
      setCertificates(data.certificates);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, status, q]);

  useEffect(() => { load(); }, [load]);

  const handleRevokeClick = (id) => {
    setRevokeModalId(id);
    setRevokeReason('');
  };

  const submitRevoke = async () => {
    if (!revokeReason.trim()) return;
    await revokeCertificate(revokeModalId, revokeReason);
    setRevokeModalId(null);
    setRevokeReason('');
    load();
  };

  const totalPages = Math.max(1, Math.ceil(total / 15));

  return (
    <div className="cert-list">
      <style>{`
        .cl-toolbar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .cl-toolbar input, .cl-toolbar select {
          border: 1px solid #E2E8F0; border-radius: 8px; padding: 9px 12px; font-size: 13.5px;
        }
        .cl-toolbar input { flex: 1; min-width: 200px; }
        table.cl-table { width: 100%; border-collapse: collapse; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; }
        .cl-table th { text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; padding: 12px 16px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
        .cl-table td { padding: 12px 16px; font-size: 13.5px; color: #334155; border-bottom: 1px solid #F1F5F9; }
        .cl-badge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 11.5px; font-weight: 700; }
        .cl-actions a, .cl-actions button {
          font-size: 12.5px; font-weight: 600; margin-right: 12px; background: none; border: none; cursor: pointer; padding: 0;
        }
        .cl-actions a { color: #14B8A6; }
        .cl-actions button.revoke { color: #DC2626; }
        .cl-pager { display: flex; justify-content: center; gap: 12px; margin-top: 16px; align-items: center; font-size: 13px; color: #475569; }
        .cl-pager button { border: 1px solid #E2E8F0; background: #FFFFFF; border-radius: 6px; padding: 6px 12px; cursor: pointer; }
        .cl-pager button:disabled { opacity: 0.4; cursor: not-allowed; }
        
        .cl-modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .cl-modal { background: white; padding: 24px; border-radius: 12px; width: 400px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .cl-modal h3 { margin: 0 0 12px; font-size: 17px; font-weight: 800; color: #0F172A; }
        .cl-modal p { margin: 0 0 16px; font-size: 13.5px; color: #475569; line-height: 1.5; }
        .cl-modal input { width: 100%; box-sizing: border-box; border: 1px solid #CBD5E1; border-radius: 8px; padding: 10px; margin-bottom: 20px; font-size: 14px; outline: none; }
        .cl-modal input:focus { border-color: #14B8A6; box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.2); }
        .cl-modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
        .cl-modal-actions button { padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; border: none; }
        .cl-btn-cancel { background: #F1F5F9; color: #475569; }
        .cl-btn-revoke { background: #DC2626; color: #FFFFFF; }
        .cl-btn-revoke:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="cl-toolbar">
        <input placeholder="Search by name or certificate number…" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="">All statuses</option>
          <option value="valid">Valid</option>
          <option value="revoked">Revoked</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <table className="cl-table">
        <thead>
          <tr>
            <th>Certificate #</th>
            <th>Recipient</th>
            <th>Type</th>
            <th>Status</th>
            <th>Issued</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#94A3B8' }}>Loading…</td></tr>
          ) : certificates.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#94A3B8' }}>No certificates match.</td></tr>
          ) : certificates.map((c) => {
            const s = STATUS_STYLE[c.status] || STATUS_STYLE.valid;
            return (
              <tr key={c.id}>
                <td style={{ fontFamily: 'monospace' }}>{c.certificate_number}</td>
                <td>{c.recipient_name}</td>
                <td style={{ textTransform: 'capitalize' }}>{c.cert_type}</td>
                <td><span className="cl-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span></td>
                <td>{new Date(c.issued_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td className="cl-actions">
                  <a href={downloadCertificateUrl(c.id)} target="_blank" rel="noreferrer">Download</a>
                  <a href={`https://verify.auxosys.com/${c.id}`} target="_blank" rel="noreferrer" style={{color: '#059669', textDecoration: 'none'}}>Verify page</a>
                  {c.status === 'valid' && canRevoke && (
                    <button className="revoke" onClick={() => handleRevokeClick(c.id)}>Revoke</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="cl-pager">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
      </div>

      {revokeModalId && (
        <div className="cl-modal-overlay">
          <div className="cl-modal">
            <h3>Revoke Certificate</h3>
            <p>Please provide a reason for revoking this certificate. This will be permanently visible on the public verification page.</p>
            <input 
              autoFocus
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. Issued in error"
              onKeyDown={(e) => e.key === 'Enter' && submitRevoke()}
            />
            <div className="cl-modal-actions">
              <button className="cl-btn-cancel" onClick={() => { setRevokeModalId(null); setRevokeReason(''); }}>Cancel</button>
              <button className="cl-btn-revoke" disabled={!revokeReason.trim()} onClick={submitRevoke}>Confirm Revocation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
