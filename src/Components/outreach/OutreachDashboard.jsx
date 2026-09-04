import React, { useState, useEffect } from 'react';
import {
  Users, Send, Eye, MousePointer, CornerUpLeft,
  TrendingUp, AlertTriangle, RefreshCw, Info
} from 'lucide-react';
import { getOutreachStats } from '../../api/mailboxApi';

const STAT_DEFS = [
  {
    key: 'totalContacts',
    label: 'Total Audience',
    icon: Users,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    format: 'number',
    sub: 'Active contacts',
  },
  {
    key: 'emailsSent',
    label: 'Emails Sent',
    icon: Send,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    format: 'number',
    sub: 'Via Brevo infrastructure',
  },
  {
    key: 'estimatedOpens',
    label: 'Est. Opens',
    rateKey: 'openRate',
    icon: Eye,
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    format: 'number',
    sub: 'Pixel tracked *',
    note: true,
  },
  {
    key: 'linkClicks',
    label: 'Link Clicks',
    rateKey: 'clickRate',
    icon: MousePointer,
    color: '#059669',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    format: 'number',
    sub: 'Redirect tracked',
  },
  {
    key: 'replies',
    label: 'Direct Replies',
    rateKey: 'replyRate',
    icon: CornerUpLeft,
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
    format: 'number',
    sub: 'Webhook tracked',
  },
];

export default function OutreachDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOutreachStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={css.page}>

      {/* Header */}
      <div style={css.header}>
        <div>
          <div style={css.headerRow}>
            <TrendingUp size={22} color="#1d4ed8" />
            <h2 style={css.title}>Outreach Performance</h2>
          </div>
          <p style={css.subtitle}>Real-time campaign analytics powered by Brevo infrastructure.</p>
        </div>
        <button style={css.refreshBtn} onClick={loadStats} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} style={{ marginRight: 6, ...(loading ? { animation: 'spin 1s linear infinite' } : {}) }} />
          Refresh
        </button>
      </div>

      {/* Open-rate disclaimer banner */}
      <div style={css.banner}>
        <Info size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={css.bannerText}>
          <strong>Open Rate Note:</strong> Email open tracking is an <em>estimated metric</em> due to Apple Mail Privacy Protection, image proxying, and client-side image blocking. Click &amp; reply metrics are exact direct events.
        </p>
      </div>

      {loading ? (
        <div style={css.loadingGrid}>
          {STAT_DEFS.map(d => (
            <div key={d.key} style={{ ...css.card, opacity: 0.4 }}>
              <div style={{ ...css.cardIconWrap, background: d.bg, border: `1px solid ${d.border}` }}>
                <d.icon size={20} color={d.color} />
              </div>
              <div style={css.cardSkeleton} />
              <div style={{ ...css.cardSkeleton, width: '60%', marginTop: 6 }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={css.errorBox}>
          <AlertTriangle size={20} color="#dc2626" style={{ marginRight: 8 }} />
          <span>{error}</span>
        </div>
      ) : (
        <>
          <div style={css.grid}>
            {STAT_DEFS.map(d => {
              const value = stats?.[d.key] ?? 0;
              const rate = d.rateKey ? stats?.[d.rateKey] : null;
              const Icon = d.icon;
              return (
                <div key={d.key} style={css.card}>
                  <div style={{ ...css.cardIconWrap, background: d.bg, border: `1px solid ${d.border}` }}>
                    <Icon size={20} color={d.color} />
                  </div>
                  <div style={css.cardValue} title={value.toLocaleString()}>
                    {value.toLocaleString()}
                    {rate !== null && (
                      <span style={{ ...css.cardRate, color: d.color }}>
                        {' '}
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>({rate}%)</span>
                      </span>
                    )}
                  </div>
                  <div style={css.cardLabel}>{d.label}</div>
                  <div style={css.cardSub}>{d.sub}{d.note && ' *'}</div>
                  {rate !== null && (
                    <div style={css.progressOuter}>
                      <div
                        style={{
                          ...css.progressInner,
                          width: `${Math.min(parseFloat(rate) || 0, 100)}%`,
                          background: d.color,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick tips */}
          <div style={css.tipsSection}>
            <h3 style={css.tipsTitle}>💡 Quick Tips</h3>
            <div style={css.tipsGrid}>
              {[
                { tip: 'Personalize subject lines to boost open rates by up to 26%.', color: '#eff6ff', border: '#bfdbfe', tc: '#1d4ed8' },
                { tip: 'Send campaigns between Tuesday–Thursday 9–11 AM for best engagement.', color: '#f0fdf4', border: '#bbf7d0', tc: '#059669' },
                { tip: 'Keep unsubscribe links visible to maintain Brevo sender reputation.', color: '#fff7ed', border: '#fed7aa', tc: '#ea580c' },
              ].map((t, i) => (
                <div key={i} style={{ ...css.tipCard, background: t.color, border: `1px solid ${t.border}` }}>
                  <p style={{ ...css.tipText, color: t.tc }}>{t.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const css = {
  page: {
    padding: '24px 28px',
    overflowY: 'auto',
    height: '100%',
    fontFamily: 'Inter, system-ui, sans-serif',
    background: '#f8fafc',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
  },
  subtitle: {
    margin: 0,
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    flexShrink: 0,
  },
  banner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: 10,
    padding: '12px 16px',
    marginBottom: 24,
  },
  bannerText: {
    margin: 0,
    fontSize: 12.5,
    color: '#1e40af',
    lineHeight: 1.6,
  },
  loadingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    padding: '14px 18px',
    color: '#dc2626',
    fontSize: 13,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 16,
    marginBottom: 28,
  },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s',
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    flexShrink: 0,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 800,
    color: '#0f172a',
    lineHeight: 1.1,
    marginBottom: 4,
  },
  cardRate: {
    fontSize: 14,
    fontWeight: 700,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 10,
  },
  cardSkeleton: {
    height: 20,
    background: '#f1f5f9',
    borderRadius: 6,
    width: '80%',
    marginBottom: 4,
  },
  progressOuter: {
    height: 3,
    background: '#f1f5f9',
    borderRadius: 100,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  progressInner: {
    height: '100%',
    borderRadius: 100,
    transition: 'width 0.6s ease',
  },
  tipsSection: {
    marginTop: 4,
  },
  tipsTitle: {
    margin: '0 0 12px',
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
  },
  tipsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 12,
  },
  tipCard: {
    borderRadius: 10,
    padding: '14px 16px',
  },
  tipText: {
    margin: 0,
    fontSize: 12.5,
    lineHeight: 1.6,
    fontWeight: 500,
  },
};
