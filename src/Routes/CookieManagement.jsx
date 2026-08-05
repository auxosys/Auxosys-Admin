import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Settings, Save, Server, Eye, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CookieManagement = () => {
  const [activeTab, setActiveTab] = useState('scripts');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('http://localhost:5002/cookies/config');
        if (res.data && res.data.data && res.data.data.config) {
          setBannerConfig({
            theme: res.data.data.config.theme || 'light',
            position: res.data.data.config.position || 'bottom-right',
            expiry: res.data.data.config.expiry || 180,
            status: res.data.data.status || 'Publish'
          });
        }
      } catch (err) {
        console.error('Error fetching config', err);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('http://localhost:5002/cookies/config', bannerConfig);
      toast.success('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings', err);
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const toggleScript = (id) => {
    setScripts(scripts.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-4">
        <button 
          onClick={() => navigate('/consent-logs')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Consent Logs
        </button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cookie Settings</h1>
          <p className="text-gray-500">Configure banner settings and script injection.</p>
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
          <Server size={18} /> Script Manager
        </button>
        <button
          onClick={() => setActiveTab('banner')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'banner' ? 'border-[#0fb5a6] text-[#0fb5a6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Eye size={18} /> Banner Display Rules
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Design</label>
              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-500 flex items-center justify-between">
                <span>Premium Horizontal Floating (Locked)</span>
                <span className="bg-teal-100 text-[#0fb5a6] px-2 py-1 rounded text-xs font-semibold">Active</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={bannerConfig.theme}
                onChange={(e) => setBannerConfig({ ...bannerConfig, theme: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0fb5a6] focus:ring-[#0fb5a6] p-2 border"
              >
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
                <option value="auto">System Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consent Expiry (Days)</label>
              <input
                type="number"
                value={bannerConfig.expiry}
                onChange={(e) => setBannerConfig({ ...bannerConfig, expiry: e.target.value })}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0fb5a6] focus:ring-[#0fb5a6] p-2 border"
              />
              <p className="text-xs text-gray-500 mt-1">Visitors will be asked to consent again after this period.</p>
            </div>

            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-1">Publish Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="status" value="Draft" checked={bannerConfig.status === 'Draft'} onChange={(e) => setBannerConfig({ ...bannerConfig, status: e.target.value })} /> Draft
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="status" value="Publish" checked={bannerConfig.status === 'Publish'} onChange={(e) => setBannerConfig({ ...bannerConfig, status: e.target.value })} /> Publish Live
                </label>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="bg-gray-100/50 rounded-xl border p-6 flex flex-col justify-between overflow-hidden relative min-h-[300px]">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center justify-between relative z-10">
              Live Preview
              <span className="text-xs font-normal text-[#0fb5a6] bg-teal-50 px-2 py-1 rounded">Desktop View</span>
            </h3>

            <div className="flex-grow flex items-end justify-end pt-8">
              {/* Mock Banner matching Frontend */}
              <div
                className="w-full max-w-[700px] backdrop-blur-md rounded-[16px] p-4 flex items-center justify-between gap-6"
                style={{
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  backgroundColor: bannerConfig.theme === 'dark' ? 'rgba(14, 27, 33, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                  borderColor: bannerConfig.theme === 'dark' ? '#2A3A41' : '#E7ECEC',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  boxShadow: '0 24px 60px -18px rgba(14,27,33,0.25)'
                }}>

                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0fb5a6]/10 text-[#0fb5a6] flex items-center justify-center shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 className="font-extrabold text-[15px] m-0 tracking-tight" style={{ color: bannerConfig.theme === 'dark' ? '#FFFFFF' : '#0E1B21' }}>Your privacy matters</h4>
                  </div>
                  <p className="text-[13px] leading-relaxed m-0" style={{ color: bannerConfig.theme === 'dark' ? '#A0ABB0' : '#56656B' }}>
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking <strong className="font-bold whitespace-nowrap" style={{ color: bannerConfig.theme === 'dark' ? '#FFFFFF' : '#0E1B21' }}>"Accept All"</strong>, you consent to our use of cookies.
                    <span className="inline-block ml-1.5 text-[#0FB5A6] font-bold cursor-pointer hover:underline">Read our Cookie Policy</span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button className="px-3.5 py-2.5 rounded-[10px] font-semibold text-[13px] transition-colors" style={{ backgroundColor: bannerConfig.theme === 'dark' ? '#1A2E35' : '#F5F8F8', borderColor: bannerConfig.theme === 'dark' ? '#2A3A41' : '#E7ECEC', borderWidth: '1px', borderStyle: 'solid', color: bannerConfig.theme === 'dark' ? '#E7ECEC' : '#10201F' }}>Reject All</button>
                  <button className="px-3.5 py-2.5 rounded-[10px] font-semibold text-[13px] transition-colors" style={{ backgroundColor: bannerConfig.theme === 'dark' ? '#0E1B21' : '#FFFFFF', borderColor: bannerConfig.theme === 'dark' ? '#3B4E56' : '#D8E0E0', borderWidth: '1px', borderStyle: 'solid', color: bannerConfig.theme === 'dark' ? '#FFFFFF' : '#10201F' }}>Customize</button>
                  <button className="px-5 py-2.5 rounded-[10px] font-bold text-[13px] transition-colors" style={{ backgroundColor: bannerConfig.theme === 'dark' ? '#0FB5A6' : '#0E1B21', color: '#FFFFFF' }}>Accept All</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieManagement;
