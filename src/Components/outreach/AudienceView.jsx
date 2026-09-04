import React, { useState, useEffect } from 'react';
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
  const [newContact, setNewContact] = useState({ email: '', first_name: '', last_name: '', company: '', job_title: '' });
  const [newList, setNewList] = useState({ name: '', description: '' });
  const [csvContent, setCsvContent] = useState('');
  const [csvPreview, setCsvPreview] = useState([]);

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    loadContacts();
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
      setNewList({ name: '', description: '' });
      setShowCreateList(false);
      loadLists();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteList = async (id) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;
    try {
      await deleteList(id);
      if (selectedListId === id) setSelectedListId(null);
      loadLists();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    if (!newContact.email) return;
    try {
      await createContact({
        ...newContact,
        list_ids: selectedListId ? [selectedListId] : [],
      });
      setNewContact({ email: '', first_name: '', last_name: '', company: '', job_title: '' });
      setShowAddContact(false);
      loadContacts();
      loadLists();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await deleteContact(id);
      loadContacts();
      loadLists();
    } catch (err) {
      alert(err.message);
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
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length <= 1) return;
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    
    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
      if (cols.length === 0 || !cols[0]) continue;
      
      const item = {
        email: cols[headers.indexOf('email')] || cols[0] || '',
        first_name: cols[headers.indexOf('first_name')] || cols[headers.indexOf('firstname')] || cols[1] || '',
        last_name: cols[headers.indexOf('last_name')] || cols[headers.indexOf('lastname')] || cols[2] || '',
        company: cols[headers.indexOf('company')] || cols[3] || '',
      };
      if (item.email && item.email.includes('@')) {
        parsed.push(item);
      }
    }
    setCsvPreview(parsed);
  };

  const handleImportCsvSubmit = async () => {
    if (csvPreview.length === 0) {
      alert('No valid contacts parsed from CSV');
      return;
    }
    try {
      const res = await importContactsCsv({
        contacts: csvPreview,
        list_id: selectedListId,
      });
      alert(`Successfully imported ${res.importedCount} contacts!`);
      setShowImportCsv(false);
      setCsvPreview([]);
      setCsvContent('');
      loadContacts();
      loadLists();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* LEFT SIDEBAR: MAIL LISTS */}
      <div style={{ width: '280px', borderRight: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Mail Lists</h3>
          <button
            onClick={() => setShowCreateList(true)}
            style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 500 }}
          >
            + New List
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div
            onClick={() => setSelectedListId(null)}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '6px',
              backgroundColor: selectedListId === null ? '#eff6ff' : 'transparent',
              color: selectedListId === null ? '#2563eb' : '#475569',
              fontWeight: selectedListId === null ? 600 : 400,
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>All Contacts</span>
          </div>

          {lists.map(list => (
            <div
              key={list.id}
              onClick={() => setSelectedListId(list.id)}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '6px',
                backgroundColor: selectedListId === list.id ? '#eff6ff' : 'transparent',
                color: selectedListId === list.id ? '#2563eb' : '#475569',
                fontWeight: selectedListId === list.id ? 600 : 400,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                {list.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '10px', color: '#475569' }}>
                  {list.contact_count || 0}
                </span>
                <span
                  onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                  style={{ color: '#ef4444', fontSize: '14px', cursor: 'pointer', opacity: 0.7 }}
                  title="Delete List"
                >
                  ×
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA: CONTACTS TABLE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#0f172a' }}>
              {selectedListId ? lists.find(l => l.id === selectedListId)?.name || 'Audience' : 'All Contacts'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Manage your B2B contacts and lead lists.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowImportCsv(true)}
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#334155', cursor: 'pointer', fontWeight: 500 }}
            >
              📥 Import CSV
            </button>
            <button
              onClick={() => setShowAddContact(true)}
              style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 500 }}
            >
              + Add Contact
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search contacts by name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* TABLE */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Company</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading contacts...</td></tr>
              ) : contacts.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No contacts found. Click "Add Contact" or "Import CSV" to get started.</td></tr>
              ) : (
                contacts.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}` : '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#2563eb' }}>{c.email}</td>
                    <td style={{ padding: '12px 16px' }}>{c.company || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', backgroundColor: c.status === 'active' ? '#dcfce7' : '#fee2e2', color: c.status === 'active' ? '#166534' : '#991b1b', fontWeight: 500 }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE LIST MODAL */}
      {showCreateList && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateList} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '380px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#0f172a' }}>Create Mail List</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>List Name</label>
              <input
                type="text"
                required
                value={newList.name}
                onChange={e => setNewList({ ...newList, name: e.target.value })}
                placeholder="e.g. Enterprise Leads Q3"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Description</label>
              <input
                type="text"
                value={newList.description}
                onChange={e => setNewList({ ...newList, description: e.target.value })}
                placeholder="Optional notes"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowCreateList(false)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff' }}>Create List</button>
            </div>
          </form>
        </div>
      )}

      {/* ADD CONTACT MODAL */}
      {showAddContact && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleCreateContact} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '420px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#0f172a' }}>Add Contact</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Email Address *</label>
              <input
                type="email"
                required
                value={newContact.email}
                onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                placeholder="alex@company.com"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>First Name</label>
                <input
                  type="text"
                  value={newContact.first_name}
                  onChange={e => setNewContact({ ...newContact, first_name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Last Name</label>
                <input
                  type="text"
                  value={newContact.last_name}
                  onChange={e => setNewContact({ ...newContact, last_name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Company</label>
              <input
                type="text"
                value={newContact.company}
                onChange={e => setNewContact({ ...newContact, company: e.target.value })}
                placeholder="Acme Corp"
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowAddContact(false)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff' }}>Save Contact</button>
            </div>
          </form>
        </div>
      )}

      {/* IMPORT CSV MODAL */}
      {showImportCsv && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#0f172a' }}>Import Contacts via CSV</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
              Upload a .csv file containing columns: <code>email, first_name, last_name, company</code>.
            </p>

            <input type="file" accept=".csv" onChange={handleFileChange} style={{ marginBottom: '16px' }} />

            {csvPreview.length > 0 && (
              <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '16px', maxHeight: '200px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '6px 10px' }}>Email</th>
                      <th style={{ padding: '6px 10px' }}>First Name</th>
                      <th style={{ padding: '6px 10px' }}>Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.slice(0, 10).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 10px' }}>{row.email}</td>
                        <td style={{ padding: '6px 10px' }}>{row.first_name || '—'}</td>
                        <td style={{ padding: '6px 10px' }}>{row.company || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvPreview.length > 10 && (
                  <div style={{ padding: '6px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                    + {csvPreview.length - 10} more rows
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowImportCsv(false)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}>Cancel</button>
              <button
                type="button"
                disabled={csvPreview.length === 0}
                onClick={handleImportCsvSubmit}
                style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', background: csvPreview.length > 0 ? '#2563eb' : '#94a3b8', color: '#fff', cursor: csvPreview.length > 0 ? 'pointer' : 'not-allowed' }}
              >
                Import {csvPreview.length > 0 ? `${csvPreview.length} Contacts` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
