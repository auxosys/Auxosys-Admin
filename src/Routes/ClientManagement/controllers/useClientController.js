import { useCallback, useEffect, useState } from "react";
import { emptyClient, validateClient } from "../../../utils/clientModel.js";
import { clientApi } from "../lib/api.js";
import { useAuth } from "../../../context/AuthContext.jsx";

/**
 * Placeholder for "current user" until real auth is wired in. Replace
 * this with whatever identifies the logged-in admin in your app (session,
 * JWT claim, etc.) — it's only used to stamp "Added By" and status-history
 * entries.
 */
// CURRENT_USER handled by backend using JWT

export function useClientController() {
  const { profile, hasPermission } = useAuth();
  
  const isSuperAdmin = profile?.role === "Superadmin" || profile?.email === "admin@auxosys.com" || profile?.email === "auxosys@gmail.com";
  const hasWriteAccess = isSuperAdmin || hasPermission("client_management", "Read & Write");

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [modal, setModal] = useState(null); // "add" | "edit" | "view" | null
  const [activeClient, setActiveClient] = useState(null); // full record for edit/view
  const [form, setForm] = useState(emptyClient());
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    
    // Force showArchived to false if not super admin
    let fetchArchived = showArchived;
    if (!isSuperAdmin && fetchArchived) {
      fetchArchived = false;
      setShowArchived(false); // Reset the toggle
    }

    try {
      const rows = await clientApi.list({ search, status: statusFilter, archived: fetchArchived });
      setClients(rows);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [search, statusFilter, showArchived, isSuperAdmin]);

  useEffect(() => { refresh(); }, [refresh]);

  function flashToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  function openAdd() {
    setForm(emptyClient());
    setFormErrors({});
    setActiveClient(null);
    setModal("add");
  }

  async function openEdit(id) {
    setError("");
    try {
      const record = await clientApi.get(id);
      setActiveClient(record);
      setForm({ ...emptyClient(), ...record });
      setFormErrors({});
      setModal("edit");
    } catch (e) { setError(e.message); }
  }

  async function openView(id) {
    setError("");
    try {
      const record = await clientApi.get(id);
      setActiveClient(record);
      setModal("view");
    } catch (e) { setError(e.message); }
  }

  function closeModal() {
    setModal(null);
    setActiveClient(null);
    setFormErrors({});
  }

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submitForm() {
    const errors = validateClient(form);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setSaving(true); setError("");
    try {
      if (modal === "edit" && activeClient) {
        await clientApi.update(activeClient.id, form);
        flashToast("Client updated.");
      } else {
        await clientApi.create(form);
        flashToast("Client added.");
      }
      closeModal();
      await refresh();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  async function toggleArchive(client) {
    setError("");
    try {
      if (client.isArchived) await clientApi.unarchive(client.id);
      else await clientApi.archive(client.id);
      flashToast(client.isArchived ? "Client restored." : "Client archived.");
      await refresh();
    } catch (e) { setError(e.message); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setError("");
    try {
      await clientApi.delete(deleteTarget.id);
      flashToast("Client permanently deleted.");
      setDeleteTarget(null);
      await refresh();
    } catch (e) { setError(e.message); }
  }

  async function reorderClientsList(newOrderedClients) {
    setClients(newOrderedClients);
    try {
      const orderedIds = newOrderedClients.map(c => c.id);
      await clientApi.reorder(orderedIds);
      flashToast("Client order saved.");
    } catch (e) {
      setError(e.message || "Failed to save order");
    }
  }

  const isEmpty = !loading && clients.length === 0;

  return {
    clients, setClients, loading, error, toast, isEmpty,
    search, setSearch, statusFilter, setStatusFilter, showArchived, setShowArchived,
    modal, activeClient, form, formErrors, saving, deleteTarget, setDeleteTarget, confirmDelete,
    openAdd, openEdit, openView, closeModal, setField, submitForm, toggleArchive, reorderClientsList,
    hasWriteAccess, isSuperAdmin
  };
}
