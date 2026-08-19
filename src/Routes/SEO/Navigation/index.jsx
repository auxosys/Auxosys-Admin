import React, { useState, useEffect } from "react";
import { Plus, Trash2, MoveUp, MoveDown, Globe, Edit2 } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "../../../helper/apiClient";

export default function NavigationManager({ canWrite }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuType, setMenuType] = useState('header');
  const [globalSettings, setGlobalSettings] = useState(null);

  const [newLink, setNewLink] = useState({ label: '', url: '/', parent_id: null, description: '' });

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    fetchLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuType]);

  const fetchGlobalSettings = async () => {
    try {
      const res = await apiClient.get("/api/v1/seo/settings");
      setGlobalSettings(res.data.data);
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  };

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/v1/seo/navigation?type=${menuType}`);
      setLinks(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load navigation links");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (newLink.id === 'main') {
      setSaving(true);
      try {
        await apiClient.patch("/api/v1/seo/settings", { site_description: newLink.description });
        toast.success("Main link description updated");
        setNewLink({ label: '', url: '/', parent_id: null, description: '' });
        fetchGlobalSettings();
      } catch (err) {
        toast.error("Failed to update main link");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!newLink.label || !newLink.url) return toast.error("Label and URL are required");
    setSaving(true);
    try {
      const payload = {
        ...newLink,
        menu_type: menuType,
        order_index: links.length
      };
      await apiClient.post("/api/v1/seo/navigation", payload);
      toast.success("Link added");
      setNewLink({ label: '', url: '/', parent_id: null, description: '' });
      fetchLinks();
    } catch (err) {
      toast.error("Failed to add link");
    } finally {
      setSaving(false);
    }
  };

  const handleEditLink = (link) => {
    setNewLink({ id: link.id, label: link.label, url: link.url, parent_id: link.parent_id, description: link.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditMainLink = () => {
    setNewLink({ id: 'main', label: globalSettings?.site_name || 'Auxosys', url: '/', parent_id: null, description: globalSettings?.site_description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = (id) => {
    setLinkToDelete(id);
    setDeleteModalOpen(true);
  };

  const deleteLink = async () => {
    if (!linkToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/api/v1/seo/navigation/${linkToDelete}`);
      toast.success("Link deleted");
      fetchLinks();
      setDeleteModalOpen(false);
      setLinkToDelete(null);
    } catch (err) {
      toast.error("Failed to delete link");
    } finally {
      setIsDeleting(false);
    }
  };

  const moveItem = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === links.length - 1) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index + direction];
    newLinks[index + direction] = temp;

    // Update order indices
    const updatedItems = newLinks.map((item, i) => ({
      id: item.id,
      order_index: i
    }));

    setLinks(newLinks); // optimistic UI

    try {
      await apiClient.post("/api/v1/seo/navigation/reorder", { items: updatedItems });
    } catch (err) {
      toast.error("Failed to reorder");
      fetchLinks(); // revert
    }
  };

  // Group by parent
  const rootLinks = links.filter(l => !l.parent_id);
  const getChildren = (parentId) => links.filter(l => l.parent_id === parentId);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
           <div>
             <h3 className="text-sm font-semibold text-gray-800">Navigation Structure</h3>
             <p className="text-xs text-gray-500 mt-0.5">Organize links to influence Google Sitelink signals</p>
           </div>
           <div className="flex gap-2">
             <button onClick={() => setMenuType('header')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${menuType === 'header' ? 'bg-[#132242] text-white' : 'bg-gray-100 text-gray-600'}`}>Header</button>
             <button onClick={() => setMenuType('footer')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${menuType === 'footer' ? 'bg-[#132242] text-white' : 'bg-gray-100 text-gray-600'}`}>Footer</button>
           </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
             <div className="flex gap-3 items-end">
               <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Label</label>
                  <input type="text" className="input w-full" value={newLink.label} onChange={e => setNewLink({...newLink, label: e.target.value})} placeholder="e.g. Services" disabled={newLink.id === 'main'} />
               </div>
               <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">URL path</label>
                  <input type="text" className="input w-full font-mono text-sm" value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})} placeholder="/services" disabled={newLink.id === 'main'} />
               </div>
               <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Parent (Optional)</label>
                  <select className="input w-full" value={newLink.parent_id || ''} onChange={e => setNewLink({...newLink, parent_id: e.target.value ? parseInt(e.target.value) : null})} disabled={newLink.id === 'main'}>
                     <option value="">-- Top Level --</option>
                     {rootLinks.filter(r => r.id !== newLink.id).map(r => (
                       <option key={r.id} value={r.id}>{r.label}</option>
                     ))}
                  </select>
               </div>
             </div>
             <div>
               <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Short Description (Optional)</label>
               <input type="text" className="input w-full text-sm" value={newLink.description || ''} onChange={e => setNewLink({...newLink, description: e.target.value})} placeholder="Briefly describe this page for search results..." />
             </div>
             <div className="flex justify-end gap-2 mt-2">
                {newLink.id && (
                  <button onClick={() => setNewLink({ label: '', url: '/', parent_id: null, description: '' })} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors">
                     Cancel
                  </button>
                )}
                <button onClick={handleAddLink} disabled={!canWrite || saving} className="bg-[#132242] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center gap-2">
                   <Plus size={16} /> {newLink.id ? 'Save Changes' : 'Add Link'}
                </button>
             </div>
          </div>

          {loading ? (
             <div className="py-8 text-center text-sm text-gray-500">Loading structure...</div>
          ) : (
            <div className="space-y-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-50/30">
                
                {/* Main Link (Homepage) */}
                <div className="flex flex-col bg-white border-b-2 border-gray-200">
                  <div className="flex items-center justify-between p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#1a0dab]">{globalSettings?.site_name || 'Auxosys'} (Homepage)</span>
                      <span className="text-xs font-mono text-gray-400">/</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleEditMainLink} disabled={!canWrite} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded"><Edit2 size={14}/></button>
                    </div>
                  </div>
                  <div className="px-3 pb-3 pt-1 text-xs text-gray-600 line-clamp-1">
                    {globalSettings?.site_description || 'No description set'}
                  </div>
                </div>

                {rootLinks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No links in this menu.</div>
                ) : (
                 rootLinks.map((link, idx) => (
                   <div key={link.id} className="flex flex-col bg-white border-b border-gray-100 last:border-b-0">
                     <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-gray-900">{link.label}</span>
                          <span className="text-xs font-mono text-gray-400">{link.url}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditLink(link)} disabled={!canWrite} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded"><Edit2 size={14}/></button>
                          <button onClick={() => moveItem(links.indexOf(link), -1)} disabled={!canWrite} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"><MoveUp size={14}/></button>
                          <button onClick={() => moveItem(links.indexOf(link), 1)} disabled={!canWrite} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"><MoveDown size={14}/></button>
                          <button onClick={() => confirmDelete(link.id)} disabled={!canWrite} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                        </div>
                     </div>
                     {/* Children */}
                     {getChildren(link.id).length > 0 && (
                       <div className="bg-gray-50 pl-8 pr-3 py-2 space-y-1 border-t border-gray-100">
                         {getChildren(link.id).map(child => (
                           <div key={child.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                             <div className="flex items-center gap-3">
                               <span className="text-sm text-gray-700 font-medium">{child.label}</span>
                               <span className="text-xs font-mono text-gray-400">{child.url}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <button onClick={() => handleEditLink(child)} disabled={!canWrite} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded"><Edit2 size={14}/></button>
                               <button onClick={() => confirmDelete(child.id)} disabled={!canWrite} className="p-1.5 text-red-400 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 ))
               )}
            </div>
          )}
        </div>
      </div>

      {/* Sitelink Preview */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
           <h3 className="text-sm font-semibold text-gray-800">Google Search Sitelink Preview</h3>
        </div>
        <div className="p-6">
           <div className="max-w-3xl border border-gray-200 rounded-xl p-6 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Globe size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-800 font-bold mb-0.5">Auxosys</p>
                  <p className="text-[10px] text-gray-500 font-mono">https://www.auxosys.com</p>
                </div>
             </div>
             <div className="mb-5">
               <h3 className="text-xl text-[#1a0dab] font-medium hover:underline cursor-pointer mb-1">{globalSettings?.site_name || 'Auxosys'} - Enterprise Software Solutions</h3>
               <p className="text-sm text-[#4d5156] mb-4 line-clamp-2">{globalSettings?.site_description || 'Leading provider of modern SaaS platforms and enterprise tools. We build scalable systems that drive growth and automation for modern businesses.'}</p>
             </div>
             
             {/* Sitelinks Grid */}
             {rootLinks.length > 0 && (
               <div className="flex flex-col gap-y-4 pl-4 pt-2">
                 {rootLinks.map(link => {
                   const children = links.filter(l => l.parent_id === link.id);
                   return (
                     <div key={link.id}>
                       <h4 className="text-[15px] text-[#1a0dab] font-medium hover:underline cursor-pointer mb-1">{link.label}</h4>
                       <p className="text-xs text-[#4d5156] line-clamp-2">{link.description || `Access ${link.label.toLowerCase()} resources, features, and information for your business needs.`}</p>
                       {children.length > 0 && (
                         <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pl-3 border-l-2 border-gray-100">
                           {children.map(child => (
                             <span key={child.id} className="text-[13px] text-[#1a0dab] hover:underline cursor-pointer font-medium">
                               {child.label}
                             </span>
                           ))}
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
             )}
             
             {rootLinks.length === 0 && (
               <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500 border border-gray-200 border-dashed">
                 Add navigation links above to see a preview of how Google might structure your sitelinks.
               </div>
             )}
           </div>
           
           <p className="text-xs text-gray-400 mt-4 max-w-2xl">Note: This is an approximation. Google's algorithms dynamically decide whether to show sitelinks and which links to include based on user queries, site structure, and navigation hierarchies.</p>
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Link</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this link? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteLink}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
