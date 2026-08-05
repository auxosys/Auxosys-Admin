import React, { useState } from 'react';
import { Settings, Save, Server, Eye, CheckCircle2 } from 'lucide-react';

const CookieManagement = () => {
  const [activeTab, setActiveTab] = useState('scripts');
  const [saving, setSaving] = useState(false);

  // Mock state for the UI (In a real app, this would be fetched from API/Supabase)
  const [scripts, setScripts] = useState([
    { id: 1, name: 'Google Analytics 4', category: 'Analytics', provider: 'Google', enabled: true },
    { id: 2, name: 'Google Tag Manager', category: 'Necessary', provider: 'Google', enabled: true },
    { id: 3, name: 'Meta Pixel', category: 'Marketing', provider: 'Meta', enabled: false },
    { id: 4, name: 'Microsoft Clarity', category: 'Analytics', provider: 'Microsoft', enabled: true },
    { id: 5, name: 'LinkedIn Insight', category: 'Marketing', provider: 'LinkedIn', enabled: false }
  ]);

  const [bannerConfig, setBannerConfig] = useState({
    theme: 'light',
    position: 'bottom',
    expiry: 180,
    status: 'Publish'
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 800);
  };

  const toggleScript = (id) => {
    setScripts(scripts.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cookie Management</h1>
          <p className="text-gray-500">Configure banner settings, script injection, and cookie inventory.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[#0fb5a6] text-white rounded-lg hover:bg-teal-600 transition-colors shadow-sm font-medium flex items-center gap-2"
        >
          {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('scripts')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'scripts' ? 'border-[#0fb5a6] text-[#0fb5a6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Server size={18}/> Script Manager
        </button>
        <button 
          onClick={() => setActiveTab('banner')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'banner' ? 'border-[#0fb5a6] text-[#0fb5a6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Eye size={18}/> Banner Display Rules
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'inventory' ? 'border-[#0fb5a6] text-[#0fb5a6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Settings size={18}/> Manual Inventory
        </button>
      </div>

      {/* Script Manager Tab */}
      {activeTab === 'scripts' && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2">3rd-Party Scripts</h2>
          <p className="text-gray-500 text-sm mb-6">These scripts will be automatically injected into the website frontend only if the visitor consents to the corresponding category.</p>
          
          <div className="space-y-4">
            {scripts.map(script => (
              <div key={script.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-semibold text-gray-900">{script.name}</h3>
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="text-gray-500">Provider: <span className="font-medium text-gray-700">{script.provider}</span></span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500">Category: <span className="font-medium text-gray-700">{script.category}</span></span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleScript(script.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${script.enabled ? 'bg-[#0fb5a6]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${script.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banner Settings Tab */}
      {activeTab === 'banner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Configuration</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Position</label>
              <select 
                value={bannerConfig.position}
                onChange={(e) => setBannerConfig({...bannerConfig, position: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0fb5a6] focus:ring-[#0fb5a6] p-2 border"
              >
                <option value="bottom">Bottom Full Width</option>
                <option value="bottom-left">Bottom Left Floating</option>
                <option value="bottom-right">Bottom Right Floating</option>
                <option value="center">Center Modal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select 
                value={bannerConfig.theme}
                onChange={(e) => setBannerConfig({...bannerConfig, theme: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0fb5a6] focus:ring-[#0fb5a6] p-2 border"
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="auto">Auto (System Default)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consent Expiry (Days)</label>
              <input 
                type="number"
                value={bannerConfig.expiry}
                onChange={(e) => setBannerConfig({...bannerConfig, expiry: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0fb5a6] focus:ring-[#0fb5a6] p-2 border"
              />
              <p className="text-xs text-gray-500 mt-1">Visitors will be asked to consent again after this period.</p>
            </div>

            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-1">Publish Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="status" value="Draft" checked={bannerConfig.status === 'Draft'} onChange={(e) => setBannerConfig({...bannerConfig, status: e.target.value})} /> Draft
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="status" value="Publish" checked={bannerConfig.status === 'Publish'} onChange={(e) => setBannerConfig({...bannerConfig, status: e.target.value})} /> Publish Live
                </label>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-gray-100 rounded-xl border p-6 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              Live Preview 
              <span className="text-xs font-normal text-[#0fb5a6] bg-teal-50 px-2 py-1 rounded">Desktop View</span>
            </h3>
            
            <div className="flex-grow flex items-end justify-center">
              {/* Mock Banner */}
              <div className={`w-full max-w-md bg-white border shadow-xl rounded-xl p-5 ${bannerConfig.theme === 'dark' ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900'}`}>
                <h4 className="font-bold text-lg mb-2">We value your privacy</h4>
                <p className={`text-sm mb-4 ${bannerConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic.
                </p>
                <div className="flex flex-col gap-2">
                  <button className="w-full bg-[#0fb5a6] text-white py-2 rounded-lg font-medium text-sm">Accept All</button>
                  <button className={`w-full py-2 rounded-lg font-medium text-sm border ${bannerConfig.theme === 'dark' ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>Customize Preferences</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border shadow-sm p-6 text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 text-[#0fb5a6] rounded-full mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Manual Cookie Inventory</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">Database connected. The inventory is currently managed directly via the Supabase <code>cookie_inventory</code> table to ensure high structural integrity.</p>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Open Supabase Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default CookieManagement;
