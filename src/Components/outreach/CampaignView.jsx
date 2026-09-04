import React, { useState, useEffect } from 'react';
import {
  listCampaigns,
  createCampaign,
  launchCampaign,
  pauseCampaign,
  deleteCampaign,
  listSenderEmails,
  listLists,
  listTemplates,
  createTemplate,
} from '../../api/mailboxApi';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Rocket } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CampaignView() {
  const { profile } = useAuth();
  const isReadOnly = profile?.access === 'Read' || profile?.access === 'Read Only';

  const [campaigns, setCampaigns] = useState([]);
  const [senderEmails, setSenderEmails] = useState([]);
  const [lists, setLists] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    sender_email_id: '',
    list_id: '',
    template_id: '',
    subject: '',
    body_html: '',
    daily_limit: 100,
    min_delay_sec: 30,
    max_delay_sec: 90,
    track_opens: true,
    track_clicks: true,
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [cRes, sRes, lRes, tRes] = await Promise.all([
        listCampaigns(),
        listSenderEmails(),
        listLists(),
        listTemplates(),
      ]);
      setCampaigns(cRes.campaigns || []);
      setSenderEmails(sRes.senders || []);
      setLists(lRes.lists || []);
      setTemplates(tRes.templates || []);
    } catch (err) {
      console.error('Failed to load campaign data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async (id) => {
    if (isReadOnly) return;
    try {
      await launchCampaign(id);
      toast.success('Campaign launched into queue');
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Failed to launch campaign');
    }
  };

  const handlePause = async (id) => {
    if (isReadOnly) return;
    try {
      await pauseCampaign(id);
      toast.info('Campaign paused');
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Failed to pause campaign');
    }
  };

  const handleDelete = async (id) => {
    if (isReadOnly) return;
    if (!window.confirm('Are you sure you want to delete this campaign sequence?')) return;
    try {
      await deleteCampaign(id);
      toast.success('Campaign deleted');
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Failed to delete campaign');
    }
  };

  const handleWizardSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    try {
      let finalTemplateId = formData.template_id;

      if (!formData.sender_email_id) {
        toast.error('Please select a company sender email address');
        return;
      }
      if (!formData.list_id) {
        toast.error('Please select a target lead list');
        return;
      }

      // Create new template if user customized
      if (!finalTemplateId && formData.subject && formData.body_html) {
        const tRes = await createTemplate({
          name: `${formData.name} Template`,
          subject: formData.subject,
          body_html: formData.body_html,
        });
        finalTemplateId = tRes.template?.id;
      }

      if (!finalTemplateId) {
        toast.error('Please select or create an email template');
        return;
      }

      await createCampaign({
        name: formData.name,
        sender_email_id: formData.sender_email_id,
        list_id: formData.list_id,
        template_id: finalTemplateId,
        daily_limit: Number(formData.daily_limit),
        min_delay_sec: Number(formData.min_delay_sec),
        max_delay_sec: Number(formData.max_delay_sec),
        track_opens: formData.track_opens,
        track_clicks: formData.track_clicks,
      });

      toast.success('Campaign sequence created!');
      setShowWizard(false);
      setWizardStep(1);
      setFormData({
        name: '',
        sender_email_id: '',
        list_id: '',
        template_id: '',
        subject: '',
        body_html: '',
        daily_limit: 100,
        min_delay_sec: 30,
        max_delay_sec: 90,
        track_opens: true,
        track_clicks: true,
      });
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Failed to create campaign');
    }
  };

  const insertTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      body_html: prev.body_html + ` {{${tag}}} `,
    }));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto w-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Rocket className="text-blue-600" size={26} />
            Outreach Campaigns
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Central Brevo infrastructure outreach with automated rate limits and retry queue.
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm text-sm"
          >
            <Rocket size={16} /> Create Campaign
          </button>
        )}
      </div>

      {/* CAMPAIGNS LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4">Campaign</th>
              <th className="py-3.5 px-4">Company Sender</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Sent</th>
              <th className="py-3.5 px-4">Opens</th>
              <th className="py-3.5 px-4">Clicks</th>
              <th className="py-3.5 px-4">Replies</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan={8} className="py-8 text-center text-slate-500">Loading campaigns...</td></tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  <Rocket size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">No outreach campaigns created yet.</p>
                  {!isReadOnly && <p className="text-xs text-slate-400 mt-1">Click "Create Campaign" to launch your first sequence.</p>}
                </td>
              </tr>
            ) : (
              campaigns.map(c => {
                const stats = c.stats || {};
                const senderEmail = c.sender_emails?.email || 'Central Brevo';
                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition text-slate-700">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">{senderEmail}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        c.status === 'sending' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'completed' ? 'bg-sky-100 text-sky-800' :
                        c.status === 'paused' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{stats.sent || 0}</td>
                    <td className="py-3.5 px-4 text-blue-600 font-medium">{stats.opens || 0}</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-medium">{stats.clicks || 0}</td>
                    <td className="py-3.5 px-4 text-purple-700 font-semibold">{stats.replies || 0}</td>
                    <td className="py-3.5 px-4 text-right">
                      {!isReadOnly ? (
                        <div className="flex gap-2 justify-end">
                          {c.status === 'sending' ? (
                            <button
                              onClick={() => handlePause(c.id)}
                              className="px-2.5 py-1 rounded text-xs font-medium bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition"
                            >
                              Pause
                            </button>
                          ) : (
                            <button
                              onClick={() => handleLaunch(c.id)}
                              className="px-2.5 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                              {c.status === 'draft' ? 'Launch' : 'Resume'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition"
                            title="Delete Campaign"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Read Only</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE CAMPAIGN WIZARD MODAL */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleWizardSubmit} className="bg-white rounded-xl shadow-xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto relative">
            {/* WIZARD HEADER */}
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                New Campaign — Step {wizardStep} of 3
              </h3>
              <button type="button" onClick={() => setShowWizard(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            {/* STEP 1: CAMPAIGN DETAILS */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Q4 SaaS Founders Outreach"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Sender Email (@auxosys.com) *</label>
                  <select
                    required
                    value={formData.sender_email_id}
                    onChange={e => setFormData({ ...formData, sender_email_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select assigned sender address...</option>
                    {senderEmails.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience List *</label>
                  <select
                    required
                    value={formData.list_id}
                    onChange={e => setFormData({ ...formData, list_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select target lead list...</option>
                    {lists.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.contact_count || 0} contacts)</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: TEMPLATE BUILDER */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Saved Template (Optional)</label>
                  <select
                    value={formData.template_id}
                    onChange={e => {
                      const selected = templates.find(t => t.id === e.target.value);
                      if (selected) {
                        setFormData({ ...formData, template_id: selected.id, subject: selected.subject, body_html: selected.body_html });
                      } else {
                        setFormData({ ...formData, template_id: '' });
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Write custom email below...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Line *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Quick question regarding {{company}}"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Email Body (HTML / Text) *</label>
                    <div className="flex gap-1">
                      {['first_name', 'company', 'job_title'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => insertTag(tag)}
                          className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 border rounded font-mono text-slate-700"
                        >
                          +&#123;&#123;{tag}&#125;&#125;
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    required
                    rows={6}
                    value={formData.body_html}
                    onChange={e => setFormData({ ...formData, body_html: e.target.value })}
                    placeholder="Hi {{first_name}},\n\nI saw your work at {{company}}..."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: SENDING SCHEDULE & RATE LIMITS */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Sending Limit</label>
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    value={formData.daily_limit}
                    onChange={e => setFormData({ ...formData, daily_limit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Brevo dispatch ceiling per day for this campaign.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Min Delay (Seconds)</label>
                    <input
                      type="number"
                      min="5"
                      value={formData.min_delay_sec}
                      onChange={e => setFormData({ ...formData, min_delay_sec: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Max Delay (Seconds)</label>
                    <input
                      type="number"
                      min="10"
                      value={formData.max_delay_sec}
                      onChange={e => setFormData({ ...formData, max_delay_sec: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-2 border-t">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.track_opens}
                      onChange={e => setFormData({ ...formData, track_opens: e.target.checked })}
                    />
                    Enable Real-time Open Tracking
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.track_clicks}
                      onChange={e => setFormData({ ...formData, track_clicks: e.target.checked })}
                    />
                    Enable Secure Link Click Tracking
                  </label>
                </div>
              </div>
            )}

            {/* WIZARD FOOTER NAVIGATION */}
            <div className="flex justify-between items-center pt-4 border-t mt-6">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(s => s - 1)}
                  className="px-4 py-2 border text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 1 && (!formData.name || !formData.sender_email_id || !formData.list_id)) {
                      toast.error('Please complete all step 1 fields');
                      return;
                    }
                    setWizardStep(s => s + 1);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 shadow-sm"
                >
                  Create & Save Sequence
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
