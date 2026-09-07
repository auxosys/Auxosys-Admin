import React from 'react';
import { Search, RefreshCw, Star, X } from 'lucide-react';
import logoAvatar from '../../assets/logo-avatar.png';

export default function MessageList({ messages = [], loading, activeMessageId, onSelect, onSelectMessage, onStar, search, onSearchChange, onRefresh }) {
  const handleSelect = (m) => {
    if (typeof onSelectMessage === 'function') {
      onSelectMessage(m.id || m);
    } else if (typeof onSelect === 'function') {
      onSelect(m);
    }
  };

  const renderListAvatar = (fromName, fromAddress) => {
    const isAuxosys = fromAddress && fromAddress.toLowerCase().includes('@auxosys.com');
    if (isAuxosys) {
      return (
        <div className="ml-avatar-box">
          <img
            src={logoAvatar}
            alt="Profile Logo"
            className="ml-avatar-img"
            onError={(e) => {
              e.target.src = process.env.PUBLIC_URL + '/android-chrome-512.png';
            }}
          />
        </div>
      );
    }

    const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fromName || 'Lead')}&background=6366f1&color=fff&rounded=true&bold=true&size=64`;
    const unavatarUrl = `https://unavatar.io/${encodeURIComponent(fromAddress || '')}`;

    return (
      <div className="ml-avatar-box">
        <img
          src={unavatarUrl}
          alt={fromName}
          className="ml-avatar-img"
          onError={(e) => {
            e.target.src = uiAvatarUrl;
          }}
        />
      </div>
    );
  };

  return (
    <div className="msg-list">
      <style>{`
        .msg-list { width: 360px; flex-shrink: 0; border-right: 1px solid #E2E8F0; display: flex; flex-direction: column; background: #FFFFFF; }
        .ml-search-row { padding: 14px 16px; border-bottom: 1px solid #E2E8F0; display: flex; gap: 8px; align-items: center; }
        .ml-search-wrap { flex: 1; position: relative; display: flex; align-items: center; }
        .ml-search-wrap input { width: 100%; border: 1px solid #CBD5E1; border-radius: 8px; padding: 8px 30px 8px 32px; font-size: 13px; outline: none; }
        .ml-search-icon { position: absolute; left: 10px; color: #94A3B8; pointer-events: none; }
        .ml-clear-btn { position: absolute; right: 8px; background: none; border: none; color: #94A3B8; cursor: pointer; padding: 2px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.15s; }
        .ml-clear-btn:hover { background: #E2E8F0; color: #0F172A; }
        .ml-refresh { border: 1px solid #CBD5E1; background: #FFFFFF; border-radius: 8px; padding: 8px; color: #475569; cursor: pointer; transition: background 0.15s; }
        .ml-refresh:hover { background: #F1F5F9; }
        .ml-scroll { flex: 1; overflow-y: auto; }
        .ml-row { padding: 14px 16px; border-bottom: 1px solid #F1F5F9; cursor: pointer; transition: background 0.15s; display: flex; gap: 12px; align-items: flex-start; }
        .ml-row:hover { background: #F8FAFC; }
        .ml-row.active { background: #EFF6FF; border-left: 3px solid #1D4ED8; }
        .ml-avatar-box { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 1px solid #CBD5E1; background: #FFFFFF; display: flex; align-items: center; justify-content: center; padding: 2px; }
        .ml-avatar-img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; display: block; }
        .ml-avatar-initial { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-weight: 700; font-size: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
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
          <input
            placeholder="Search inbox & replies…"
            value={search || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          {search && (
            <button
              className="ml-clear-btn"
              onClick={() => onSearchChange?.('')}
              title="Clear search"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button className="ml-refresh" onClick={onRefresh} title="Refresh Messages">
          <RefreshCw size={15} />
        </button>
      </div>

      <div className="ml-scroll">
        {loading && messages.length === 0 ? (
          <div className="ml-empty">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="ml-empty">No messages found.</div>
        ) : messages.map((m) => {
          const isSentFolder = (m.folder || '').toUpperCase() === 'SENT';
          const recipientAddr = m.to_addresses?.[0]?.address || m.recipient_email;

          const rawFrom = m.from_name || '';
          let displayName = rawFrom;
          if (!displayName || displayName === m.from_address || displayName.includes('@')) {
            if (m.from_address && m.from_address.includes('dpritam2708')) {
              displayName = 'Pritam Das';
            } else if (m.from_address) {
              const uname = m.from_address.split('@')[0];
              displayName = uname.charAt(0).toUpperCase() + uname.slice(1);
            } else {
              displayName = 'Lead';
            }
          }
          const senderName = isSentFolder && recipientAddr
            ? `To: ${recipientAddr}`
            : displayName;

          return (
            <div
              key={m.id}
              className={`ml-row ${m.id === activeMessageId ? 'active' : ''} ${!m.is_read ? 'unread' : ''}`}
              onClick={() => handleSelect(m)}
            >
              {renderListAvatar(senderName, m.from_address)}
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
