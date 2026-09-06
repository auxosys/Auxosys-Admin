import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  FolderPlus,
  Trash2,
  Search,
  Mail,
  FileSpreadsheet,
  Plus,
  X,
  Building,
  Briefcase,
  Phone,
  CheckCircle2,
  ListFilter,
  Folder,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  listContacts,
  createContact,
  deleteContact,
  importContactsCsv,
  listLists,
  createList,
  deleteList,
} from '../../api/mailboxApi';

export default function AudienceView() {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddContact, setShowAddContact] = useState(false);
  const [showImportCsv, setShowImportCsv] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);

  // Form states
  const [newContact, setNewContact] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company: '',
    job_title: '',
    phone: '',
  });
  const [newList, setNewList] = useState({ name: '', description: '' });
  const [, setCsvContent] = useState('');
  const [csvPreview, setCsvPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [submittingContact, setSubmittingContact] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedListId, search]);

  const loadLists = async () => {
    try {
      const res = await listLists();
      setLists(res.lists || []);
    } catch (err) {
      console.error('Failed to load lists:', err);
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await listContacts({ list_id: selectedListId || '', search });
      setContacts(res.contacts || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newList.name) return;
    try {
      await createList(newList);
      toast.success(`Mail list "${newList.name}" created!`);
      setNewList({ name: '', description: '' });
      setShowCreateList(false);
      loadLists();
    } catch (err) {
      toast.error(err.message || 'Failed to create list');
    }
  };

  const handleDeleteList = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || 'this list'}"?`)) return;
    try {
      await deleteList(id);
      toast.success('List deleted successfully');
      if (selectedListId === id) setSelectedListId(null);
      loadLists();
    } catch (err) {
      toast.error(err.message || 'Failed to delete list');
    }
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!newContact.email) {
      toast.error('Email address is required');
      return;
    }
    setSubmittingContact(true);
    try {
      await createContact({
        ...newContact,
        list_ids: selectedListId ? [selectedListId] : [],
      });
      toast.success('Contact added successfully!');
      setNewContact({ email: '', first_name: '', last_name: '', company: '', job_title: '', phone: '' });
      setShowAddContact(false);
      loadContacts();
      loadLists();
    } catch (err) {
      toast.error(err.message || 'Failed to add contact');
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleDeleteContact = async (id, email) => {
    if (!window.confirm(`Delete contact ${email || ''}?`)) return;
    try {
      await deleteContact(id);
      toast.success('Contact deleted');
      loadContacts();
      loadLists();
    } catch (err) {
      toast.error(err.message || 'Failed to delete contact');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      setCsvContent(text);
      parseCsvPreview(text);
    };
    reader.readAsText(file);
  };

  const parseCsvPreview = (text) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) return;
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''));

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/"/g, ''));
      if (cols.length === 0 || !cols[0]) continue;

      const emailIdx = headers.indexOf('email');
      const fnIdx = headers.indexOf('first_name') !== -1 ? headers.indexOf('first_name') : headers.indexOf('firstname');
      const lnIdx = headers.indexOf('last_name') !== -1 ? headers.indexOf('last_name') : headers.indexOf('lastname');
      const compIdx = headers.indexOf('company');
      const titleIdx = headers.indexOf('job_title') !== -1 ? headers.indexOf('job_title') : headers.indexOf('title');
      const phoneIdx = headers.indexOf('phone');

      const item = {
        email: cols[emailIdx !== -1 ? emailIdx : 0] || '',
        first_name: cols[fnIdx !== -1 ? fnIdx : 1] || '',
        last_name: cols[lnIdx !== -1 ? lnIdx : 2] || '',
        company: cols[compIdx !== -1 ? compIdx : 3] || '',
        job_title: cols[titleIdx !== -1 ? titleIdx : 4] || '',
        phone: cols[phoneIdx !== -1 ? phoneIdx : 5] || '',
      };
      if (item.email && item.email.includes('@')) {
        parsed.push(item);
      }
    }
    setCsvPreview(parsed);
  };

  const handleImportCsvSubmit = async () => {
    if (csvPreview.length === 0) {
      toast.error('No valid contacts parsed from CSV');
      return;
    }
    setImporting(true);
    try {
      const res = await importContactsCsv({
        contacts: csvPreview,
        list_id: selectedListId,
      });
      toast.success(`Successfully imported ${res.importedCount || csvPreview.length} contacts!`);
      setShowImportCsv(false);
      setCsvPreview([]);
      setCsvContent('');
      loadContacts();
      loadLists();
    } catch (err) {
      toast.error(err.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  const getInitials = (firstName, lastName, email) => {
    if (firstName || lastName) {
      return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'C';
  };

  const activeListName = selectedListId
    ? lists.find((l) => String(l.id) === String(selectedListId))?.name || 'Selected List'
    : 'All Contacts';

  return (
    <div style={css.container}>
      {/* ── LEFT SIDEBAR: MAIL LISTS ── */}
      <div style={css.sidebar}>
        <div style={css.sidebarHeader}>
          <div style={css.sidebarHeaderTitle}>
            <ListFilter size={18} color="#2563eb" style={{ marginRight: 8 }} />
            <h3 style={css.sidebarTitleText}>Mail Lists</h3>
          </div>
          <button
            onClick={() => setShowCreateList(true)}
            style={css.newListBtn}
            title="Create New Mail List"
          >
            <Plus size={14} style={{ marginRight: 4 }} />
            New List
          </button>
        </div>

        <div style={css.sidebarListContainer}>
          {/* ALL CONTACTS NAV ITEM */}
          <div
            onClick={() => setSelectedListId(null)}
            style={{
              ...css.sidebarListItem,
              ...(selectedListId === null ? css.sidebarListItemActive : {}),
            }}
          >
            <div style={css.sidebarListItemLeft}>
              <Users size={16} color={selectedListId === null ? '#2563eb' : '#64748b'} style={{ marginRight: 10 }} />
              <span style={css.sidebarItemName}>All Contacts</span>
            </div>
            <span style={selectedListId === null ? css.countBadgeActive : css.countBadge}>
              {contacts.length}
            </span>
          </div>

          <div style={css.sidebarDivider} />

          {/* LISTS LOOP */}
          {lists.length === 0 ? (
            <div style={css.emptyListsText}>
              <Folder size={28} color="#cbd5e1" style={{ marginBottom: 6 }} />
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>No custom lists created</p>
            </div>
          ) : (
            lists.map((list) => {
              const isSelected = selectedListId === list.id;
              return (
                <div
                  key={list.id}
                  onClick={() => setSelectedListId(list.id)}
                  style={{
                    ...css.sidebarListItem,
                    ...(isSelected ? css.sidebarListItemActive : {}),
                  }}
                >
                  <div style={css.sidebarListItemLeft}>
                    <Folder size={16} color={isSelected ? '#2563eb' : '#64748b'} style={{ marginRight: 10, flexShrink: 0 }} />
                    <span style={css.sidebarItemName} title={list.name}>
                      {list.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={isSelected ? css.countBadgeActive : css.countBadge}>
                      {list.contact_count || 0}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteList(list.id, list.name);
                      }}
                      style={css.deleteListIconBtn}
                      title="Delete List"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA: CONTACTS TABLE ── */}
      <div style={css.mainContent}>
        {/* HEADER BAR */}
        <div style={css.contentHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={css.mainTitleText}>{activeListName}</h2>
              <span style={css.totalBadge}>
                {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
              </span>
            </div>
            <p style={css.mainSubtitleText}>
              Manage your B2B contacts, job titles, companies, and audience segments.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => setShowImportCsv(true)} style={css.importCsvBtn}>
              <FileSpreadsheet size={15} style={{ marginRight: 6, color: '#0284c7' }} />
              Import CSV
            </button>
            <button onClick={() => setShowAddContact(true)} style={css.addContactBtn}>
              <UserPlus size={15} style={{ marginRight: 6 }} />
              Add Contact
            </button>
          </div>
        </div>

        {/* SEARCH & ACTIONS BAR */}
        <div style={css.toolbarContainer}>
          <div style={css.searchInputWrapper}>
            <Search size={16} color="#94a3b8" style={{ marginLeft: 12, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search contacts by name, email, company, job title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={css.searchInput}
            />
            {search && (
              <button onClick={() => setSearch('')} style={css.clearSearchBtn}>
                <X size={14} />
              </button>
            )}
          </div>

          <button onClick={loadContacts} style={css.refreshBtn} title="Refresh Contacts">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>

        {/* CONTACTS TABLE CARD */}
        <div style={css.tableCard}>
          <div style={{ overflowX: 'auto' }}>
            <table style={css.table}>
              <thead>
                <tr style={css.tableHeaderRow}>
                  <th style={css.th}>Contact Name</th>
                  <th style={css.th}>Email Address</th>
                  <th style={css.th}>Job Title / Role</th>
                  <th style={css.th}>Company</th>
                  <th style={css.th}>Status</th>
                  <th style={{ ...css.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={css.emptyCell}>
                      <div style={css.loadingStateWrap}>
                        <RefreshCw size={20} color="#3b82f6" style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
                        <span>Loading audience contacts...</span>
                      </div>
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={css.emptyCell}>
                      <div style={css.emptyStateWrap}>
                        <Users size={40} color="#cbd5e1" style={{ marginBottom: 10 }} />
                        <h4 style={{ margin: '0 0 4px', color: '#334155', fontWeight: 600 }}>No contacts found</h4>
                        <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                          {search
                            ? `No results match "${search}". Try clearing your search query.`
                            : 'Click "+ Add Contact" or "Import CSV" to start building your contact list.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => {
                    const fullName = c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : null;
                    const initials = getInitials(c.first_name, c.last_name, c.email);
                    const statusVal = (c.status || 'active').toLowerCase();
                    const isActive = statusVal === 'active' || statusVal === 'subscribed';

                    return (
                      <tr key={c.id} style={css.tableBodyRow}>
                        {/* NAME */}
                        <td style={css.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={css.avatarCircle}>{initials}</div>
                            <div>
                              <div style={css.contactNameText}>{fullName || c.email.split('@')[0]}</div>
                              {c.phone && (
                                <div style={css.contactPhoneText}>
                                  <Phone size={11} style={{ marginRight: 3, inlineSize: 11 }} />
                                  {c.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}
                        <td style={css.td}>
                          <a href={`mailto:${c.email}`} style={css.emailLink}>
                            <Mail size={13} style={{ marginRight: 6, color: '#3b82f6' }} />
                            {c.email}
                          </a>
                        </td>

                        {/* JOB TITLE */}
                        <td style={css.td}>
                          {c.job_title ? (
                            <div style={css.jobTitleBadge}>
                              <Briefcase size={12} color="#64748b" style={{ marginRight: 5 }} />
                              <span>{c.job_title}</span>
                            </div>
                          ) : (
                            <span style={css.dimText}>—</span>
                          )}
                        </td>

                        {/* COMPANY */}
                        <td style={css.td}>
                          {c.company ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#334155', fontWeight: 500 }}>
                              <Building size={13} color="#94a3b8" />
                              <span>{c.company}</span>
                            </div>
                          ) : (
                            <span style={css.dimText}>—</span>
                          )}
                        </td>

                        {/* STATUS */}
                        <td style={css.td}>
                          <div style={isActive ? css.statusPillActive : css.statusPillInactive}>
                            <span style={isActive ? css.statusDotActive : css.statusDotInactive} />
                            {isActive ? 'Active' : c.status || 'Unsubscribed'}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td style={{ ...css.td, textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteContact(c.id, c.email)}
                            style={css.deleteContactBtn}
                            title="Delete Contact"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CREATE LIST MODAL ── */}
      {showCreateList && (
        <div style={css.modalOverlay}>
          <div style={css.modalCard}>
            <div style={css.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FolderPlus size={18} color="#2563eb" />
                <h3 style={css.modalTitle}>Create Mail List</h3>
              </div>
              <button onClick={() => setShowCreateList(false)} style={css.closeModalBtn}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateList} style={css.modalForm}>
              <div style={css.formGroup}>
                <label style={css.formLabel}>List Name *</label>
                <input
                  type="text"
                  required
                  value={newList.name}
                  onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                  placeholder="e.g. Enterprise Prospects 2026"
                  style={css.formInput}
                />
              </div>

              <div style={css.formGroup}>
                <label style={css.formLabel}>Description</label>
                <input
                  type="text"
                  value={newList.description}
                  onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                  placeholder="e.g. High intent B2B leads from Q3 campaign"
                  style={css.formInput}
                />
              </div>

              <div style={css.modalActions}>
                <button type="button" onClick={() => setShowCreateList(false)} style={css.cancelModalBtn}>
                  Cancel
                </button>
                <button type="submit" style={css.submitModalBtn}>
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD CONTACT MODAL ── */}
      {showAddContact && (
        <div style={css.modalOverlay}>
          <div style={{ ...css.modalCard, maxWidth: 460 }}>
            <div style={css.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={18} color="#2563eb" />
                <h3 style={css.modalTitle}>Add New Contact</h3>
              </div>
              <button onClick={() => setShowAddContact(false)} style={css.closeModalBtn}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateContact} style={css.modalForm}>
              <div style={css.formGroup}>
                <label style={css.formLabel}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="alex.smith@company.com"
                  style={css.formInput}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={css.formGroup}>
                  <label style={css.formLabel}>First Name</label>
                  <input
                    type="text"
                    value={newContact.first_name}
                    onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                    placeholder="Alex"
                    style={css.formInput}
                  />
                </div>
                <div style={css.formGroup}>
                  <label style={css.formLabel}>Last Name</label>
                  <input
                    type="text"
                    value={newContact.last_name}
                    onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                    placeholder="Smith"
                    style={css.formInput}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={css.formGroup}>
                  <label style={css.formLabel}>Company</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="Acme Corp"
                    style={css.formInput}
                  />
                </div>
                <div style={css.formGroup}>
                  <label style={css.formLabel}>Job Title / Role</label>
                  <input
                    type="text"
                    value={newContact.job_title}
                    onChange={(e) => setNewContact({ ...newContact, job_title: e.target.value })}
                    placeholder="Engineering Lead"
                    style={css.formInput}
                  />
                </div>
              </div>

              <div style={css.formGroup}>
                <label style={css.formLabel}>Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+1 (555) 000-1234"
                  style={css.formInput}
                />
              </div>

              <div style={css.modalActions}>
                <button type="button" onClick={() => setShowAddContact(false)} style={css.cancelModalBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingContact} style={css.submitModalBtn}>
                  {submittingContact ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── IMPORT CSV MODAL ── */}
      {showImportCsv && (
        <div style={css.modalOverlay}>
          <div style={{ ...css.modalCard, maxWidth: 540 }}>
            <div style={css.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileSpreadsheet size={18} color="#0284c7" />
                <h3 style={css.modalTitle}>Import Contacts via CSV</h3>
              </div>
              <button onClick={() => setShowImportCsv(false)} style={css.closeModalBtn}>
                <X size={16} />
              </button>
            </div>

            <div style={css.modalForm}>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
                Select a <code>.csv</code> file containing columns: <code>email, first_name, last_name, company, job_title</code>.
              </p>

              <div style={css.fileDropArea}>
                <FileSpreadsheet size={32} color="#94a3b8" style={{ marginBottom: 8 }} />
                <input type="file" accept=".csv" onChange={handleFileChange} style={{ fontSize: 13, color: '#475569' }} />
              </div>

              {csvPreview.length > 0 && (
                <div style={css.csvPreviewCard}>
                  <div style={css.previewCardHeader}>
                    <span>Parsed Preview ({csvPreview.length} contacts)</span>
                    <CheckCircle2 size={15} color="#16a34a" />
                  </div>
                  <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                    <table style={css.previewTable}>
                      <thead>
                        <tr>
                          <th style={css.previewTh}>Email</th>
                          <th style={css.previewTh}>Name</th>
                          <th style={css.previewTh}>Job Title</th>
                          <th style={css.previewTh}>Company</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.slice(0, 10).map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={css.previewTd}>{row.email}</td>
                            <td style={css.previewTd}>
                              {row.first_name || row.last_name ? `${row.first_name || ''} ${row.last_name || ''}`.trim() : '—'}
                            </td>
                            <td style={css.previewTd}>{row.job_title || '—'}</td>
                            <td style={css.previewTd}>{row.company || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.length > 10 && (
                    <div style={css.moreRowsText}>+ {csvPreview.length - 10} additional contacts will be imported</div>
                  )}
                </div>
              )}

              <div style={css.modalActions}>
                <button type="button" onClick={() => setShowImportCsv(false)} style={css.cancelModalBtn}>
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={csvPreview.length === 0 || importing}
                  onClick={handleImportCsvSubmit}
                  style={csvPreview.length > 0 && !importing ? css.submitModalBtn : css.disabledModalBtn}
                >
                  {importing ? 'Importing...' : `Import ${csvPreview.length > 0 ? `${csvPreview.length} Contacts` : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STYLES (Clean Vanilla CSS Design System)
───────────────────────────────────────────────────────────── */
const css = {
  container: {
    display: 'flex',
    height: '100%',
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: '#f8fafc',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },

  /* Sidebar */
  sidebar: {
    width: '280px',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    padding: '18px 14px',
    flexShrink: 0,
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f1f5f9',
  },
  sidebarHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
  },
  sidebarTitleText: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
  },
  newListBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: 600,
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  sidebarListContainer: {
    flex: 1,
    overflowY: 'auto',
  },
  sidebarListItem: {
    padding: '9px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '4px',
    backgroundColor: 'transparent',
    color: '#475569',
    fontWeight: 500,
    fontSize: '13.5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.15s ease',
  },
  sidebarListItemActive: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    fontWeight: 600,
    boxShadow: 'inset 3px 0 0 #2563eb',
  },
  sidebarListItemLeft: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sidebarItemName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '160px',
  },
  sidebarDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '8px 0',
  },
  countBadge: {
    fontSize: '11px',
    backgroundColor: '#f1f5f9',
    padding: '2px 8px',
    borderRadius: '10px',
    color: '#64748b',
    fontWeight: 600,
  },
  countBadgeActive: {
    fontSize: '11px',
    backgroundColor: '#dbeafe',
    padding: '2px 8px',
    borderRadius: '10px',
    color: '#1d4ed8',
    fontWeight: 700,
  },
  deleteListIconBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '2px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'color 0.15s',
  },
  emptyListsText: {
    padding: '24px 12px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  /* Main Content */
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 28px',
    overflowY: 'auto',
  },
  contentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  mainTitleText: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  totalBadge: {
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  mainSubtitleText: {
    margin: '4px 0 0',
    fontSize: '13.5px',
    color: '#64748b',
  },
  importCsvBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 16px',
    fontSize: '13px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'all 0.15s',
  },
  addContactBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 16px',
    fontSize: '13px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
    transition: 'all 0.15s',
  },

  /* Toolbar */
  toolbarContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  searchInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    maxWidth: '440px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  searchInput: {
    width: '100%',
    padding: '9px 12px',
    border: 'none',
    fontSize: '13.5px',
    outline: 'none',
    color: '#0f172a',
    backgroundColor: 'transparent',
  },
  clearSearchBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
  },
  refreshBtn: {
    padding: '9px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Table Card */
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13.5px',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '12px 18px',
    color: '#64748b',
    fontSize: '11.5px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tableBodyRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.1s ease',
  },
  td: {
    padding: '14px 18px',
    verticalAlign: 'middle',
    color: '#334155',
  },
  avatarCircle: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '12px',
    flexShrink: 0,
    boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
  },
  contactNameText: {
    fontWeight: 600,
    color: '#0f172a',
    fontSize: '13.5px',
  },
  contactPhoneText: {
    fontSize: '11.5px',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px',
  },
  emailLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
  },
  jobTitleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
  },
  dimText: {
    color: '#94a3b8',
  },
  statusPillActive: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '12px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
  },
  statusDotActive: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    marginRight: '6px',
  },
  statusPillInactive: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: '12px',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
  },
  statusDotInactive: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    marginRight: '6px',
  },
  deleteContactBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    transition: 'all 0.15s',
  },
  emptyCell: {
    padding: '48px 24px',
    textAlign: 'center',
  },
  loadingStateWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#64748b',
    fontSize: '13.5px',
  },
  emptyStateWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  /* Modals */
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
    padding: '16px',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  modalTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 700,
    color: '#0f172a',
  },
  closeModalBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
  },
  modalForm: {
    padding: '20px',
  },
  formGroup: {
    marginBottom: '14px',
  },
  formLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '5px',
  },
  formInput: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13.5px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  cancelModalBtn: {
    padding: '9px 16px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  submitModalBtn: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
  },
  disabledModalBtn: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#cbd5e1',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'not-allowed',
  },
  fileDropArea: {
    border: '2px dashed #cbd5e1',
    borderRadius: '10px',
    padding: '24px 16px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  csvPreviewCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  previewCardHeader: {
    padding: '10px 14px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '12.5px',
    fontWeight: 700,
    color: '#334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  previewTh: {
    padding: '6px 10px',
    textAlign: 'left',
    color: '#64748b',
    fontWeight: 600,
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  previewTd: {
    padding: '7px 10px',
    color: '#334155',
  },
  moreRowsText: {
    padding: '8px',
    textAlign: 'center',
    fontSize: '11.5px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
  },
};
