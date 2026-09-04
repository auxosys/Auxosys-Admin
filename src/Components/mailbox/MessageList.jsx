import React from 'react';
import { Search, RefreshCw, Star } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-blue-600 text-white',
  'bg-purple-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-indigo-600 text-white',
  'bg-rose-600 text-white',
];

function getAvatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function MessageList({ messages = [], loading, activeMessageId, onSelect, onSelectMessage, onStar, search, onSearchChange, onRefresh }) {
  const handleSelect = (m) => {
    if (typeof onSelectMessage === 'function') {
      onSelectMessage(m.id || m);
    } else if (typeof onSelect === 'function') {
      onSelect(m);
    }
  };

  return (
    <div className="msg-list">
      <style>{`
        .msg-list { width: 360px; flex-shrink: 0; border-right: 1px solid #E2E8F0; display: flex; flex-direction: column; background: #FFFFFF; }
        .ml-search-row { padding: 14px 16px; border-bottom: 1px solid #E2E8F0; display: flex; gap: 8px; align-items: center; }
        .ml-search-wrap { flex: 1; position: relative; display: flex; align-items: center; }
        .ml-search-wrap input { width: 100%; border: 1px solid #CBD5E1; border-radius: 8px; padding: 8px 12px 8px 32px; font-size: 13px; outline: none; }
        .ml-search-icon { position: absolute; left: 10px; color: #94A3B8; }
        .ml-refresh { border: 1px solid #CBD5E1; background: #FFFFFF; border-radius: 8px; padding: 8px; color: #475569; cursor: pointer; transition: background 0.15s; }
        .ml-refresh:hover { background: #F1F5F9; }
        .ml-scroll { flex: 1; overflow-y: auto; }
        .ml-row { padding: 14px 16px; border-bottom: 1px solid #F1F5F9; cursor: pointer; transition: background 0.15s; display: flex; gap: 12px; align-items: flex-start; }
        .ml-row:hover { background: #F8FAFC; }
        .ml-row.active { background: #EFF6FF; border-left: 3px solid #1D4ED8; }
        .ml-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; text-transform: uppercase; }
        .ml-content { flex: 1; min-width: 0; }
        .ml-top-row { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
        .ml-from { font-size: 13.5px; font-weight: 600; color: #1E293B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ml-row.unread .ml-from, .ml-row.unread .ml-subject { font-weight: 800; color: #0F172A; }
        .ml-time { font-size: 11px; color: #64748B; flex-shrink: 0; font-weight: 500; }
        .ml-subject { font-size: 13px; color: #334155; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; justify-content: space-between; align-items: center; }
        .ml-snippet { font-size: 12px; color: #64748B; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ml-star { background: none; border: none; cursor: pointer; padding: 2px; color: #CBD5E1; transition: color 0.15s; }
        .ml-star.starred { color: #F59E0B; }
        .ml-empty { text-align: center; padding: 60px 20px; color: #94A3B8; font-size: 13.5px; }
      `}</style>

      <div className="ml-search-row">
        <div className="ml-search-wrap">
          <Search size={15} className="ml-search-icon" />
          <input placeholder="Search inbox & replies…" value={search || ''} onChange={(e) => onSearchChange?.(e.target.value)} />
        </div>
        <button className="ml-refresh" onClick={onRefresh} title="Refresh Messages">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="ml-scroll">
        {loading ? (
          <div className="ml-empty">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="ml-empty">No messages found.</div>
        ) : messages.map((m) => {
          const isSentFolder = (m.folder || '').toUpperCase() === 'SENT';
          const recipientAddr = m.to_addresses?.[0]?.address || m.recipient_email;
          const senderName = isSentFolder && recipientAddr
            ? `To: ${recipientAddr}`
            : (m.from_name || m.from_address || 'Lead');
          const avatarColor = getAvatarColor(senderName);
          const initial = isSentFolder ? 'T' : (senderName[0] || 'A').toUpperCase();

          return (
            <div
              key={m.id}
              className={`ml-row ${m.id === activeMessageId ? 'active' : ''} ${!m.is_read ? 'unread' : ''}`}
              onClick={() => handleSelect(m)}
            >
              <div className={`ml-avatar ${avatarColor}`}>
                {initial}
              </div>
              <div className="ml-content">
                <div className="ml-top-row">
                  <span className="ml-from">{senderName}</span>
                  <span className="ml-time">{formatTime(m.received_at)}</span>
                </div>
                <div className="ml-subject">
                  <span className="truncate pr-2">{m.subject}</span>
                  {onStar && (
                    <button
                      className={`ml-star ${m.is_starred ? 'starred' : ''}`}
                      onClick={(e) => { e.stopPropagation(); onStar(m); }}
                    >
                      <Star size={14} fill={m.is_starred ? '#F59E0B' : 'none'} />
                    </button>
                  )}
                </div>
                {m.snippet && <div className="ml-snippet">{m.snippet}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
