const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_BASE_URL || (isLocal ? 'http://localhost:5002' : 'https://auxosys-backend.onrender.com');

function authHeaders() {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('auxosys_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ── Mailboxes ────────────────────────────────────────────
export async function listMailboxes() {
  const res = await fetch(`${API_BASE}/api/mailboxes`, { headers: authHeaders() });
  return handle(res);
}

export function getGoogleConnectUrl() {
  return `${API_BASE}/api/mailboxes/oauth/start`;
}

export async function connectAppPassword(payload) {
  const res = await fetch(`${API_BASE}/api/mailboxes/connect-app-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function disconnectMailbox(id) {
  const res = await fetch(`${API_BASE}/api/mailboxes/${id}`, { method: 'DELETE', headers: authHeaders() });
  return handle(res);
}

export async function getFolders(mailboxId) {
  const res = await fetch(`${API_BASE}/api/mailboxes/${mailboxId}/folders`, { headers: authHeaders() });
  return handle(res);
}

// ── Messages ─────────────────────────────────────────────
export async function listMessages(mailboxId, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/mailboxes/${mailboxId}/messages?${qs}`, { headers: authHeaders() });
  return handle(res);
}

export async function syncFolder(mailboxId, folder = 'INBOX') {
  const res = await fetch(`${API_BASE}/api/mailboxes/${mailboxId}/sync?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handle(res);
}

export async function getMessage(mailboxId, messageId) {
  const res = await fetch(`${API_BASE}/api/mailboxes/${mailboxId}/messages/${messageId}`, { headers: authHeaders() });
  return handle(res);
}

export async function updateMessageFlags(mailboxId, messageId, flags) {
  const res = await fetch(`${API_BASE}/api/mailboxes/${mailboxId}/messages/${messageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(flags),
  });
  return handle(res);
}

export async function moveMessage(mailboxId, messageId, toFolder) {
  const res = await fetch(`${API_BASE}/api/mailboxes/${mailboxId}/messages/${messageId}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ toFolder }),
  });
  return handle(res);
}

export function attachmentUrl(mailboxId, messageId, attachmentId) {
  return `${API_BASE}/api/mailboxes/${mailboxId}/messages/${messageId}/attachments/${attachmentId}`;
}

// ── Compose ──────────────────────────────────────────────
export async function sendMessage(mailboxId, { to, cc, bcc, subject, html, text, inReplyToMessageId, files }) {
  const form = new FormData();
  form.append('to', to);
  if (cc) form.append('cc', cc);
  if (bcc) form.append('bcc', bcc);
  form.append('subject', subject);
  form.append('html', html);
  if (text) form.append('text', text);
  if (inReplyToMessageId) form.append('inReplyToMessageId', inReplyToMessageId);
  (files || []).forEach((f) => form.append('attachments', f));

  const res = await fetch(`${API_BASE}/api/mailboxes/${mailboxId}/send`, {
    method: 'POST',
    headers: authHeaders(), // no Content-Type — browser sets multipart boundary
    body: form,
  });
  return handle(res);
}

// ── Outreach & Audience ─────────────────────────────────────
export async function listContacts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/outreach/contacts?${qs}`, { headers: authHeaders() });
  return handle(res);
}

export async function createContact(payload) {
  const res = await fetch(`${API_BASE}/api/outreach/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function importContactsCsv(payload) {
  const res = await fetch(`${API_BASE}/api/outreach/contacts/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function deleteContact(id) {
  const res = await fetch(`${API_BASE}/api/outreach/contacts/${id}`, { method: 'DELETE', headers: authHeaders() });
  return handle(res);
}

export async function listLists() {
  const res = await fetch(`${API_BASE}/api/outreach/lists`, { headers: authHeaders() });
  return handle(res);
}

export async function createList(payload) {
  const res = await fetch(`${API_BASE}/api/outreach/lists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function deleteList(id) {
  const res = await fetch(`${API_BASE}/api/outreach/lists/${id}`, { method: 'DELETE', headers: authHeaders() });
  return handle(res);
}

export async function listTemplates() {
  const res = await fetch(`${API_BASE}/api/outreach/templates`, { headers: authHeaders() });
  return handle(res);
}

export async function createTemplate(payload) {
  const res = await fetch(`${API_BASE}/api/outreach/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function deleteTemplate(id) {
  const res = await fetch(`${API_BASE}/api/outreach/templates/${id}`, { method: 'DELETE', headers: authHeaders() });
  return handle(res);
}

export async function listCampaigns() {
  const res = await fetch(`${API_BASE}/api/outreach/campaigns`, { headers: authHeaders() });
  return handle(res);
}

export async function createCampaign(payload) {
  const res = await fetch(`${API_BASE}/api/outreach/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function launchCampaign(id) {
  const res = await fetch(`${API_BASE}/api/outreach/campaigns/${id}/launch`, { method: 'POST', headers: authHeaders() });
  return handle(res);
}

export async function pauseCampaign(id) {
  const res = await fetch(`${API_BASE}/api/outreach/campaigns/${id}/pause`, { method: 'POST', headers: authHeaders() });
  return handle(res);
}

export async function deleteCampaign(id) {
  const res = await fetch(`${API_BASE}/api/outreach/campaigns/${id}`, { method: 'DELETE', headers: authHeaders() });
  return handle(res);
}

export async function getOutreachStats() {
  const res = await fetch(`${API_BASE}/api/outreach/stats`, { headers: authHeaders() });
  return handle(res);
}

// ── Central Brevo Sender Infrastructure & Permissions ──────
export async function listSenderEmails() {
  const res = await fetch(`${API_BASE}/api/outreach/senders`, { headers: authHeaders() });
  return handle(res);
}

export async function createSenderEmail(payload) {
  const res = await fetch(`${API_BASE}/api/outreach/senders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function updateSenderEmail(id, payload) {
  const res = await fetch(`${API_BASE}/api/outreach/senders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function deleteSenderEmail(id) {
  const res = await fetch(`${API_BASE}/api/outreach/senders/${id}`, { method: 'DELETE', headers: authHeaders() });
  return handle(res);
}

export async function syncBrevoSenders() {
  const res = await fetch(`${API_BASE}/api/outreach/senders/sync`, { method: 'POST', headers: authHeaders() });
  return handle(res);
}

export async function getUserSenderPermissions(userId) {
  const res = await fetch(`${API_BASE}/api/outreach/permissions/${userId}`, { headers: authHeaders() });
  return handle(res);
}

export async function assignUserSenderPermission(payload) {
  const res = await fetch(`${API_BASE}/api/outreach/permissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function revokeUserSenderPermission(payload) {
  const res = await fetch(`${API_BASE}/api/outreach/permissions`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function listSuppressions() {
  const res = await fetch(`${API_BASE}/api/outreach/suppressions`, { headers: authHeaders() });
  return handle(res);
}

export async function listEmailActivity(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/outreach/activity?${qs}`, { headers: authHeaders() });
  return handle(res);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result || '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve({
        name: file.name,
        content: base64,
        contentType: file.type || 'application/octet-stream'
      });
    };
    reader.onerror = (err) => reject(err);
  });
}

// ── Direct Outreach Email (Brevo-powered, no mailbox required) ────────────
export async function saveDraft(payload) {
  const isUpdate = !!payload.draftId;
  const url = isUpdate ? `${API_BASE}/api/outreach/drafts/${payload.draftId}` : `${API_BASE}/api/outreach/drafts`;
  const res = await fetch(url, {
    method: isUpdate ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function deleteDraft(draftId) {
  const res = await fetch(`${API_BASE}/api/outreach/drafts/${draftId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handle(res);
}

export async function sendDirectEmail({ senderEmailId, to, cc, bcc, subject, html, text, files }) {
  let attachments = [];
  if (Array.isArray(files) && files.length > 0) {
    attachments = await Promise.all(files.map(fileToBase64));
  }

  const res = await fetch(`${API_BASE}/api/outreach/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      senderEmailId,
      to: Array.isArray(to) ? to.join(',') : to,
      cc: Array.isArray(cc) ? cc.join(',') : cc,
      bcc: Array.isArray(bcc) ? bcc.join(',') : bcc,
      subject,
      html: html || '',
      text,
      attachments,
    }),
  });
  return handle(res);
}

