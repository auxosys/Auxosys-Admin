import React, { useEffect, useState, useRef } from 'react';
import { Reply, ReplyAll, Forward, Mail, Clock, Paperclip, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { getMessage } from '../../api/mailboxApi';
import logoAvatar from '../../assets/logo-avatar.png';

export default function MessageView({ mailboxId, activeMailboxId, messageId, activeMessageId, selectedMessage, isSuperAdmin, onReply, onForward, onEditDraft, onDeleteDraft }) {
  const currentMailboxId = mailboxId || activeMailboxId || 'all';
  const currentMessageId = messageId || activeMessageId;

  const [message, setMessage] = useState(selectedMessage || null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const detailsRef = useRef(null);

  useEffect(() => {
    if (selectedMessage) {
      setMessage(selectedMessage);
      setShowDetails(false);
    }
  }, [selectedMessage]);

  useEffect(() => {
    if (!currentMessageId) {
      setMessage(null);
      setShowDetails(false);
      return;
    }

    if (!selectedMessage) {
      setLoading(true);
    }

    getMessage(currentMailboxId, currentMessageId)
      .then((d) => {
        const fetched = d?.message || d;
        if (fetched && !fetched.error) {
          setMessage((prev) => ({ ...(prev || {}), ...fetched }));
        }
      })
      .catch((err) => console.error('Failed to load message details:', err))
      .finally(() => setLoading(false));
  }, [currentMailboxId, currentMessageId, selectedMessage]);

  // Click outside to close details popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        setShowDetails(false);
      }
    }
    if (showDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDetails]);

  if (!currentMessageId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-white">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
          <Mail size={32} className="text-slate-400" />
        </div>
        <p className="font-bold text-slate-700 text-lg">Select a message to view</p>
        <p className="text-xs text-slate-400 mt-1">Choose any message thread from the inbox list on the left.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-10 flex items-center justify-center text-slate-400 text-sm bg-white">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading message details…</span>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex-1 p-10 text-slate-400 text-sm bg-white flex items-center justify-center">
        Message details could not be loaded.
      </div>
    );
  }

  const rawName = message.from_name || '';
  const fromAddress = message.from_address || 'unknown@domain.com';
  
  // Clean name logic
  let senderName = rawName;
  if (!senderName || senderName === fromAddress || senderName.includes('@')) {
    if (fromAddress.includes('dpritam2708')) {
      senderName = 'Pritam Das';
    } else {
      const uname = fromAddress.split('@')[0];
      senderName = uname.charAt(0).toUpperCase() + uname.slice(1);
    }
  }

  const toList = (message.to_addresses || []).map((t) => t.address || t).join(', ') || 'contact@auxosys.com';
  const mainToAddress = message.to_addresses?.[0]?.address || toList.split(',')[0].trim() || 'contact@auxosys.com';
  const recipientName = mainToAddress.split('@')[0] || 'contact';
  const isActuallyReplied = message.status === 'replied_by_admin';

  // Format Avatar (UI-Avatars / Logo)
  const renderAvatar = () => {
    const isAuxosys = fromAddress.toLowerCase().includes('@auxosys.com');
    if (isAuxosys) {
      return (
        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm p-0.5">
          <img
            src={logoAvatar}
            alt="Auxosys Logo"
            className="w-full h-full object-contain rounded-full"
            onError={(e) => {
              e.target.src = process.env.PUBLIC_URL + '/android-chrome-512.png';
            }}
          />
        </div>
      );
    }

    if (message.avatar_url) {
      return (
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
          <img
            src={message.avatar_url}
            alt={senderName}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      );
    }

    // High-Resolution UI-Avatars
    const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName || 'Lead')}&background=6366f1&color=fff&rounded=true&bold=true&size=128`;
    return (
      <div className="w-10 h-10 rounded-full bg-indigo-600 border border-indigo-700/20 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm">
        <img
          src={uiAvatarUrl}
          alt={senderName}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  };

  // Process mail body
  let bodyContent = message.body_html || message.body_text || '';
  const isPlaceholderHtml = typeof bodyContent === 'string' && bodyContent.includes('Received at ') && bodyContent.includes('From:');
  
  if (isPlaceholderHtml && message.body_text && !message.body_text.includes('Received at ')) {
    bodyContent = message.body_text;
  }

  const dateFormatted = new Date(message.received_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ', ' + new Date(message.received_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-white overflow-hidden font-sans">
      {/* ── 1. HEADER BLOCK (FIXED TOP) ── */}
      <div className="px-6 md:px-8 py-5 border-b border-slate-100 bg-white flex-shrink-0">
        {/* Subject Title */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight tracking-tight">
            {message.subject || '(No Subject)'}
          </h2>
          {isActuallyReplied && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 flex-shrink-0">
              <CheckCircle2 size={13} /> Replied
            </span>
          )}
        </div>

        {/* Sender Info Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {renderAvatar()}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">{senderName}</span>
              </div>
              
              {/* Dropdown Details Target */}
              <div className="relative inline-block" ref={detailsRef}>
                <button
                  type="button"
                  onClick={() => setShowDetails((prev) => !prev)}
                  className="text-xs text-slate-500 hover:text-slate-800 mt-0.5 flex items-center gap-1 transition rounded px-1 -ml-1 hover:bg-slate-100 cursor-pointer"
                >
                  <span>to {recipientName}</span>
                  <ChevronDown size={13} className={`text-slate-500 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                </button>

                {/* ── GMAIL-STYLE DETAILS POPOVER ── */}
                {showDetails && (
                  <div
                    className="absolute left-0 top-full mt-1.5 w-[360px] sm:w-[400px] bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-4.5 z-50 text-xs font-sans text-slate-700 animate-in fade-in zoom-in-95 duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="grid grid-cols-[85px_1fr] gap-y-2.5 gap-x-2 text-[12px] leading-snug">
                      <span className="text-right text-slate-400 font-medium">from:</span>
                      <span className="text-slate-900 font-semibold truncate">
                        {senderName} <span className="text-slate-500 font-normal">&lt;{fromAddress}&gt;</span>
                      </span>

                      <span className="text-right text-slate-400 font-medium">to:</span>
                      <span className="text-slate-900 font-medium">{toList}</span>

                      <span className="text-right text-slate-400 font-medium">date:</span>
                      <span className="text-slate-900 font-medium">{dateFormatted}</span>

                      <span className="text-right text-slate-400 font-medium">subject:</span>
                      <span className="text-slate-900 font-medium">{message.subject || '(No Subject)'}</span>

                      <span className="text-right text-slate-400 font-medium">mailed-by:</span>
                      <span className="text-slate-800 font-mono text-[11px]">auxosys.com</span>

                      <span className="text-right text-slate-400 font-medium">signed-by:</span>
                      <span className="text-slate-800 font-mono text-[11px]">gmail.com</span>

                      <span className="text-right text-slate-400 font-medium">security:</span>
                      <span className="text-slate-800 font-medium flex items-center gap-1.5">
                        <Lock size={13} className="text-slate-600 inline" /> Standard encryption (TLS)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time Badge */}
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Clock size={13} className="text-slate-400" />
            {new Date(message.received_at).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>

      {/* ── 2. EMAIL BODY CONTENT & ACTIONS (SCROLLABLE SECTION) ── */}
      <div className="px-6 md:px-8 py-5 bg-white flex-1 overflow-y-auto min-h-0 flex flex-col">
        <div>
          {message.body_html && !isPlaceholderHtml ? (
            <div
              className="prose prose-slate max-w-none text-[15px] leading-relaxed text-slate-800"
              dangerouslySetInnerHTML={{ __html: message.body_html }}
            />
          ) : (
            <div className="font-sans whitespace-pre-wrap text-[15px] text-slate-800 leading-relaxed">
              {bodyContent || message.body_text || 'No message content available.'}
            </div>
          )}

          {/* ── ATTACHMENTS ── */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip size={13} /> Attachments ({message.attachments.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {message.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition shadow-sm flex items-center gap-2"
                  >
                    <Paperclip size={12} className="text-slate-400" />
                    {att.filename}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── ACTION BUTTONS (REPLY / REPLY TO ALL / FORWARD) ── */}
        <div className="mt-6 pt-4 pb-4 border-t border-slate-100 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onReply(message)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 font-semibold rounded-full text-xs hover:bg-slate-50 hover:border-slate-400 transition shadow-sm cursor-pointer"
          >
            <Reply size={14} className="text-slate-600" />
            Reply
          </button>

          <button
            onClick={() => onReply(message)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 font-semibold rounded-full text-xs hover:bg-slate-50 hover:border-slate-400 transition shadow-sm cursor-pointer"
          >
            <ReplyAll size={14} className="text-slate-600" />
            Reply to all
          </button>

          <button
            onClick={() => onForward(message)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 font-semibold rounded-full text-xs hover:bg-slate-50 hover:border-slate-400 transition shadow-sm cursor-pointer"
          >
            <Forward size={14} className="text-slate-600" />
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}
