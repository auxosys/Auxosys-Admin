import React, { useState, useEffect, useCallback } from 'react';
import { listMailboxes, getGoogleConnectUrl, connectAppPassword, disconnectMailbox } from '../../api/mailboxApi';

const STATUS_STYLE = {
  connected: { bg: '#EAFAF7', color: '#0C8074', label: 'Connected' },
  connecting: { bg: '#FFF7ED', color: '#C2410C', label: 'Connecting…' },
  error: { bg: '#FEF2F2', color: '#DC2626', label: 'Error' },
  disconnected: { bg: '#F1F5F9', color: '#94A3B8', label: 'Disconnected' },
};

export default function MailboxConnect() {
  const [mailboxes, setMailboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAppPasswordForm, setShowAppPasswordForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { mailboxes } = await listMailboxes();
      setMailboxes(mailboxes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDisconnect = async (id) => {
    if (!window.confirm('Disconnect this mailbox? Mail already synced stays visible, but no new mail will arrive.')) return;
    await disconnectMailbox(id);
    load();
  };

  return (
    <div className="mb-connect">
      <style>{`
        .mbc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .mbc-head h2 { font-size: 18px; font-weight: 700; color: #0F172A; margin: 0; }
        .mbc-add-row { display: flex; gap: 10px; }
        .mbc-btn { border: none; border-radius: 8px; padding: 10px 16px; font-size: 13.5px; font-weight: 700; cursor: pointer; }
        .mbc-btn-google { background: #0F172A; color: #FFFFFF; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
        .mbc-btn-outline { background: #FFFFFF; border: 1px solid #E2E8F0; color: #334155; }
        .mbc-list { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .mbc-row { display: flex; align-items: center; justify-content: space-between; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 20px; }
        .mbc-email { font-weight: 700; color: #0F172A; font-size: 14.5px; }
        .mbc-meta { font-size: 12.5px; color: #64748B; margin-top: 3px; }
        .mbc-badge { font-size: 11.5px; font-weight: 700; padding: 4px 11px; border-radius: 100px; }
        .mbc-row-actions { display: flex; align-items: center; gap: 14px; }
        .mbc-disconnect { font-size: 12.5px; font-weight: 700; color: #DC2626; background: none; border: none; cursor: pointer; }
        .mbc-empty { text-align: center; padding: 48px; color: #94A3B8; font-size: 14px; }
      `}</style>

      <div className="mbc-head">
        <h2>Connected Mailboxes</h2>
        <div className="mbc-add-row">
          <a className="mbc-btn mbc-btn-google" href={getGoogleConnectUrl()}>Connect Gmail / Google Workspace</a>
          <button className="mbc-btn mbc-btn-outline" onClick={() => setShowAppPasswordForm(true)}>
            Connect Other Provider
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#94A3B8', fontSize: 14 }}>Loading…</p>
      ) : mailboxes.length === 0 ? (
        <div className="mbc-empty">No mailboxes connected yet. Connect Gmail to get started.</div>
      ) : (
        <div className="mbc-list">
          {mailboxes.map((mb) => {
            const s = STATUS_STYLE[mb.status] || STATUS_STYLE.disconnected;
            return (
              <div className="mbc-row" key={mb.id}>
                <div>
                  <div className="mbc-email">{mb.email_address}</div>
                  <div className="mbc-meta">
                    {mb.provider === 'gmail' ? 'Google Workspace' : 'IMAP/SMTP'}
                    {mb.last_synced_at && ` · last synced ${new Date(mb.last_synced_at).toLocaleString('en-IN')}`}
                    {mb.status === 'error' && mb.last_error && ` · ${mb.last_error}`}
                  </div>
                </div>
                <div className="mbc-row-actions">
                  <span className="mbc-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  <button className="mbc-disconnect" onClick={() => handleDisconnect(mb.id)}>Disconnect</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAppPasswordForm && (
        <AppPasswordModal onClose={() => setShowAppPasswordForm(false)} onDone={() => { setShowAppPasswordForm(false); load(); }} />
      )}
    </div>
  );
}

function AppPasswordModal({ onClose, onDone }) {
  const [form, setForm] = useState({
    email_address: '', display_name: '', app_password: '',
    imap_host: '', imap_port: 993, smtp_host: '', smtp_port: 465,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await connectAppPassword(form);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ap-overlay" onClick={onClose}>
      <style>{`
        .ap-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .ap-modal { background: #FFFFFF; border-radius: 14px; padding: 26px; width: 420px; max-width: 92vw; }
        .ap-modal h3 { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 6px; }
        .ap-modal p.hint { font-size: 12.5px; color: #64748B; margin: 0 0 18px; }
        .ap-field { margin-bottom: 12px; }
        .ap-field label { display: block; font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 5px; }
        .ap-field input { width: 100%; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 11px; font-size: 13.5px; box-sizing: border-box; }
        .ap-row { display: flex; gap: 10px; }
        .ap-row .ap-field { flex: 1; }
        .ap-actions { display: flex; gap: 10px; margin-top: 6px; }
        .ap-actions button { flex: 1; padding: 10px; border-radius: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; border: none; }
        .ap-cancel { background: #F1F5F9; color: #475569; }
        .ap-submit { background: #14B8A6; color: #FFFFFF; }
        .ap-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .ap-error { color: #DC2626; font-size: 12.5px; margin-bottom: 10px; }
      `}</style>
      <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Connect a non-Gmail mailbox</h3>
        <p className="hint">Use your provider's IMAP/SMTP host and an app-specific password (not your regular login password).</p>
        <form onSubmit={handleSubmit}>
          {error && <p className="ap-error">{error}</p>}
          <div className="ap-field">
            <label>Email address</label>
            <input type="email" value={form.email_address} onChange={set('email_address')} required />
          </div>
          <div className="ap-field">
            <label>Display name (optional)</label>
            <input value={form.display_name} onChange={set('display_name')} />
          </div>
          <div className="ap-field">
            <label>App password</label>
            <input type="password" value={form.app_password} onChange={set('app_password')} required />
          </div>
          <div className="ap-row">
            <div className="ap-field">
              <label>IMAP host</label>
              <input value={form.imap_host} onChange={set('imap_host')} placeholder="imap.example.com" required />
            </div>
            <div className="ap-field">
              <label>IMAP port</label>
              <input type="number" value={form.imap_port} onChange={set('imap_port')} />
            </div>
          </div>
          <div className="ap-row">
            <div className="ap-field">
              <label>SMTP host</label>
              <input value={form.smtp_host} onChange={set('smtp_host')} placeholder="smtp.example.com" required />
            </div>
            <div className="ap-field">
              <label>SMTP port</label>
              <input type="number" value={form.smtp_port} onChange={set('smtp_port')} />
            </div>
          </div>
          <div className="ap-actions">
            <button type="button" className="ap-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="ap-submit" disabled={saving}>{saving ? 'Connecting…' : 'Connect'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
