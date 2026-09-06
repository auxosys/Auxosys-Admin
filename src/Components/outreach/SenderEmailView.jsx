import React, { useState, useEffect } from 'react';
import { Mail, Plus, RefreshCw, Shield, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import {
  listSenderEmails,
  createSenderEmail,
  deleteSenderEmail,
  syncBrevoSenders,
  assignUserSenderPermission,
  revokeUserSenderPermission,
  getUserSenderPermissions
} from '../../api/mailboxApi';
import { apiClient } from '../../helper/apiClient';

export default function SenderEmailView() {
  const { profile } = useAuth();
  const isSuperAdmin = profile && (
    profile.role === 'Superadmin' ||
    profile.email === 'admin@auxosys.com' ||
    profile.email === 'auxosys@gmail.com'
  );

  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [selectedSender, setSelectedSender] = useState(null);

  // Form State for Sender Email
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'General Outreach',
    reply_to_email: '',
    status: 'active',
  });

  // User Permissions Management State
  const [allUsers, setAllUsers] = useState([]);
  const [userPermsMap, setUserPermsMap] = useState({});

  useEffect(() => {
    fetchSenders();
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  const fetchSenders = async () => {
    try {
      setLoading(true);
      const res = await listSenderEmails();
      setSenders(res.senders || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch sender emails');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/access-control');
      setAllUsers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch admin users for permission assignment:', err);
    }
  };

  const handleSyncBrevo = async () => {
    try {
      setSyncing(true);
      const res = await syncBrevoSenders();
      const msg = res.message || `Updated ${res.synced || 0} senders from Brevo.`;
      toast.success(msg);
      fetchSenders();
    } catch (err) {
      toast.error(err.message || 'Brevo sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateSender = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email) {
        toast.error('Sender name and email are required');
        return;
      }
      await createSenderEmail(formData);
      toast.success('Company sender email registered successfully');
      setShowAddModal(false);
      setFormData({ name: '', email: '', department: 'General Outreach', reply_to_email: '', status: 'active' });
      fetchSenders();
    } catch (err) {
      toast.error(err.message || 'Failed to create sender email');
    }
  };

  const handleDeleteSender = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete sender email ${email}?`)) return;
    try {
      await deleteSenderEmail(id);
      toast.success('Sender email deleted');
      fetchSenders();
    } catch (err) {
      toast.error(err.message || 'Failed to delete sender email');
    }
  };

  const openPermissionModal = async (sender) => {
    setSelectedSender(sender);
    setShowPermModal(true);
    // Fetch current permissions across users
    try {
      const newPerms = {};
      for (const u of allUsers) {
        const res = await getUserSenderPermissions(u._id);
        const hasPerm = (res.permissions || []).some(p => p.sender_email_id === sender.id);
        newPerms[u._id] = hasPerm;
      }
      setUserPermsMap(newPerms);
    } catch (err) {
      console.error('Failed to fetch user permissions:', err);
    }
  };

  const toggleUserPermission = async (userId, senderId) => {
    const current = !!userPermsMap[userId];
    try {
      if (current) {
        await revokeUserSenderPermission({ user_id: userId, sender_email_id: senderId });
        setUserPermsMap(prev => ({ ...prev, [userId]: false }));
        toast.info('Revoked sender permission for user');
      } else {
        await assignUserSenderPermission({ user_id: userId, sender_email_id: senderId });
        setUserPermsMap(prev => ({ ...prev, [userId]: true }));
        toast.success('Assigned sender permission to user');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update permission');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading sender email infrastructure...</div>;
  }

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center text-gray-600 max-w-md mx-auto my-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <Shield size={42} className="mx-auto text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-1">Access Restricted</h2>
        <p className="text-sm text-gray-500">Managing company sender email accounts is restricted to Super Admin users only.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto w-full pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="text-blue-600" size={26} />
            Company Sender Emails
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Centralized Brevo email infrastructure. Assign company senders (@auxosys.com) to admin users.
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncBrevo}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm text-sm"
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin text-blue-600' : ''} />
              {syncing ? 'Syncing...' : 'Sync Brevo Senders'}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#132242] text-white font-medium rounded-lg hover:bg-[#071b3a] transition shadow-sm text-sm"
            >
              <Plus size={18} />
              Add Sender Email
            </button>
          </div>
        )}
      </div>

      {/* Senders Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3.5 px-5 font-semibold text-gray-700">Sender Profile</th>
              <th className="py-3.5 px-5 font-semibold text-gray-700">Department</th>
              <th className="py-3.5 px-5 font-semibold text-gray-700">Default Reply-To</th>
              <th className="py-3.5 px-5 font-semibold text-gray-700">Brevo Status</th>
              <th className="py-3.5 px-5 font-semibold text-gray-700">System Status</th>
              {isSuperAdmin && <th className="py-3.5 px-5 font-semibold text-gray-700 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {senders.length === 0 ? (
              <tr>
                <td colSpan={isSuperAdmin ? 6 : 5} className="py-12 text-center text-gray-500">
                  <Mail size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="font-medium text-gray-700">No company sender emails configured yet.</p>
                  {isSuperAdmin && <p className="text-xs text-gray-400 mt-1">Click "Add Sender Email" or "Sync Brevo Senders" above.</p>}
                </td>
              </tr>
            ) : (
              senders.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/70 transition">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xs uppercase">
                        {s.name?.[0] || 'A'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-medium text-gray-700">
                    {s.department || 'General'}
                  </td>
                  <td className="py-4 px-5 text-gray-600 text-xs">
                    {s.reply_to_email || s.email}
                  </td>
                  <td className="py-4 px-5">
                    {s.is_verified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle size={13} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle size={13} /> Unverified / Pending
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  {isSuperAdmin && (
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openPermissionModal(s)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition"
                          title="Manage User Access"
                        >
                          <Shield size={13} /> Access
                        </button>

                        <button
                          onClick={() => handleDeleteSender(s.id, s.email)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                          title="Delete Sender"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD SENDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Register Company Sender Email</h2>
            <form onSubmit={handleCreateSender} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sender Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auxosys Careers"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sender Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. careers@auxosys.com"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Human Resources / Sales"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Default Reply-To Email</label>
                <input
                  type="email"
                  placeholder="e.g. hr-reply@auxosys.com"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.reply_to_email}
                  onChange={(e) => setFormData({ ...formData, reply_to_email: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#132242] text-white text-sm font-medium rounded-lg hover:bg-[#071b3a]"
                >
                  Save Sender Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER PERMISSION MODAL */}
      {showPermModal && selectedSender && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Assign User Sending Rights</h2>
            <p className="text-xs text-gray-500 mb-4">
              Control which admin users are permitted to send campaign emails from <span className="font-semibold text-gray-800">{selectedSender.email}</span>.
            </p>

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 border rounded-lg">
              {allUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">No admin users found.</div>
              ) : (
                allUsers.map((u) => {
                  const isUserPermitted = !!userPermsMap[u._id];
                  const isSuper = u.email === 'admin@auxosys.com' || u.email === 'auxosys@gmail.com';
                  return (
                    <div key={u._id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                      {isSuper ? (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                          Super Admin (Full Access)
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleUserPermission(u._id, selectedSender.id)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                            isUserPermitted
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {isUserPermitted ? 'Permitted ✓' : 'Grant Access'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
              <button
                type="button"
                onClick={() => setShowPermModal(false)}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
