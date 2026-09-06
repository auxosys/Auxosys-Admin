import React, { useState } from "react";
import { Eye, Edit2, Archive, ArchiveRestore, Trash2, GripVertical } from "lucide-react";
import { CLIENT_STATUSES, STATUS_COLORS, SERVICES_OFFERED } from "../../utils/clientModel.js";
import { useClientController } from "./controllers/useClientController.js";
import "./styles/ClientManagement.css";

export default function ClientManagement() {
  const ctrl = useClientController();
  const {
    clients, loading, error, toast, isEmpty,
    search, setSearch, statusFilter, setStatusFilter, showArchived, setShowArchived,
    modal, activeClient, form, formErrors, saving, deleteTarget, setDeleteTarget, confirmDelete,
    openAdd, openEdit, openView, closeModal, setField, submitForm, toggleArchive, reorderClientsList,
    hasWriteAccess, isSuperAdmin
  } = ctrl;

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...clients];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);
    reorderClientsList(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="cm-app">
      <div className="cm-header">
        <div>
          <h1>Client Management</h1>
          <p>Essential client records — contact details, status, and history.</p>
        </div>
        {hasWriteAccess && (
          <button className="cm-btn primary" onClick={openAdd}>+ Add Client</button>
        )}
      </div>

      {error && <div className="cm-error">{error}</div>}
      {toast && <div className="cm-toast">{toast}</div>}

      <div className="cm-toolbar">
        <div className="cm-search">
          <input
            type="text"
            placeholder="Search by name, contact, email, phone, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="cm-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {CLIENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {isSuperAdmin && (
          <label className="cm-toggle-label">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
            Show archived
          </label>
        )}
      </div>

      <div className="cm-table-wrap">
        {loading ? (
          <div className="cm-loading">Loading clients…</div>
        ) : isEmpty ? (
          <div className="cm-empty">
            {search || statusFilter
              ? "No clients match your search."
              : showArchived
                ? "No archived clients."
                : "No clients yet — add your first client to get started."}
          </div>
        ) : (
          <table className="cm-table">
            <thead>
              <tr>
                {hasWriteAccess && <th style={{ width: 36, textAlign: "center" }}></th>}
                <th>Client</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Location</th>
                <th>Status</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c, idx) => (
                <tr
                  key={c.id}
                  draggable={hasWriteAccess}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`${draggedIndex === idx ? "cm-row-dragging" : ""} ${dragOverIndex === idx ? "cm-row-dragover" : ""}`}
                >
                  {hasWriteAccess && (
                    <td className="cm-drag-handle" title="Drag to reorder" style={{ cursor: "grab", textAlign: "center", color: "#8B93A0" }}>
                      <GripVertical size={16} />
                    </td>
                  )}
                  <td className="cm-company">{c.companyName}</td>
                  <td>{c.contactPerson}</td>
                  <td>{c.phoneCountryCode} {c.phone}</td>
                  <td>{c.email || "—"}</td>
                  <td>{[c.city, c.state, c.country].filter(Boolean).join(", ") || "—"}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="cm-sub">{formatDate(c.createdAt)}</td>
                  <td>
                    <div className="cm-row-actions">
                      <button className="cm-btn ghost small" title="View" onClick={() => openView(c.id)}>
                        <Eye size={16} />
                      </button>
                      {hasWriteAccess && (
                        <button className="cm-btn ghost small" title="Edit" onClick={() => openEdit(c.id)}>
                          <Edit2 size={16} />
                        </button>
                      )}
                      {isSuperAdmin && (
                        <button className="cm-btn ghost small" title={c.isArchived ? "Restore" : "Archive"} onClick={() => toggleArchive(c)}>
                          {c.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                        </button>
                      )}
                      {isSuperAdmin && (
                        <button className="cm-btn ghost small" title="Delete" style={{color: '#b3261e'}} onClick={() => setDeleteTarget(c)}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(modal === "add" || modal === "edit") && hasWriteAccess && (
        <ClientFormModal
          isEdit={modal === "edit"}
          form={form}
          errors={formErrors}
          saving={saving}
          setField={setField}
          onClose={closeModal}
          onSubmit={submitForm}
        />
      )}

      {modal === "view" && activeClient && (
        <ClientViewModal client={activeClient} onClose={closeModal} onEdit={() => openEdit(activeClient.id)} hasWriteAccess={hasWriteAccess} />
      )}

      <DeleteModal target={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />
    </div>
  );
}

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: "#F1F1F1", fg: "#5A6472" };
  return <span className="cm-badge" style={{ background: c.bg, color: c.fg }}>{status}</span>;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/* ---------------------------------------------------------- */
function ClientFormModal({ isEdit, form, errors, saving, setField, onClose, onSubmit }) {
  return (
    <div className="cm-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cm-modal">
        <div className="cm-modal-header">
          <h2>{isEdit ? "Edit Client" : "Add Client"}</h2>
          <button className="cm-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="cm-modal-body">
          <div className="cm-section-label">Client Details</div>
          <div className="cm-grid2">
            <Field label="Client / Company Name" required error={errors.companyName}>
              <input value={form.companyName} onChange={(e) => setField("companyName", e.target.value)} placeholder="Acme Pvt Ltd" />
            </Field>
            <Field label="Contact Person" required error={errors.contactPerson}>
              <input value={form.contactPerson} onChange={(e) => setField("contactPerson", e.target.value)} placeholder="Rahul Sharma" />
            </Field>
          </div>
          <div className="cm-grid2">
            <Field label="Email (optional)" error={errors.email}>
              <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="rahul@acme.com" />
            </Field>
            <Field label="Phone Number" required error={errors.phone}>
              <div className="cm-phone-row">
                <input value={form.phoneCountryCode} onChange={(e) => setField("phoneCountryCode", e.target.value)} placeholder="+91" />
                <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="98765 43210" />
              </div>
            </Field>
          </div>
          <div className="cm-grid2">
            <Field label="WhatsApp Number (optional)">
              <div className="cm-phone-row">
                <input value={form.whatsappCountryCode} onChange={(e) => setField("whatsappCountryCode", e.target.value)} placeholder="+91" />
                <input value={form.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} placeholder="98765 43210" />
              </div>
            </Field>
            <Field label="Website">
              <input value={form.website} onChange={(e) => setField("website", e.target.value)} placeholder="www.acme.com" />
            </Field>
          </div>

          <div className="cm-section-label">Location</div>
          <Field label="Address">
            <textarea value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder="Street, area" />
          </Field>
          <div className="cm-grid2">
            <Field label="City">
              <input value={form.city} onChange={(e) => setField("city", e.target.value)} />
            </Field>
            <Field label="State">
              <input value={form.state} onChange={(e) => setField("state", e.target.value)} />
            </Field>
          </div>
          <Field label="Country">
            <input value={form.country} onChange={(e) => setField("country", e.target.value)} />
          </Field>

          <div className="cm-section-label">Classification</div>
          <div className="cm-grid2">
            <Field label="Industry / Business Type">
              <input value={form.industry} onChange={(e) => setField("industry", e.target.value)} placeholder="Retail, Healthcare, ..." />
            </Field>
            <Field label="Status" error={errors.status}>
              <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
                {CLIENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          {isEdit && (
            <Field label="Note about this status change (optional)">
              <input value={form.statusNote || ""} onChange={(e) => setField("statusNote", e.target.value)} placeholder="Only recorded if status changed" />
            </Field>
          )}

          <div className="cm-section-label">Services Provided / Offered</div>
          <Field label="Select Services Provided">
            <div className="cm-services-grid">
              {(SERVICES_OFFERED || []).map((srv) => {
                const isSelected = (form.services || []).includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    className={`cm-service-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      const current = form.services || [];
                      const updated = isSelected
                        ? current.filter((s) => s !== srv)
                        : [...current, srv];
                      setField("services", updated);
                    }}
                  >
                    {isSelected ? "✓ " : "+ "}{srv}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Other / Specific Service Details (optional)">
            <input
              value={form.customServices || ""}
              onChange={(e) => setField("customServices", e.target.value)}
              placeholder="e.g. AWS Cloud Migration, React Native iOS App, Custom CRM Module"
            />
          </Field>

          <div className="cm-section-label">Internal Notes</div>
          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} placeholder="Internal notes visible to the team only" />
          </Field>
        </div>
        <div className="cm-modal-footer">
          <button className="cm-btn ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="cm-btn primary" onClick={onSubmit} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Client"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div className={`cm-field ${error ? "has-error" : ""}`}>
      <label>{label} {required && <span className="req">*</span>}</label>
      {children}
      {error && <div className="err">{error}</div>}
    </div>
  );
}

/* ---------------------------------------------------------- */
function ClientViewModal({ client, onClose, onEdit, hasWriteAccess }) {
  return (
    <div className="cm-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cm-modal">
        <div className="cm-modal-header">
          <h2>{client.companyName}</h2>
          <button className="cm-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="cm-modal-body">
          <dl className="cm-view-kv">
            <dt>Contact Person</dt><dd>{client.contactPerson}</dd>
            <dt>Email</dt><dd>{client.email}</dd>
            <dt>Phone</dt><dd>{client.phoneCountryCode} {client.phone}</dd>
            {client.whatsapp && (<><dt>WhatsApp</dt><dd>{client.whatsappCountryCode} {client.whatsapp}</dd></>)}
            {client.website && (<><dt>Website</dt><dd>{client.website}</dd></>)}
            <dt>Address</dt><dd>{[client.address, client.city, client.state, client.country].filter(Boolean).join(", ") || "—"}</dd>
            {client.industry && (<><dt>Industry</dt><dd>{client.industry}</dd></>)}
            <dt>Status</dt><dd><StatusBadge status={client.status} /></dd>
            <dt>Added By</dt><dd>{client.addedBy}</dd>
            <dt>Created</dt><dd>{formatDateTime(client.createdAt)}</dd>
            <dt>Last Updated</dt><dd>{formatDateTime(client.updatedAt)}</dd>
          </dl>

          {((client.services && client.services.length > 0) || client.customServices) && (
            <>
              <div className="cm-section-label">Services Provided / Offered</div>
              <div className="cm-services-view" style={{ marginBottom: 14 }}>
                {client.services && client.services.map((srv) => (
                  <span key={srv} className="cm-service-badge">{srv}</span>
                ))}
                {client.customServices && (
                  <div style={{ fontSize: 13, color: '#5A6472', marginTop: client.services?.length ? 8 : 0, width: '100%' }}>
                    <strong>Details:</strong> {client.customServices}
                  </div>
                )}
              </div>
            </>
          )}

          {client.notes && (
            <>
              <div className="cm-section-label">Internal Notes</div>
              <p style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{client.notes}</p>
            </>
          )}

          <div className="cm-section-label">Status History</div>
          <ul className="cm-history">
            {[...(client.statusHistory || [])].reverse().map((h, i) => (
              <li key={i}>
                <span className="dot" />
                <div>
                  <div><strong>{h.status}</strong> — {h.by}</div>
                  <div className="meta">{formatDateTime(h.at)}{h.note ? ` · ${h.note}` : ""}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="cm-modal-footer">
          <button className="cm-btn ghost" onClick={onClose}>Close</button>
          {hasWriteAccess && (
            <button className="cm-btn primary" onClick={onEdit}>Edit Client</button>
          )}
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ target, onCancel, onConfirm }) {
  if (!target) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4" style={{zIndex: 9999}}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Delete client?</h3>
        <p className="text-sm text-slate-500 mb-6">
          This will permanently delete the client <strong className="text-slate-700">{target.companyName}</strong>. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
