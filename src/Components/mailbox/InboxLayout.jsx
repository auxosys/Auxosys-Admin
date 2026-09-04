import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Mail, Users, Zap, Activity, Inbox,
  PenSquare, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listMailboxes, listSenderEmails, listMessages, syncFolder, updateMessageFlags } from '../../api/mailboxApi';
import { useMailSocket } from '../../hooks/useMailSocket';
import FolderSidebar from './FolderSidebar';
import MessageList from './MessageList';
import MessageView from './MessageView';
import ComposeModal from './ComposeModal';
import AudienceView from '../outreach/AudienceView';
import CampaignView from '../outreach/CampaignView';
import OutreachDashboard from '../outreach/OutreachDashboard';
import SenderEmailView from '../outreach/SenderEmailView';
import EmailActivityView from '../outreach/EmailActivityView';

const TABS = [
  { id: 'dashboard', label: 'Overview',       icon: BarChart3 },
  { id: 'senders',   label: 'Sender Emails',  icon: Mail },
  { id: 'audience',  label: 'Audience',        icon: Users },
  { id: 'campaigns', label: 'Campaigns',       icon: Zap },
  { id: 'activity',  label: 'Activity Logs',   icon: Activity },
  { id: 'inbox',     label: 'Inbox & Replies', icon: Inbox },
];

function getSenderAvatar(mb) {
  if (!mb) return { bg: '#2563eb', label: 'M' };
  if (mb.id === 'all') return { bg: '#4f46e5', label: 'ALL' };
  const email = (mb.email_address || mb.email || '').toLowerCase();
  if (email.startsWith('careers')) return { bg: '#7c3aed', label: 'C' };
  if (email.startsWith('sales')) return { bg: '#059669', label: 'S' };
  if (email.startsWith('support')) return { bg: '#dc2626', label: 'SU' };
  if (email.startsWith('hr')) return { bg: '#d97706', label: 'HR' };
  if (email.startsWith('hello') || email.startsWith('contact')) return { bg: '#2563eb', label: 'H' };
  const first = email[0] ? email[0].toUpperCase() : 'M';
  return { bg: '#2563eb', label: first };
}

export default function InboxLayout() {
  const { profile } = useAuth();
  const isSuperAdmin = profile && (
    profile.role === 'Superadmin' ||
    profile.email === 'admin@auxosys.com' ||
    profile.email === 'auxosys@gmail.com'
  );

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mailboxes, setMailboxes] = useState([]);
  const [activeMailboxId, setActiveMailboxId] = useState(null);
  const [activeFolder, setActiveFolder] = useState('INBOX');
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [search, setSearch] = useState('');
  const [compose, setCompose] = useState(null);

  const loadMailboxes = useCallback(async () => {
    try {
      const res = await listSenderEmails();
      const senders = res?.senders || [];
      
      const mbs = [];
      // Only include "All Company Senders" option if user is a SuperAdmin
      if (isSuperAdmin && senders.length > 1) {
        mbs.push({
          id: 'all',
          email_address: 'All Company Senders',
          display_name: 'All Sender Emails',
          provider: 'brevo',
          status: 'connected'
        });
      }

      senders.forEach(s => {
        mbs.push({
          id: s.id,
          email_address: s.email,
          display_name: s.name || s.email,
          department: s.department,
          provider: 'brevo',
          status: 'connected'
        });
      });

      setMailboxes(mbs);
      if (mbs.length > 0) {
        setActiveMailboxId((prev) => (prev && mbs.some(m => String(m.id) === String(prev)) ? prev : mbs[0].id));
      } else {
        setActiveMailboxId(null);
      }
    } catch (err) {
      console.warn('Failed to load senders/mailboxes:', err.message);
    }
  }, [isSuperAdmin]);

  useEffect(() => { loadMailboxes(); }, [loadMailboxes]);

  const loadMessages = useCallback(async () => {
    if (!activeMailboxId) return;
    setLoadingMessages(true);
    try {
      const params = { folder: activeFolder };
      if (search) params.q = search;
      const { messages: msgs } = await listMessages(activeMailboxId, params);
      const list = msgs || [];
      setMessages(list);
      if (list.length > 0) {
        setActiveMessageId((prev) => (prev && list.some(m => String(m.id) === String(prev)) ? prev : list[0].id));
      } else {
        setActiveMessageId(null);
      }
    } catch (err) {
      console.warn('Failed to load messages:', err.message);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeMailboxId, activeFolder, search]);

  useEffect(() => {
    if (activeTab !== 'inbox') return;
    loadMessages();
    const interval = setInterval(() => {
      loadMessages();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, loadMessages]);

  useMailSocket(activeMailboxId, (newMessages) => {
    if (activeFolder !== 'INBOX') return;
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => `${m.folder}:${m.uid}`));
      const fresh = newMessages.filter((m) => !existingIds.has(`${m.folder}:${m.uid}`));
      return [...fresh.map((m) => ({ ...m, id: `${m.mailbox_id}-${m.uid}` })), ...prev];
    });
  });

  const handleRefresh = async () => {
    if (!activeMailboxId) return;
    await syncFolder(activeMailboxId, activeFolder);
    loadMessages();
  };

  const handleStar = async (message) => {
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_starred: !m.is_starred } : m)));
    try {
      await updateMessageFlags(activeMailboxId, message.id, { is_starred: !message.is_starred });
    } catch (err) {
      console.warn('Failed to update message flags:', err.message);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;
  const activeMailbox = mailboxes.find((m) => String(m.id) === String(activeMailboxId)) || mailboxes[0];
  const currentAvatar = getSenderAvatar(activeMailbox);

  return (
    <div style={activeTab === 'inbox' ? css.page : css.pageScrollable}>

      {/* ── PAGE HEADER ── */}
      <div style={css.pageHeader}>
        <div style={css.pageHeaderLeft}>
          <div style={css.headerIconWrap}>
            <Mail size={20} color="#fff" />
          </div>
          <div>
            <h1 style={css.pageTitle}>Outreach &amp; Mailbox</h1>
            <p style={css.pageSubtitle}>Powered by Brevo · Centralized email infrastructure</p>
          </div>
        </div>

        <div style={css.pageHeaderRight}>
          {mailboxes.length > 0 && (
            <div style={css.senderPillContainer} title="Active Sender Account">
              <div style={{ ...css.senderAvatarCircle, background: currentAvatar.bg }}>
                {currentAvatar.label}
              </div>
              <div style={css.senderTextWrap}>
                <span style={css.senderLabelMicro}>SENDER FILTER</span>
                <select
                  style={css.senderSelectHeader}
                  value={activeMailboxId || 'all'}
                  onChange={(e) => {
                    setActiveMailboxId(e.target.value);
                    setActiveMessageId(null);
                  }}
                >
                  {mailboxes.map((mb) => (
                    <option key={mb.id} value={mb.id}>
                      {mb.id === 'all' ? 'All Company Senders' : (mb.email_address || mb.display_name)}
                    </option>
                  ))}
                </select>
              </div>
              <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0, marginLeft: 2 }} />
            </div>
          )}

          <button style={css.composeBtn} onClick={() => setCompose({ mode: 'new' })}>
            <PenSquare size={15} style={{ marginRight: 6 }} />
            Compose
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={css.tabBar}>
        <div style={css.tabList}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                style={{ ...css.tabBtn, ...(isActive ? css.tabBtnActive : {}) }}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} style={{ marginRight: 6, flexShrink: 0 }} />
                {tab.label}
                {tab.id === 'inbox' && unreadCount > 0 && (
                  <span style={css.badge}>{unreadCount}</span>
                )}
                {isActive && <span style={css.activeIndicator} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={activeTab === 'inbox' ? css.content : css.contentScrollable}>
        {activeTab === 'dashboard'  && <OutreachDashboard />}
        {activeTab === 'senders'    && <SenderEmailView />}
        {activeTab === 'audience'   && <AudienceView />}
        {activeTab === 'campaigns'  && <CampaignView />}
        {activeTab === 'activity'   && <EmailActivityView />}
        {activeTab === 'inbox'      && (
          mailboxes.length === 0 ? (
            <div style={css.emptyInbox}>
              <Inbox size={48} color="#cbd5e1" style={{ marginBottom: 12 }} />
              <p style={{ fontWeight: 600, color: '#334155', margin: 0 }}>No mailboxes configured</p>
              <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                Replies from campaigns appear here automatically via Brevo webhooks.
              </p>
            </div>
          ) : (
            <div style={css.inboxSplit}>
              <FolderSidebar
                activeFolder={activeFolder}
                onSelectFolder={(f) => { setActiveFolder(f); setActiveMessageId(null); }}
                unreadCount={unreadCount}
              />
              <MessageList
                messages={messages}
                loading={loadingMessages}
                activeMessageId={activeMessageId}
                onSelectMessage={(id) => setActiveMessageId(id)}
                search={search}
                onSearchChange={(q) => setSearch(q)}
                onRefresh={handleRefresh}
                onStar={handleStar}
              />
              <MessageView
                mailboxId={activeMailboxId}
                messageId={activeMessageId}
                selectedMessage={messages.find((m) => String(m.id) === String(activeMessageId))}
                onReply={(msg) => setCompose({ mode: 'reply', message: msg })}
                onForward={(msg) => setCompose({ mode: 'forward', message: msg })}
              />
            </div>
          )
        )}
      </div>

      {/* ── COMPOSE MODAL ── */}
      {compose && (
        <ComposeModal
          composeState={compose}
          mailboxId={activeMailboxId}
          onClose={() => setCompose(null)}
          onSent={() => { setCompose(null); if (activeTab === 'inbox') loadMessages(); }}
        />
      )}
    </div>
  );
}

const css = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 60px)',
    background: '#f8fafc',
    overflow: 'hidden',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  pageScrollable: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    height: 'auto',
    background: '#f8fafc',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  /* page header */
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px 14px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    flexShrink: 0,
  },
  pageHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #071b3a, #132242)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pageTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1.2,
  },
  pageSubtitle: {
    margin: 0,
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  pageHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  senderPillContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '4px 12px 4px 8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    transition: 'all 0.15s ease',
  },
  senderAvatarCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 11,
    flexShrink: 0,
    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  },
  senderTextWrap: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  senderLabelMicro: {
    fontSize: 9,
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    lineHeight: 1,
    marginBottom: 2,
  },
  senderSelectHeader: {
    border: 'none',
    background: 'transparent',
    fontSize: 13,
    fontWeight: 600,
    color: '#0f172a',
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    margin: 0,
    appearance: 'none',
  },
  composeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #071b3a, #132242)',
    color: '#fff',
    border: 'none',
    borderRadius: 9,
    padding: '9px 18px',
    fontSize: 13.5,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(7,27,58,0.25)',
    letterSpacing: 0.2,
    transition: 'opacity 0.15s',
  },

  /* tabs */
  tabBar: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    flexShrink: 0,
    overflowX: 'auto',
  },
  tabList: {
    display: 'flex',
    padding: '0 20px',
    gap: 0,
  },
  tabBtn: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'color 0.15s',
    letterSpacing: 0.1,
  },
  tabBtnActive: {
    color: '#1d4ed8',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
    borderRadius: '2px 2px 0 0',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ef4444',
    color: '#fff',
    borderRadius: 100,
    fontSize: 10,
    fontWeight: 700,
    minWidth: 18,
    height: 18,
    padding: '0 5px',
    marginLeft: 6,
  },

  /* content */
  content: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  contentScrollable: {
    flex: 1,
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },

  /* inbox */
  emptyInbox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    padding: 40,
    textAlign: 'center',
  },
  inboxSplit: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
};
