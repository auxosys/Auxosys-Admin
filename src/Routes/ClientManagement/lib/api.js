import { apiClient } from "../../../helper/apiClient";

function qs(params) {
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null));
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : "";
}

async function handleRequest(requestPromise) {
  try {
    const response = await requestPromise;
    return response.data;
  } catch (error) {
    const detail = error.response?.data?.error || error.response?.data?.message || Object.values(error.response?.data?.errors || {}).join(", ");
    throw new Error(detail || `Request failed: ${error.message}`);
  }
}

export const clientApi = {
  list: (params = {}) => handleRequest(apiClient.get(`/api/clients${qs(params)}`)),
  get: (id) => handleRequest(apiClient.get(`/api/clients/${id}`)),
  create: (payload) => handleRequest(apiClient.post("/api/clients", payload)),
  update: (id, payload) => handleRequest(apiClient.put(`/api/clients/${id}`, payload)),
  reorder: (orderedIds) => handleRequest(apiClient.post("/api/clients/reorder", { orderedIds })),
  archive: (id) => handleRequest(apiClient.patch(`/api/clients/${id}/archive`)),
  unarchive: (id) => handleRequest(apiClient.patch(`/api/clients/${id}/unarchive`)),
  delete: (id) => handleRequest(apiClient.delete(`/api/clients/${id}`)),
};
