import React, { useEffect, useState } from 'react';
import { Reply, Forward, Mail, Clock, Paperclip } from 'lucide-react';
import { getMessage } from '../../api/mailboxApi';

export default function MessageView({ mailboxId, activeMailboxId, messageId, activeMessageId, selectedMessage, onReply, onForward }) {
  const currentMailboxId = mailboxId || activeMailboxId || 'all';
  const currentMessageId = messageId || activeMessageId;

  const [message, setMessage] = useState(selectedMessage || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedMessage) {
      setMessage(selectedMessage);
    }
  }, [selectedMessage]);

  useEffect(() => {
    if (!currentMessageId) {
      setMessage(null);
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

  if (!currentMessageId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 bg-white">
        <Mail size={48} className="text-gray-300 mb-3" />
        <p className="font-semibold text-gray-600 text-base">Select a message to read it</p>
        <p className="text-xs text-gray-400 mt-1">Choose any thread from the list on the left.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex-1 p-10 text-gray-400 text-sm bg-white">Loading message content…</div>;
  }

  if (!message) {
    return <div className="flex-1 p-10 text-gray-400 text-sm bg-white">Message could not be loaded.</div>;
  }

  const senderName = message.from_name || message.from_address || 'Sender';
  const initial = (senderName[0] || 'A').toUpperCase();
  const toList = (message.to_addresses || []).map((t) => t.address || t).join(', ');

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight">{message.subject}</h2>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 uppercase shadow-sm">
              {initial}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                {senderName}
                <span className="text-xs font-normal text-gray-500">&lt;{message.from_address}&gt;</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">To: {toList || 'Me'}</div>
            </div>
          </div>

          <div className="text-xs text-gray-400 flex items-center gap-1 font-medium flex-shrink-0">
            <Clock size={13} />
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

      {/* Action Toolbar */}
      <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
        <button
          onClick={() => onReply(message)}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg text-xs hover:bg-gray-50 transition shadow-sm"
        >
          <Reply size={14} className="text-blue-600" />
          Reply
        </button>
        <button
          onClick={() => onForward(message)}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg text-xs hover:bg-gray-50 transition shadow-sm"
        >
          <Forward size={14} className="text-gray-600" />
          Forward
        </button>
      </div>

      {/* Message Body Content */}
      <div className="p-6 flex-1 text-sm text-gray-800 leading-relaxed overflow-y-auto">
        {message.body_html ? (
          <div
            className="prose max-w-none text-sm text-gray-800"
            dangerouslySetInnerHTML={{ __html: message.body_html }}
          />
        ) : (
          <pre className="font-sans whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
            {message.body_text || 'No message content.'}
          </pre>
        )}
      </div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
            <Paperclip size={13} /> Attachments ({message.attachments.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((att, idx) => (
              <a
                key={idx}
                href={att.url || '#'}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white border rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 transition shadow-sm"
              >
                {att.filename}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
