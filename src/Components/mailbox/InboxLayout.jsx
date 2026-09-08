import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, Mail, Users, Zap, Activity, Inbox,
  PenSquare, ChevronDown, AlertTriangle, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listSenderEmails, listMessages, syncFolder, updateMessageFlags, deleteDraft } from '../../api/mailboxApi';
import { toast } from 'react-toastify';
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
import logoAvatar from '../../assets/logo-avatar.png';

const TABS = [
  { id: 'dashboard', label: 'Overview',       icon: BarChart3 },
  { id: 'senders',   label: 'Sender Emails',  icon: Mail },
  { id: 'audience',  label: 'Audience',        icon: Users },
  { id: 'campaigns', label: 'Campaigns',       icon: Zap },
  { id: 'activity',  label: 'Activity Logs',   icon: Activity },
  { id: 'inbox',     label: 'Inbox & Replies', icon: Inbox },
];

export default function InboxLayout() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  // Auto-open compose modal if redirected with state from candidate page
  useEffect(() => {
    if (location.state?.openCompose || location.state?.composeState) {
      const composeData = location.state.composeState || {
        mode: 'new',
        to: location.state.to ? [location.state.to] : [],
        subject: location.state.subject || '',
      };
      setActiveTab('inbox');
      setCompose(composeData);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

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

  const hasLoadedOnceRef = useRef(false);

  const loadMessages = useCallback(async (isSilent = false) => {
    if (!activeMailboxId) return;
    const shouldShowLoading = !isSilent && !hasLoadedOnceRef.current;
    if (shouldShowLoading) {
      setLoadingMessages(true);
    }
    try {
      const params = { folder: activeFolder };
      if (search) params.q = search;
      const { messages: msgs } = await listMessages(activeMailboxId, params);
      const list = msgs || [];
      setMessages(list);
      hasLoadedOnceRef.current = true;
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
    hasLoadedOnceRef.current = false;
    loadMessages(false);
    const interval = setInterval(() => {
      loadMessages(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, activeMailboxId, activeFolder, loadMessages]);

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
    try {
      await syncFolder(activeMailboxId, activeFolder);
    } catch (e) {}
    await loadMessages(true);
  };

  const handleSelectMessage = useCallback(async (id) => {
    if (!id) return;
    setActiveMessageId(id);
    setMessages((prev) =>
      prev.map((m) => (String(m.id) === String(id) ? { ...m, is_read: true } : m))
    );
    try {
      await updateMessageFlags(activeMailboxId, id, { is_read: true });
    } catch (err) {
      console.warn('Failed to update is_read:', err.message);
    }
  }, [activeMailboxId]);

  useEffect(() => {
    if (!activeMessageId) return;
    setMessages((prev) =>
      prev.map((m) => (String(m.id) === String(activeMessageId) && !m.is_read ? { ...m, is_read: true } : m))
    );
    updateMessageFlags(activeMailboxId, activeMessageId, { is_read: true }).catch(() => {});
  }, [activeMessageId, activeMailboxId]);

  const handleStar = async (message) => {
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_starred: !m.is_starred } : m)));
    try {
      await updateMessageFlags(activeMailboxId, message.id, { is_starred: !message.is_starred });
    } catch (err) {
      console.warn('Failed to update message flags:', err.message);
    }
  };

  const [draftToDelete, setDraftToDelete] = useState(null);
  const [deletingDraft, setDeletingDraft] = useState(false);

  const confirmDeleteDraft = async () => {
    if (!draftToDelete) return;
    if (!isSuperAdmin) {
      toast.error('Access Denied: Only Super Admin can delete emails and drafts');
      setDraftToDelete(null);
      return;
    }
    setDeletingDraft(true);
    try {
      await deleteDraft(draftToDelete.id);
      toast.success('Draft deleted successfully');
      setMessages((prev) => prev.filter((m) => String(m.id) !== String(draftToDelete.id)));
      if (String(activeMessageId) === String(draftToDelete.id)) {
        setActiveMessageId(null);
      }
      setDraftToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete draft');
    } finally {
      setDeletingDraft(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const selectedMailboxObj = mailboxes.find((m) => String(m.id) === String(activeMailboxId));
  const selectedMailboxLabel = selectedMailboxObj
    ? (selectedMailboxObj.id === 'all' ? 'All Company Senders' : (selectedMailboxObj.email_address || selectedMailboxObj.display_name))
    : 'All Company Senders';

  return (
    <div style={activeTab === 'inbox' ? css.page : css.pageScrollable}>

      {/* ── PAGE HEADER ── */}
      <div style={css.pageHeader}>
        <div style={css.pageHeaderLeft}>
          <div>
            <h1 style={css.pageTitle}>Outreach &amp; Mailbox</h1>
            <p style={css.pageSubtitle}>Powered by Brevo · Centralized email infrastructure</p>
          </div>
        </div>

        <div style={css.pageHeaderRight}>
          {mailboxes.length > 0 && (
            <div style={css.senderPillContainer} title="Active Sender Account">
              <select
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  zIndex: 10,
                }}
                value={activeMailboxId || 'all'}
                onChange={(e) => {
                  const selectedVal = e.target.value;
                  setActiveMailboxId(selectedVal);
                  setActiveMessageId(null);
                  hasLoadedOnceRef.current = false;
                }}
              >
                {mailboxes.map((mb) => (
                  <option key={mb.id} value={mb.id}>
                    {mb.id === 'all' ? 'All Company Senders' : (mb.email_address || mb.display_name)}
                  </option>
                ))}
              </select>

              <div style={{ ...css.senderAvatarCircle, background: '#ffffff', overflow: 'hidden', border: '1px solid #cbd5e1', padding: 2 }}>
                <img
                  src={logoAvatar}
                  alt="Profile Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                  onError={(e) => {
                    e.target.src = process.env.PUBLIC_URL + '/android-chrome-512.png';
                  }}
                />
              </div>
              <div style={css.senderTextWrap}>
                <span style={css.senderLabelMicro}>SENDER FILTER</span>
                <span style={css.senderSelectHeader}>
                  {selectedMailboxLabel}
                </span>
              </div>
              <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0, marginLeft: 2, pointerEvents: 'none' }} />
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
          {TABS.filter(tab => tab.id !== 'senders' || isSuperAdmin).map(tab => {
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
        {activeTab === 'senders'    && (isSuperAdmin ? <SenderEmailView /> : <OutreachDashboard />)}
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
                isSuperAdmin={isSuperAdmin}
              />
              <MessageList
                messages={messages}
                loading={loadingMessages}
                activeMessageId={activeMessageId}
                onSelectMessage={(id) => handleSelectMessage(id)}
                search={search}
                onSearchChange={(q) => setSearch(q)}
                onRefresh={handleRefresh}
                onStar={handleStar}
              />
              <MessageView
                mailboxId={activeMailboxId}
                messageId={activeMessageId}
                selectedMessage={messages.find((m) => String(m.id) === String(activeMessageId))}
                isSuperAdmin={isSuperAdmin}
                onReply={(msg) => setCompose({ mode: 'reply', message: msg })}
                onForward={(msg) => setCompose({ mode: 'forward', message: msg })}
                onEditDraft={(msg) => setCompose({ mode: 'edit_draft', draftId: msg.id, message: msg })}
                onDeleteDraft={(msg) => setDraftToDelete(msg)}
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

      {/* ── CUSTOM CONFIRM DELETE DRAFT MODAL ── */}
      {draftToDelete && (
        <div style={css.confirmOverlay} onClick={() => setDraftToDelete(null)}>
          <div style={css.confirmCard} onClick={(e) => e.stopPropagation()}>
            <div style={css.confirmHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={css.confirmIconWrap}>
                  <AlertTriangle size={18} color="#dc2626" />
                </div>
                <span style={css.confirmTitle}>Delete Draft</span>
              </div>
              <button style={css.confirmCloseBtn} onClick={() => setDraftToDelete(null)}>
                <X size={16} />
              </button>
            </div>
            <div style={css.confirmBody}>
              <p style={css.confirmText}>
                Are you sure you want to delete the draft <strong>"{draftToDelete.subject || '(No Subject)'}"</strong>? This action cannot be undone.
              </p>
              <div style={css.confirmActions}>
                <button
                  style={css.confirmCancelBtn}
                  onClick={() => setDraftToDelete(null)}
                  disabled={deletingDraft}
                >
                  Cancel
                </button>
                <button
                  style={css.confirmDeleteBtn}
                  onClick={confirmDeleteDraft}
                  disabled={deletingDraft}
                >
                  {deletingDraft ? 'Deleting…' : 'Delete Draft'}
                </button>
              </div>
            </div>
          </div>
        </div>
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
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 10,
    padding: '4px 12px 4px 8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
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

  /* confirmation modal */
  confirmOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.45)',
    backdropFilter: 'blur(3px)',
    zIndex: 1300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  confirmCard: {
    background: '#ffffff',
    borderRadius: 14,
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 20px 50px rgba(15,23,42,0.3)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  confirmHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  confirmTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
  },
  confirmIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
  },
  confirmBody: {
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  confirmText: {
    margin: 0,
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 1.6,
  },
  confirmActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  confirmCancelBtn: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  confirmDeleteBtn: {
    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
    transition: 'all 0.15s',
  },
};
