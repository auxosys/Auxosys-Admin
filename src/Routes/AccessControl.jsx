import React, { useState, useEffect } from "react";
import { Plus, Shield, ShieldCheck, ShieldAlert, Edit2, Trash2, Eye, EyeOff } from "lucide-react";
import { apiClient } from "../helper/apiClient";
import { toast } from "react-toastify";

const MODULES = [
  { id: "contact", label: "Contact Us" },
  { id: "careers", label: "Careers" },
  { id: "newsroom", label: "Newsroom" },
  { id: "subscriptions", label: "Subscriptions" }
];

const AccessControl = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    permissions: [],
  });

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/access-control");
      setUsers(res.data.data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user = null) => {
    if (user) {
      // Handle potential legacy string array `['newsroom', 'contact']` by converting to object array
      const normalizedPermissions = (user.permissions || []).map(p => 
        typeof p === 'string' ? { module: p, access: 'Read & Write' } : p
      );

      setFormData({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "", // don't show existing password
        permissions: normalizedPermissions,
      });
    } else {
      setFormData({
        id: null,
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        permissions: [],
      });
    }
    setIsModalOpen(true);
  };

  const handlePermissionChange = (moduleId, accessLevel) => {
    setFormData((prev) => {
      // Remove existing permission object for this module if it exists
      const filtered = prev.permissions.filter(p => p.module !== moduleId);
      
      // If accessLevel is not 'None', add the new permission object
      if (accessLevel !== 'None') {
        filtered.push({ module: moduleId, access: accessLevel });
      }
      
      return { ...prev, permissions: filtered };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        // Update user permissions
        await apiClient.put(`/access-control/${formData.id}`, {
          permissions: formData.permissions,
          password: formData.password,
        });
        toast.success("User updated successfully");
      } else {
        // Create new user
        await apiClient.post("/access-control", formData);
        toast.success("User created successfully");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiClient.delete(`/access-control/${id}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed");
    }
  };

  if (loading) {
    return <div className="text-center text-gray-400 py-20">Loading access control...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8 px-6">
      <div className="flex justify-between items-start mb-8 pt-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Access Control</h1>
          <p className="text-gray-500 mt-1">Manage admin users and module permissions.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#0c55cc] hover:bg-[#0c55cc] text-white px-4 py-2 rounded-lg font-medium shadow-sm text-sm"
        >
          <Plus size={16} strokeWidth={3} />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="py-4 px-6 font-semibold text-gray-800">Admin User</th>
              <th className="py-4 px-6 font-semibold text-gray-800">Modules Allowed</th>
              <th className="py-4 px-6 font-semibold text-gray-800 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => {
              // Normalize for display just in case
              const normalized = (u.permissions || []).map(p => 
                typeof p === 'string' ? { module: p, access: 'Read & Write' } : p
              );

              return (
                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0c55cc] font-bold uppercase">
                        {u.firstName?.[0] || 'O'}{u.lastName?.[0] || 'C'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {u.email === "ausosys@gmail.com" || MODULES.every(m => normalized.some(p => p.module === m.id && p.access === "Read & Write")) ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        <ShieldCheck size={14} /> Full Access
                      </span>
                    ) : normalized.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {normalized.map((p) => {
                          const m = MODULES.find(mod => mod.id === p.module);
                          const isReadWrite = p.access === "Read & Write";
                          return (
                            <span key={p.module} className={`px-2 py-1 border text-[11px] rounded font-medium ${isReadWrite ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-100 border-gray-200 text-gray-600"}`}>
                              {m ? m.label : p.module} ({p.access})
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
                        <ShieldAlert size={14} /> No Access
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-3 text-gray-400">
                      <button onClick={() => openModal(u)} className="hover:text-blue-500 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      {u.email !== "ausosys@gmail.com" && (
                        <button onClick={() => handleDelete(u._id)} className="hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Shield size={18} className="text-blue-500" />
                {formData.id ? "Edit User Permissions" : "Add New Admin"}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {!formData.id && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                      <input required className="input" value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                      <input required className="input" value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input required type="email" className="input" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {formData.id ? "Change Password" : "Login Password"}
                  </label>
                  <div className="relative">
                    <input 
                      required={!formData.id} 
                      type={showPassword ? "text" : "password"} 
                      className="input pr-10 w-full" 
                      placeholder={formData.id ? "Leave blank to keep unchanged..." : "Communicate this securely..."} 
                      value={formData.password} 
                      onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {formData.email === "auxosys@gmail.com" ? (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-4">
                  This user is the Super Admin and inherently has full access to all modules.
                </div>
              ) : (
                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">Module Permissions</label>
                  <div className="flex flex-col gap-3 pr-2">
                    {MODULES.map(mod => {
                      const currentPerm = formData.permissions.find(p => p.module === mod.id);
                      const currentAccess = currentPerm ? currentPerm.access : 'None';
                      return (
                        <div key={mod.id} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50">
                          <span className="text-sm font-medium text-gray-700">{mod.label}</span>
                          <select 
                            value={currentAccess} 
                            onChange={(e) => handlePermissionChange(mod.id, e.target.value)}
                            className="text-sm border-gray-300 rounded-md py-1.5 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value="None">No Access</option>
                            <option value="Read">Read Only</option>
                            <option value="Read & Write">Read & Write</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              </div>

              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0c55cc] hover:bg-[#0c55cc] rounded-lg shadow-sm transition-colors">
                  {formData.id ? "Save Permissions" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;
