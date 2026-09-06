import React, { useState, useEffect } from 'react';
import {
  listCampaigns,
  createCampaign,
  updateCampaign,
  launchCampaign,
  pauseCampaign,
  deleteCampaign,
  listSenderEmails,
  listLists,
  listTemplates,
  createTemplate,
} from '../../api/mailboxApi';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Rocket, X, Pencil } from 'lucide-react';
import { toast } from 'react-toastify';

const STARTER_TEMPLATES = [
  {
    id: 'starter_b2b_intro',
    name: '⚡ Executive B2B Intro',
    subject: 'Quick question regarding digital initiatives at {{company}}',
    body_html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6; padding: 10px;">
  <p style="font-size: 15px; margin-bottom: 16px;">Hi <strong>{{first_name}}</strong>,</p>
  <p style="font-size: 15px; margin-bottom: 16px;">I hope this email finds you well.</p>
  <p style="font-size: 15px; margin-bottom: 16px;">I was reviewing <strong>{{company}}</strong>'s recent growth and noticed your role as <strong>{{job_title}}</strong>. We work with leading tech and enterprise teams to design, scale, and deliver high-performance software, cloud infrastructure, and custom AI solutions.</p>
  <p style="font-size: 15px; margin-bottom: 16px;">Recently, we helped a similar team accelerate their product roadmap by 40% while lowering operational overhead.</p>
  <p style="font-size: 15px; margin-bottom: 24px;">Would you have 10–15 minutes for a brief introductory call this Thursday or Friday to explore if there's mutual fit?</p>
  <p style="font-size: 15px; margin-bottom: 4px; color: #334155;">Best regards,</p>

  <!-- ELEGANT EXECUTIVE SIGNATURE CARD -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-top: 1px solid #cbd5e1; margin-top: 16px; padding-top: 16px;">
    <tr>
      <td valign="middle" style="width: 36px; padding-right: 12px;">
        <img src="https://auxosys.com/Auxosys-icon-mono-white.png" width="32" height="32" alt="Auxosys Logo" style="display: block; width: 32px; height: 32px; border-radius: 8px; background-color: #0f172a; padding: 3px;" />
      </td>
      <td valign="middle">
        <div style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em; line-height: 1.2;">Auxosys Business Growth Team</div>
        <div style="font-size: 14px; font-weight: 500; color: #475569; margin-top: 3px; line-height: 1.3;">Enterprise Digital Solutions & Engineering</div>
      </td>
    </tr>
    <tr>
      <td colSpan="2" style="padding-top: 10px; font-size: 14px; font-weight: 500; color: #64748b;">
        <a href="https://www.auxosys.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">www.auxosys.com</a>
        <span style="color: #94a3b8; margin: 0 6px;">&bull;</span>
        <a href="mailto:contact@auxosys.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">contact@auxosys.com</a>
      </td>
    </tr>
  </table>
</div>`,
  },
  {
    id: 'starter_followup',
    name: '⚡ Quick Follow-up',
    subject: 'Following up on digital roadmap for {{company}}',
    body_html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6; padding: 10px;">
  <p style="font-size: 15px; margin-bottom: 16px;">Hi <strong>{{first_name}}</strong>,</p>
  <p style="font-size: 15px; margin-bottom: 16px;">Checking in to see if you had a chance to review my previous message regarding digital capabilities for <strong>{{company}}</strong>.</p>
  <p style="font-size: 15px; margin-bottom: 16px;">I know how busy things get for a <strong>{{job_title}}</strong>, so no rush at all! If you're currently evaluating external technical partners or upcoming software initiatives, I'd love to send over a 2-minute overview of our past client case studies.</p>
  <p style="font-size: 15px; margin-bottom: 24px;">Let me know if you'd be open to a quick 5-minute chat.</p>
  <p style="font-size: 15px; margin-bottom: 4px; color: #334155;">Warm regards,</p>

  <!-- ELEGANT EXECUTIVE SIGNATURE CARD -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-top: 1px solid #cbd5e1; margin-top: 16px; padding-top: 16px;">
    <tr>
      <td valign="middle" style="width: 36px; padding-right: 12px;">
        <img src="https://auxosys.com/Auxosys-icon-mono-white.png" width="32" height="32" alt="Auxosys Logo" style="display: block; width: 32px; height: 32px; border-radius: 8px; background-color: #0f172a; padding: 3px;" />
      </td>
      <td valign="middle">
        <div style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em; line-height: 1.2;">Auxosys Client Solutions Team</div>
        <div style="font-size: 14px; font-weight: 500; color: #475569; margin-top: 3px; line-height: 1.3;">Full-Stack Custom Development & Cloud Systems</div>
      </td>
    </tr>
    <tr>
      <td colSpan="2" style="padding-top: 10px; font-size: 14px; font-weight: 500; color: #64748b;">
        <a href="https://www.auxosys.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">www.auxosys.com</a>
        <span style="color: #94a3b8; margin: 0 6px;">&bull;</span>
        <a href="mailto:contact@auxosys.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">contact@auxosys.com</a>
      </td>
    </tr>
  </table>
</div>`,
  },
  {
    id: 'starter_partnership',
    name: '⚡ Partnership Proposal',
    subject: 'Strategic partnership opportunity with {{company}}',
    body_html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #1e293b; line-height: 1.6; padding: 10px;">
  <p style="font-size: 15px; margin-bottom: 16px;">Hi <strong>{{first_name}}</strong>,</p>
  <p style="font-size: 15px; margin-bottom: 16px;">We've been closely following <strong>{{company}}</strong>'s progress and impressive achievements in the market.</p>
  <p style="font-size: 15px; margin-bottom: 16px;">Given your oversight as <strong>{{job_title}}</strong>, we thought there might be a strong strategic alignment between our capabilities and your upcoming technical objectives. Auxosys specializes in building scalable enterprise web & mobile platforms, AI-driven workflow automation, and custom cloud architecture.</p>
  <p style="font-size: 15px; margin-bottom: 16px;">Would you be open to reviewing a custom 1-page proposal tailored to <strong>{{company}}</strong>?</p>
  <p style="font-size: 15px; margin-bottom: 24px;">Looking forward to your thoughts.</p>
  <p style="font-size: 15px; margin-bottom: 4px; color: #334155;">Best regards,</p>

  <!-- ELEGANT EXECUTIVE SIGNATURE CARD -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-top: 1px solid #cbd5e1; margin-top: 16px; padding-top: 16px;">
    <tr>
      <td valign="middle" style="width: 36px; padding-right: 12px;">
        <img src="https://auxosys.com/Auxosys-icon-mono-white.png" width="32" height="32" alt="Auxosys Logo" style="display: block; width: 32px; height: 32px; border-radius: 8px; background-color: #0f172a; padding: 3px;" />
      </td>
      <td valign="middle">
        <div style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em; line-height: 1.2;">Auxosys Partnerships Team</div>
        <div style="font-size: 14px; font-weight: 500; color: #475569; margin-top: 3px; line-height: 1.3;">Enterprise Digital Solutions & Engineering</div>
      </td>
    </tr>
    <tr>
      <td colSpan="2" style="padding-top: 10px; font-size: 14px; font-weight: 500; color: #64748b;">
        <a href="https://www.auxosys.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">www.auxosys.com</a>
        <span style="color: #94a3b8; margin: 0 6px;">&bull;</span>
        <a href="mailto:contact@auxosys.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">contact@auxosys.com</a>
      </td>
    </tr>
  </table>
</div>`,
  },
];

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
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);

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

  const handleEdit = (campaign) => {
    setEditingCampaignId(campaign.id);
    const matchedTemplate = templates.find(t => t.id === campaign.template_id);
    setFormData({
      name: campaign.name || '',
      sender_email_id: campaign.sender_email_id || '',
      list_id: campaign.list_id || '',
      template_id: campaign.template_id || '',
      subject: matchedTemplate?.subject || '',
      body_html: matchedTemplate?.body_html || '',
      daily_limit: campaign.daily_limit || 100,
      min_delay_sec: campaign.min_delay_sec || 30,
      max_delay_sec: campaign.max_delay_sec || 90,
      track_opens: campaign.track_opens ?? true,
      track_clicks: campaign.track_clicks ?? true,
    });
    setWizardStep(1);
    setShowWizard(true);
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

      const payload = {
        name: formData.name,
        sender_email_id: formData.sender_email_id,
        list_id: formData.list_id,
        template_id: finalTemplateId,
        daily_limit: Number(formData.daily_limit),
        min_delay_sec: Number(formData.min_delay_sec),
        max_delay_sec: Number(formData.max_delay_sec),
        track_opens: formData.track_opens,
        track_clicks: formData.track_clicks,
      };

      if (editingCampaignId) {
        await updateCampaign(editingCampaignId, payload);
        toast.success('Campaign sequence updated!');
      } else {
        await createCampaign(payload);
        toast.success('Campaign sequence created!');
      }

      setShowWizard(false);
      setEditingCampaignId(null);
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
      toast.error(err.message || 'Failed to save campaign');
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
            onClick={() => {
              setEditingCampaignId(null);
              setFormData({
                name: '',
                sender_email_id: senderEmails[0]?.id || '',
                list_id: lists[0]?.id || '',
                template_id: '',
                subject: '',
                body_html: '',
                daily_limit: 100,
                min_delay_sec: 30,
                max_delay_sec: 90,
                track_opens: true,
                track_clicks: true,
              });
              setWizardStep(1);
              setShowWizard(true);
            }}
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
                        <div className="flex gap-2 justify-end items-center">
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
                            onClick={() => handleEdit(c)}
                            className="p-1 text-slate-500 hover:text-blue-600 transition"
                            title="Edit Campaign"
                          >
                            <Pencil size={16} />
                          </button>
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

      {/* CREATE / EDIT CAMPAIGN WIZARD MODAL */}
      {showWizard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleWizardSubmit}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150"
          >
            {/* WIZARD HEADER */}
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Rocket className="text-blue-600" size={18} />
                  {editingCampaignId ? 'Edit Outreach Sequence' : 'Create Outreach Sequence'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure your automated Brevo campaign sequence</p>
              </div>
              <button
                type="button"
                onClick={() => setShowWizard(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* STEP PROGRESS INDICATOR */}
            <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0 text-xs">
              <div
                onClick={() => setWizardStep(1)}
                className={`flex items-center gap-2 cursor-pointer py-1 px-2.5 rounded-full transition font-semibold ${
                  wizardStep === 1
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : wizardStep > 1
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  wizardStep === 1 ? 'bg-blue-600 text-white' : wizardStep > 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  1
                </span>
                <span>Setup & Audience</span>
              </div>

              <div className="w-6 h-px bg-slate-200 flex-shrink-0" />

              <div
                onClick={() => { if (formData.name && formData.sender_email_id && formData.list_id) setWizardStep(2); }}
                className={`flex items-center gap-2 py-1 px-2.5 rounded-full transition font-semibold ${
                  wizardStep === 2
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer'
                    : wizardStep > 2
                    ? 'text-emerald-700 bg-emerald-50 cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  wizardStep === 2 ? 'bg-blue-600 text-white' : wizardStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  2
                </span>
                <span>Message & Template</span>
              </div>

              <div className="w-6 h-px bg-slate-200 flex-shrink-0" />

              <div
                onClick={() => { if (wizardStep > 2 || (formData.subject && formData.body_html)) setWizardStep(3); }}
                className={`flex items-center gap-2 py-1 px-2.5 rounded-full transition font-semibold ${
                  wizardStep === 3
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  wizardStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  3
                </span>
                <span>Schedule & Limits</span>
              </div>
            </div>

            {/* WIZARD BODY (SCROLLABLE) */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* STEP 1: CAMPAIGN DETAILS */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Q4 SaaS Founders Outreach"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Sender Email (@auxosys.com) *</label>
                    <select
                      required
                      value={formData.sender_email_id}
                      onChange={e => setFormData({ ...formData, sender_email_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                    >
                      <option value="">Select assigned sender address...</option>
                      {senderEmails.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.email}) — {s.department || 'General'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Audience List *</label>
                    <select
                      required
                      value={formData.list_id}
                      onChange={e => setFormData({ ...formData, list_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
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
                  {/* HELPER BANNER */}
                  <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900 leading-relaxed">
                    <span className="font-bold">💡 Tip:</span> Write plain text or HTML. Use dynamic variables like <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 font-mono">&#123;&#123;first_name&#125;&#125;</code> and <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 font-mono">&#123;&#123;company&#125;&#125;</code> to personalize messages per lead automatically.
                  </div>

                  {/* TEMPLATE SELECTION & QUICK STARTERS */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Template or Starter Preset</label>
                    <select
                      value={formData.template_id}
                      onChange={e => {
                        const val = e.target.value;
                        const allAvailable = [...STARTER_TEMPLATES, ...templates];
                        const selected = allAvailable.find(t => String(t.id) === String(val));
                        if (selected) {
                          setFormData({
                            ...formData,
                            template_id: val.startsWith('starter_') ? '' : selected.id,
                            subject: selected.subject,
                            body_html: selected.body_html,
                          });
                        } else {
                          setFormData({ ...formData, template_id: '' });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                    >
                      <option value="">Write custom email or select a preset...</option>
                      <optgroup label="⚡ Pre-made Starter Templates">
                        {STARTER_TEMPLATES.map(st => (
                          <option key={st.id} value={st.id}>{st.name}</option>
                        ))}
                      </optgroup>
                      {templates.length > 0 && (
                        <optgroup label="📁 Your Saved Custom Templates">
                          {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>

                    {/* QUICK STARTER CHIPS */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium">Quick Starters:</span>
                      {STARTER_TEMPLATES.map(st => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              template_id: '',
                              subject: st.subject,
                              body_html: st.body_html,
                            });
                            toast.info(`Loaded "${st.name.replace('⚡ ', '')}" template`);
                          }}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-md text-slate-600 transition font-medium"
                        >
                          {st.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SUBJECT LINE */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject Line *</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Quick question regarding {{company}}"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  {/* EMAIL BODY EDITOR & TOOLBAR */}
                  <div className="space-y-2">
                    {/* TOOLBAR ROW 1: LABEL & VIEW TOGGLE */}
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">Email Body (HTML / Text) *</label>

                      <div className="flex border border-slate-200 rounded-lg overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => setPreviewMode(false)}
                          className={`px-3 py-1 font-semibold transition ${!previewMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          📝 Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode(true)}
                          className={`px-3 py-1 font-semibold transition ${previewMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          👁️ Live Preview
                        </button>
                      </div>
                    </div>

                    {/* TOOLBAR ROW 2: VARIABLE INSERTION TAG CHIPS */}
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs text-slate-500 font-semibold">Insert Variable Tag:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {['first_name', 'last_name', 'company', 'job_title'].map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => insertTag(tag)}
                            className="px-2.5 py-1 text-xs bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-300 hover:border-blue-300 rounded-md font-mono text-slate-700 font-medium transition shadow-2xs"
                            title={`Click to insert {{${tag}}}`}
                          >
                            + &#123;&#123;{tag}&#125;&#125;
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* EDITOR OR LIVE PREVIEW */}
                    {!previewMode ? (
                      <textarea
                        required
                        rows={7}
                        value={formData.body_html}
                        onChange={e => setFormData({ ...formData, body_html: e.target.value })}
                        placeholder="Hi {{first_name}},\n\nI saw your work as {{job_title}} at {{company}}..."
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-slate-800 leading-relaxed min-h-[160px]"
                      />
                    ) : (
                      <div className="p-4 border border-slate-300 rounded-xl bg-slate-50/80 min-h-[160px] max-h-[240px] overflow-y-auto text-sm text-slate-800 leading-relaxed">
                        <div className="text-xs text-slate-400 border-b border-slate-200 pb-2 mb-3 font-semibold uppercase tracking-wider">
                          Sample Email Render (for Alex Smith at Acme Corp):
                        </div>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: (formData.body_html || '')
                              .replace(/\{\{first_name\}\}/g, 'Alex')
                              .replace(/\{\{last_name\}\}/g, 'Smith')
                              .replace(/\{\{company\}\}/g, 'Acme Corp')
                              .replace(/\{\{job_title\}\}/g, 'Engineering Lead')
                              .replace(/\n/g, '<br/>'),
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: SENDING SCHEDULE & RATE LIMITS */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Daily Sending Limit</label>
                    <input
                      type="number"
                      min="1"
                      max="2000"
                      value={formData.daily_limit}
                      onChange={e => setFormData({ ...formData, daily_limit: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                    <p className="text-xs text-slate-400 mt-1">Brevo dispatch ceiling per day for this campaign sequence.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Min Delay (Seconds)</label>
                      <input
                        type="number"
                        min="5"
                        value={formData.min_delay_sec}
                        onChange={e => setFormData({ ...formData, min_delay_sec: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Delay (Seconds)</label>
                      <input
                        type="number"
                        min="10"
                        value={formData.max_delay_sec}
                        onChange={e => setFormData({ ...formData, max_delay_sec: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="pt-3 space-y-3 border-t border-slate-200">
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.track_opens}
                        onChange={e => setFormData({ ...formData, track_opens: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      Enable Real-time Open Tracking (Pixel Webhook)
                    </label>
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.track_clicks}
                        onChange={e => setFormData({ ...formData, track_clicks: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      Enable Secure Link Click Tracking (Redirect Proxy)
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* WIZARD FOOTER NAVIGATION */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex justify-between items-center flex-shrink-0">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(s => s - 1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 bg-white rounded-lg transition"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 1) {
                      if (!formData.name) return toast.error('Please enter a campaign name');
                      if (!formData.sender_email_id) return toast.error('Please select a sender email');
                      if (!formData.list_id) return toast.error('Please select a target lead list');
                    }
                    if (wizardStep === 2) {
                      if (!formData.subject) return toast.error('Please enter a subject line');
                      if (!formData.body_html) return toast.error('Please enter email body content');
                    }
                    setWizardStep(s => s + 1);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-2"
                >
                  <Rocket size={15} /> {editingCampaignId ? 'Update Campaign Sequence' : 'Create Campaign Sequence'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
