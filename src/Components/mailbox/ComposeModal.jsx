import React, { useState, useEffect, useRef } from 'react';
import {
  X, Minus, Maximize2, Minimize2, Paperclip, Send,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Link2, Trash2, Type
} from 'lucide-react';
import { listSenderEmails, sendDirectEmail, sendMessage, saveDraft, deleteDraft } from '../../api/mailboxApi';
import { toast } from 'react-toastify';

/* ─── tiny helper ─── */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/* ─── Recipient Tag Input ─── */
function RecipientInput({ label, emails, onChange, autoFocus = false }) {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);

  const addEmail = (raw) => {
    const parts = raw.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
    const valid = parts.filter(isValidEmail);
    if (valid.length) onChange([...new Set([...emails, ...valid])]);
    setInputVal('');
  };

  const removeEmail = (idx) => onChange(emails.filter((_, i) => i !== idx));

  const handleKeyDown = (e) => {
    if (['Enter', ',', ';', 'Tab'].includes(e.key)) {
      e.preventDefault();
      if (inputVal.trim()) addEmail(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && emails.length) {
      removeEmail(emails.length - 1);
    }
  };

  const handleBlur = () => { if (inputVal.trim()) addEmail(inputVal); };

  return (
    <div style={styles.recipientRow} onClick={() => inputRef.current?.focus()}>
      <span style={styles.recipientLabel}>{label}</span>
      <div style={styles.tagContainer}>
        {emails.map((em, i) => (
          <span key={em + i} style={styles.tag}>
            {em}
            <button style={styles.tagClose} onClick={(e) => { e.stopPropagation(); removeEmail(i); }}>×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          style={styles.tagInput}
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={emails.length === 0 ? 'Add recipients…' : ''}
        />
      </div>
    </div>
  );
}

/* ─── Toolbar Button ─── */
function ToolBtn({ icon: Icon, title, onClick, active }) {
  return (
    <button
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      style={{ ...styles.toolBtn, ...(active ? styles.toolBtnActive : {}) }}
    >
      <Icon size={14} />
    </button>
  );
}

/* ─── Main Component ─── */
export default function ComposeModal({
  mailboxId = null,
  mode = 'new',
  replyTo = null,
  composeState = null,
  onClose,
  onSent
}) {
  const [senders, setSenders] = useState([]);
  const [sendersLoading, setSendersLoading] = useState(true);
  const [sendersError, setSendersError] = useState(null);
  const [selectedSenderId, setSelectedSenderId] = useState('');
  const [to, setTo] = useState([]);
  const [cc, setCc] = useState([]);
  const [bcc, setBcc] = useState([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const editorRef = useRef(null);
  const fileRef = useRef(null);

  // resolve mode from composeState (legacy prop support)
  const resolvedMode = composeState?.mode || mode;
  const resolvedReplyTo = composeState?.message || replyTo;

  useEffect(() => {
    // pre-fill for reply/forward/edit_draft
    if (resolvedMode === 'reply' && resolvedReplyTo) {
      const addr = resolvedReplyTo.from_address || resolvedReplyTo.from;
      if (addr) setTo([addr]);
      const sub = resolvedReplyTo.subject || '';
      setSubject(sub.startsWith('Re:') ? sub : `Re: ${sub}`);
      if (editorRef.current) {
        const quoted = buildQuote(resolvedReplyTo);
        editorRef.current.innerHTML = `<br><br>${quoted}`;
        placeCaretAtStart(editorRef.current);
      }
    } else if (resolvedMode === 'forward' && resolvedReplyTo) {
      const sub = resolvedReplyTo.subject || '';
      setSubject(sub.startsWith('Fwd:') ? sub : `Fwd: ${sub}`);
      if (editorRef.current) {
        const quoted = buildQuote(resolvedReplyTo);
        editorRef.current.innerHTML = `<br><br>${quoted}`;
      }
    } else if ((resolvedMode === 'edit_draft' || resolvedMode === 'edit') && resolvedReplyTo) {
      const addrs = (resolvedReplyTo.to_addresses || []).map(t => typeof t === 'string' ? t : t.address).filter(Boolean);
      if (addrs.length) setTo(addrs);
      if (resolvedReplyTo.subject) setSubject(resolvedReplyTo.subject);
      if (editorRef.current) {
        editorRef.current.innerHTML = resolvedReplyTo.body_html || resolvedReplyTo.body_text || '';
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSendersLoading(true);
    setSendersError(null);
    listSenderEmails()
      .then(res => {
        // Show all active senders — is_verified syncs from Brevo separately
        const active = (res.senders || []).filter(s => s.status === 'active');
        setSenders(active);
        if (active.length > 0) {
          let defaultSender = active[0];
          if (mailboxId && mailboxId !== 'all') {
            const found = active.find(
              s => String(s.id) === String(mailboxId) || s.email.toLowerCase() === String(mailboxId).toLowerCase()
            );
            if (found) defaultSender = found;
          }
          setSelectedSenderId(defaultSender.id);
        } else {
          setSendersError('No active sender emails found. Add senders in the Sender Emails tab.');
        }
      })
      .catch(err => {
        console.error('[ComposeModal] Failed to load senders:', err);
        setSendersError('Could not load sender emails. Check your connection.');
      })
      .finally(() => setSendersLoading(false));
  }, [mailboxId]);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const savedRangeRef = useRef(null);

  const execCmd = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  const handleOpenLinkModal = () => {
    editorRef.current?.focus();
    let selText = '';
    if (window.getSelection) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        selText = sel.toString();
      }
    }
    setLinkText(selText);
    setLinkUrl('https://');
    setShowLinkModal(true);
  };

  const handleApplyLink = () => {
    if (!linkUrl.trim()) {
      setShowLinkModal(false);
      return;
    }

    let finalUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    editorRef.current?.focus();

    if (savedRangeRef.current && window.getSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }

    const selStr = window.getSelection()?.toString() || '';

    if (selStr.length > 0) {
      document.execCommand('createLink', false, finalUrl);
    } else {
      const textToDisplay = linkText.trim() || finalUrl;
      const anchorHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${textToDisplay}</a>`;
      document.execCommand('insertHTML', false, anchorHtml);
    }

    setShowLinkModal(false);
  };

  const [savingDraft, setSavingDraft] = useState(false);

  const draftIdToUse = composeState?.draftId || (resolvedMode === 'edit_draft' || resolvedMode === 'edit' ? resolvedReplyTo?.id : undefined);

  const handleSaveDraft = async () => {
    const bodyHtml = editorRef.current?.innerHTML || '';
    const bodyText = editorRef.current?.innerText || '';

    setSavingDraft(true);
    try {
      await saveDraft({
        draftId: draftIdToUse,
        senderEmailId: selectedSenderId || undefined,
        mailboxId: mailboxId || undefined,
        to, cc, bcc, subject,
        html: bodyHtml,
        text: bodyText,
        files,
      });
      toast.success('Draft saved successfully!');
      onSent?.();
    } catch (err) {
      toast.error(err.message || 'Failed to save draft.');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSend = async () => {
    const bodyHtml = editorRef.current?.innerHTML || '';
    const bodyText = editorRef.current?.innerText || '';

    if (to.length === 0) { toast.error('Please add at least one recipient.'); return; }
    if (!subject.trim()) { toast.error('Subject is required.'); return; }

    setSending(true);
    try {
      if (selectedSenderId) {
        // Brevo-powered send
        await sendDirectEmail({
          senderEmailId: selectedSenderId,
          to, cc, bcc, subject,
          html: bodyHtml,
          text: bodyText,
          files,
        });
      } else if (mailboxId) {
        // Legacy mailbox send
        await sendMessage(mailboxId, {
          to: to.join(', '),
          cc: cc.join(', ') || undefined,
          bcc: bcc.join(', ') || undefined,
          subject,
          html: bodyHtml,
          text: bodyText,
          inReplyToMessageId: resolvedMode !== 'new' ? resolvedReplyTo?.id : undefined,
          files,
        });
      } else {
        toast.error('No sender or mailbox configured.');
        return;
      }

      if (draftIdToUse) {
        await deleteDraft(draftIdToUse).catch(() => {});
      }

      toast.success('Email sent successfully!');
      onSent?.();
    } catch (err) {
      toast.error(err.message || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const titleMap = { reply: 'Reply', forward: 'Forward', new: 'New Message' };

  const wrapStyle = expanded ? styles.overlayExpanded : styles.overlayDefault;
  const modalStyle = expanded
    ? styles.modalExpanded
    : minimized
      ? styles.modalMinimized
      : styles.modalDefault;

  return (
    <div style={wrapStyle}>
      <div style={modalStyle}>

        {/* ── HEADER ── */}
        <div style={styles.header}>
          <span style={styles.headerTitle}>{titleMap[resolvedMode] || 'New Message'}</span>
          <div style={styles.headerActions}>
            <button style={styles.hBtn} title="Minimize" onClick={() => setMinimized(v => !v)}>
              <Minus size={14} />
            </button>
            <button style={styles.hBtn} title={expanded ? 'Restore' : 'Expand'} onClick={() => { setExpanded(v => !v); setMinimized(false); }}>
              {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
            <button style={{ ...styles.hBtn, ...styles.hBtnClose }} title="Close" onClick={onClose}>
              <X size={14} />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* ── FROM ── */}
            <div style={styles.fromRow}>
              <span style={styles.fromLabel}>From</span>
              {sendersLoading ? (
                <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Loading senders…</span>
              ) : sendersError ? (
                <span style={{ fontSize: 12, color: '#dc2626' }}>⚠ {sendersError}</span>
              ) : senders.length === 0 ? (
                <span style={{ fontSize: 12, color: '#f59e0b' }}>No active senders — add one in Sender Emails tab.</span>
              ) : (
                <select
                  value={selectedSenderId}
                  onChange={e => setSelectedSenderId(e.target.value)}
                  style={styles.fromSelect}
                >
                  {senders.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} &lt;{s.email}&gt;{!s.is_verified ? ' (not verified)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ── TO / CC / BCC ── */}
            <div style={styles.fieldBorder}>
              <RecipientInput label="To" emails={to} onChange={setTo} autoFocus />
              <div style={styles.ccBccRow}>
                {!showCc && <button style={styles.ccBtnLink} onClick={() => setShowCc(true)}>Cc</button>}
                {!showBcc && <button style={styles.ccBtnLink} onClick={() => setShowBcc(true)}>Bcc</button>}
              </div>
            </div>
            {showCc && (
              <div style={styles.fieldBorder}>
                <RecipientInput label="Cc" emails={cc} onChange={setCc} />
              </div>
            )}
            {showBcc && (
              <div style={styles.fieldBorder}>
                <RecipientInput label="Bcc" emails={bcc} onChange={setBcc} />
              </div>
            )}

            {/* ── SUBJECT ── */}
            <div style={styles.subjectRow}>
              <input
                style={styles.subjectInput}
                placeholder="Subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>

            {/* ── BODY ── */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              style={{
                ...styles.body,
                minHeight: expanded ? '300px' : '150px',
                maxHeight: expanded ? 'calc(90vh - 240px)' : 'calc(100vh - 300px)',
                overflowY: 'auto'
              }}
              data-placeholder="Compose your message…"
            />

            {/* ── ATTACHMENTS ── */}
            {files.length > 0 && (
              <div style={styles.attachList}>
                {files.map((f, i) => (
                  <span key={i} style={styles.attachChip}>
                    <Paperclip size={11} style={{ marginRight: 4 }} />
                    {f.name}
                    <button style={styles.attachRemove} onClick={() => removeFile(i)}>×</button>
                  </span>
                ))}
              </div>
            )}

            {/* ── FORMATTING TOOLBAR ── */}
            <div style={styles.toolbar}>
              <ToolBtn icon={Bold} title="Bold" onClick={() => execCmd('bold')} />
              <ToolBtn icon={Italic} title="Italic" onClick={() => execCmd('italic')} />
              <ToolBtn icon={Underline} title="Underline" onClick={() => execCmd('underline')} />
              <ToolBtn icon={Strikethrough} title="Strikethrough" onClick={() => execCmd('strikeThrough')} />
              <div style={styles.toolSep} />
              <ToolBtn icon={List} title="Bullet List" onClick={() => execCmd('insertUnorderedList')} />
              <ToolBtn icon={ListOrdered} title="Numbered List" onClick={() => execCmd('insertOrderedList')} />
              <ToolBtn icon={Link2} title="Insert Link" onClick={handleOpenLinkModal} active={showLinkModal} />
              <div style={styles.toolSep} />
              <ToolBtn icon={Type} title="Remove Formatting" onClick={() => execCmd('removeFormat')} />
            </div>

            {/* ── CUSTOM LINK POPUP DIALOG ── */}
            {showLinkModal && (
              <div style={styles.linkModalOverlay} onClick={() => setShowLinkModal(false)}>
                <div style={styles.linkModalCard} onClick={e => e.stopPropagation()}>
                  <div style={styles.linkModalHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Link2 size={16} color="#1d4ed8" />
                      <span style={styles.linkModalTitle}>Insert Link</span>
                    </div>
                    <button style={styles.linkModalCloseBtn} onClick={() => setShowLinkModal(false)}>
                      <X size={14} />
                    </button>
                  </div>

                  <div style={styles.linkModalBody}>
                    <div style={styles.linkFieldGroup}>
                      <label style={styles.linkLabel}>URL</label>
                      <input
                        autoFocus
                        style={styles.linkInput}
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={e => setLinkUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleApplyLink(); }}
                      />
                    </div>

                    <div style={styles.linkFieldGroup}>
                      <label style={styles.linkLabel}>Text to Display (Optional)</label>
                      <input
                        style={styles.linkInput}
                        placeholder="Link text…"
                        value={linkText}
                        onChange={e => setLinkText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleApplyLink(); }}
                      />
                    </div>

                    <div style={styles.linkModalActions}>
                      <button style={styles.linkCancelBtn} onClick={() => setShowLinkModal(false)}>
                        Cancel
                      </button>
                      <button style={styles.linkInsertBtn} onClick={handleApplyLink}>
                        Insert Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── FOOTER ── */}
            <div style={styles.footer}>
              <div style={styles.footerLeft}>
                <button
                  style={{ ...styles.sendBtn, ...((sending || savingDraft) ? styles.sendBtnDisabled : {}) }}
                  onClick={handleSend}
                  disabled={sending || savingDraft}
                >
                  <Send size={14} style={{ marginRight: 6 }} />
                  {sending ? 'Sending…' : 'Send'}
                </button>
                <button
                  style={{ ...styles.draftBtn, ...((sending || savingDraft) ? styles.sendBtnDisabled : {}) }}
                  onClick={handleSaveDraft}
                  disabled={sending || savingDraft}
                >
                  {savingDraft ? 'Saving…' : 'Save Draft'}
                </button>
                <label style={styles.iconBtn} title="Attach files">
                  <Paperclip size={16} />
                  <input ref={fileRef} type="file" multiple hidden onChange={handleFileChange} />
                </label>
              </div>
              <button
                style={styles.iconBtn}
                title="Discard draft"
                onClick={onClose}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

/* ─── Helpers ─── */
function buildQuote(msg) {
  const dateStr = msg.received_at ? new Date(msg.received_at).toLocaleString('en-IN') : '';
  const from = msg.from_name ? `${msg.from_name} &lt;${msg.from_address}&gt;` : msg.from_address || '';
  return `<div style="border-left:3px solid #cbd5e1;margin-top:14px;padding:10px 12px;color:#64748b;font-size:13px;max-height:180px;overflow-y:auto;background:#f8fafc;border-radius:8px;">
    <div style="margin-bottom:6px;color:#94a3b8;font-weight:600;">On ${dateStr}, ${from} wrote:</div>
    ${msg.body_html || (msg.body_text || '').replace(/\n/g, '<br>')}
  </div>`;
}

function placeCaretAtStart(el) {
  el.focus();
  if (window.getSelection && document.createRange) {
    const range = document.createRange();
    range.setStart(el, 0);
    range.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }
}

/* ─── Styles ─── */
const styles = {
  overlayDefault: {
    position: 'fixed',
    bottom: 0,
    right: 24,
    zIndex: 1200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  overlayExpanded: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.35)',
    backdropFilter: 'blur(4px)',
    zIndex: 1200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDefault: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderBottom: 'none',
    borderRadius: '12px 12px 0 0',
    width: '560px',
    maxWidth: '95vw',
    maxHeight: 'calc(100vh - 60px)',
    boxShadow: '0 -8px 40px -8px rgba(15,23,42,0.28)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, system-ui, sans-serif',
    overflow: 'hidden',
  },
  modalMinimized: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderBottom: 'none',
    borderRadius: '12px 12px 0 0',
    width: '560px',
    maxWidth: '95vw',
    boxShadow: '0 -8px 40px -8px rgba(15,23,42,0.28)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, system-ui, sans-serif',
    overflow: 'hidden',
  },
  modalExpanded: {
    background: '#fff',
    borderRadius: 16,
    width: '820px',
    maxWidth: '95vw',
    maxHeight: '92vh',
    boxShadow: '0 24px 80px -12px rgba(15,23,42,0.45)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, system-ui, sans-serif',
    overflow: 'hidden',
  },

  /* header */
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: 'linear-gradient(135deg, #071b3a 0%, #132242 100%)',
    flexShrink: 0,
    userSelect: 'none',
    cursor: 'default',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  headerActions: {
    display: 'flex',
    gap: 4,
  },
  hBtn: {
    background: 'rgba(255,255,255,0.12)',
    border: 'none',
    color: '#cbd5e1',
    borderRadius: 6,
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  hBtnClose: {
    background: 'rgba(239,68,68,0.25)',
    color: '#fca5a5',
  },

  /* from */
  fromRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 14px',
    borderBottom: '1px solid #f1f5f9',
    gap: 8,
    flexShrink: 0,
  },
  fromLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    width: 44,
    flexShrink: 0,
  },
  fromSelect: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 13,
    color: '#1e293b',
    fontFamily: 'Inter, system-ui, sans-serif',
    background: 'transparent',
    cursor: 'pointer',
  },

  /* recipient */
  fieldBorder: {
    borderBottom: '1px solid #f1f5f9',
    flexShrink: 0,
  },
  recipientRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 14px',
    gap: 8,
    cursor: 'text',
    minHeight: 38,
  },
  recipientLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748b',
    width: 44,
    flexShrink: 0,
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    gap: 4,
    alignItems: 'center',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#eff6ff',
    color: '#1e40af',
    border: '1px solid #bfdbfe',
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 500,
    padding: '2px 8px 2px 10px',
    gap: 4,
  },
  tagClose: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: 15,
    lineHeight: 1,
    padding: 0,
    marginLeft: 2,
    display: 'flex',
    alignItems: 'center',
  },
  tagInput: {
    border: 'none',
    outline: 'none',
    fontSize: 13,
    minWidth: 120,
    flex: 1,
    background: 'transparent',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#1e293b',
  },
  ccBccRow: {
    display: 'flex',
    gap: 8,
    paddingLeft: 58,
    paddingBottom: 4,
  },
  ccBtnLink: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '2px 0',
    textDecoration: 'underline',
  },

  /* subject */
  subjectRow: {
    borderBottom: '1px solid #f1f5f9',
    padding: '6px 14px',
    flexShrink: 0,
  },
  subjectInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: 14,
    fontWeight: 600,
    color: '#0f172a',
    fontFamily: 'Inter, system-ui, sans-serif',
    background: 'transparent',
    boxSizing: 'border-box',
  },

  /* body */
  body: {
    flex: 1,
    padding: '12px 16px',
    fontSize: 13.5,
    color: '#1e293b',
    lineHeight: 1.65,
    outline: 'none',
    overflowY: 'auto',
    fontFamily: 'Inter, system-ui, sans-serif',
  },

  /* attachments */
  attachList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    padding: '8px 14px 4px',
    borderTop: '1px solid #f8fafc',
  },
  attachChip: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: 100,
    fontSize: 11.5,
    color: '#475569',
    padding: '3px 8px 3px 10px',
    gap: 2,
  },
  attachRemove: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    fontSize: 14,
    padding: 0,
    marginLeft: 4,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
  },

  /* toolbar */
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    padding: '6px 12px',
    borderTop: '1px solid #f1f5f9',
    flexShrink: 0,
    background: '#fafbfc',
  },
  toolBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    borderRadius: 5,
    width: 28,
    height: 28,
    transition: 'all 0.1s',
  },
  toolBtnActive: {
    background: '#eff6ff',
    color: '#2563eb',
  },
  toolSep: {
    width: 1,
    height: 18,
    background: '#e2e8f0',
    margin: '0 4px',
  },

  /* footer */
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderTop: '1px solid #f1f5f9',
    flexShrink: 0,
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sendBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 18px',
    fontSize: 13.5,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.2,
    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
    transition: 'opacity 0.15s',
  },
  sendBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  draftBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: 0.2,
    transition: 'all 0.15s',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    borderRadius: 6,
    width: 32,
    height: 32,
    transition: 'background 0.1s, color 0.1s',
  },

  /* custom link modal */
  linkModalOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(15,23,42,0.4)',
    backdropFilter: 'blur(2px)',
    zIndex: 1300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  linkModalCard: {
    background: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 380,
    boxShadow: '0 20px 50px rgba(15,23,42,0.3)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  linkModalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  linkModalTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: '#0f172a',
  },
  linkModalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: 2,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
  },
  linkModalBody: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  linkFieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  linkLabel: {
    fontSize: 11.5,
    fontWeight: 600,
    color: '#64748b',
  },
  linkInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: 13,
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  linkModalActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  linkCancelBtn: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: 7,
    padding: '7px 14px',
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
  },
  linkInsertBtn: {
    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 7,
    padding: '7px 16px',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
  },
};
