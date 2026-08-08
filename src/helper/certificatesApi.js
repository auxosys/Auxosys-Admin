import { apiClient } from './apiClient';

// ── Signatures ──────────────────────────────────────────────
export async function listSignatures(activeOnly = true) {
  const { data } = await apiClient.get(`/api/certificates/signatures?active=${activeOnly}`);
  return data;
}

export async function uploadSignature({ file, name, designation, department, organization, threshold }) {
  const form = new FormData();
  form.append('file', file);
  form.append('name', name);
  form.append('designation', designation);
  if (department) form.append('department', department);
  if (organization) form.append('organization', organization);
  if (threshold != null) form.append('threshold', threshold);

  const { data } = await apiClient.post('/api/certificates/signatures', form, {
    // Axios sets multipart boundary automatically
  });
  return data;
}

export async function reprocessSignature(id, payload) {
  const { data } = await apiClient.post(`/api/certificates/signatures/${id}/reprocess`, payload);
  return data;
}

export async function deleteSignature(id) {
  const { data } = await apiClient.delete(`/api/certificates/signatures/${id}`);
  return data;
}

// ── Certificates ────────────────────────────────────────────
export async function listCertificates(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const { data } = await apiClient.get(`/api/certificates?${qs}`);
  return data;
}

export async function createCertificate(payload) {
  const { data } = await apiClient.post('/api/certificates', payload);
  return data;
}

export async function getCertificate(id) {
  const { data } = await apiClient.get(`/api/certificates/${id}`);
  return data.certificate;
}

export async function updateCertificate(id, payload) {
  const { data } = await apiClient.put(`/api/certificates/${id}`, payload);
  return data;
}

export async function revokeCertificate(id, reason) {
  const { data } = await apiClient.post(`/api/certificates/${id}/revoke`, { reason });
  return data;
}

export async function sendCertificateEmail(id) {
  const { data } = await apiClient.post(`/api/certificates/${id}/send-email`);
  return data;
}

export function downloadCertificateUrl(id) {
  return `${apiClient.defaults.baseURL}/api/certificates/${id}/download`;
}

/** Returns a live preview PNG as an object URL — caller should revokeObjectURL when done. */
export async function previewCertificate(payload) {
  const response = await apiClient.post('/api/certificates/preview', payload, {
    responseType: 'blob',
  });
  return URL.createObjectURL(response.data);
}
