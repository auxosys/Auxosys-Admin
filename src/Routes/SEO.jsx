import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "../helper/apiClient";
import { toast } from "react-toastify";
import { Search, Share2, Twitter, BarChart2, Building2, Shield, Upload, X } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";

const TABS = [
  { id: "general", label: "General", icon: Search },
  { id: "opengraph", label: "Open Graph", icon: Share2 },
  { id: "twitter", label: "Twitter Card", icon: Twitter },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "robots", label: "Robots & Indexing", icon: Shield },
];

const SEO = () => {
  const { canWrite } = usePermissions("seo");
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [ogImageUrl, setOgImageUrl] = useState(null);
  const [orgLogoUrl, setOrgLogoUrl] = useState(null);

  const [form, setForm] = useState({
    siteName: "",
    siteDescription: "",
    siteKeywords: "",
    canonicalBaseUrl: "",
    defaultMetaTitleTemplate: "%s | AUXOSYS",
    defaultMetaDescription: "",
    openGraph: { title: "", description: "", imageKey: "", type: "website", siteName: "" },
    twitter: { card: "summary_large_image", site: "", title: "", description: "" },
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    defaultRobots: "index, follow",
    organization: { name: "", url: "", logoKey: "", description: "", linkedIn: "", twitter: "", facebook: "" },
  });

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/seo");
      const d = res.data?.data;
      if (d) {
        setForm({
          siteName: d.siteName || "",
          siteDescription: d.siteDescription || "",
          siteKeywords: d.siteKeywords || "",
          canonicalBaseUrl: d.canonicalBaseUrl || "",
          defaultMetaTitleTemplate: d.defaultMetaTitleTemplate || "%s | AUXOSYS",
          defaultMetaDescription: d.defaultMetaDescription || "",
          openGraph: {
            title: d.openGraph?.title || "",
            description: d.openGraph?.description || "",
            imageKey: d.openGraph?.imageKey || "",
            type: d.openGraph?.type || "website",
            siteName: d.openGraph?.siteName || "",
          },
          twitter: {
            card: d.twitter?.card || "summary_large_image",
            site: d.twitter?.site || "",
            title: d.twitter?.title || "",
            description: d.twitter?.description || "",
          },
          googleAnalyticsId: d.googleAnalyticsId || "",
          googleTagManagerId: d.googleTagManagerId || "",
          facebookPixelId: d.facebookPixelId || "",
          defaultRobots: d.defaultRobots || "index, follow",
          organization: {
            name: d.organization?.name || "",
            url: d.organization?.url || "",
            logoKey: d.organization?.logoKey || "",
            description: d.organization?.description || "",
            linkedIn: d.organization?.linkedIn || "",
            twitter: d.organization?.twitter || "",
            facebook: d.organization?.facebook || "",
          },
        });
        if (d.openGraph?.imageUrl) setOgImageUrl(d.openGraph.imageUrl);
        if (d.organization?.logoUrl) setOrgLogoUrl(d.organization.logoUrl);
      }
    } catch {
      toast.error("Failed to load SEO settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));
  const setNested = (section, field, value) =>
    setForm(p => ({ ...p, [section]: { ...p[section], [field]: value } }));

  const saveSettings = async () => {
    try {
      setSaving(true);
      await apiClient.patch("/seo", form);
      toast.success("SEO settings saved");
    } catch {
      toast.error("Failed to save SEO settings");
    } finally {
      setSaving(false);
    }
  };

  const handleOgImageUpload = async (file) => {
    if (!file) return;
    try {
      setUploadingOg(true);
      const fd = new FormData();
      fd.append("image", file);
      const res = await apiClient.post("/seo/og-image", fd);
      const { url, key } = res.data.data;
      setOgImageUrl(url);
      setNested("openGraph", "imageKey", key);
      toast.success("OG image uploaded");
    } catch {
      toast.error("Failed to upload OG image");
    } finally {
      setUploadingOg(false);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    try {
      setUploadingLogo(true);
      const fd = new FormData();
      fd.append("image", file);
      const res = await apiClient.post("/seo/org-logo", fd);
      const { url, key } = res.data.data;
      setOrgLogoUrl(url);
      setNested("organization", "logoKey", key);
      toast.success("Logo uploaded");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4">
        <p className="text-gray-500">Loading SEO settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8 px-6">
      <div className="mb-6 pt-2">
        <h1 className="text-3xl font-bold text-gray-800">SEO Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage site-wide SEO, Open Graph, social meta tags, analytics tracking, and structured data.
        </p>
      </div>

      <div className="bg-white border rounded-xl mb-6">
        {/* Tab bar */}
        <div className="overflow-x-auto">
          <nav className="flex border-b">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === id
                    ? "border-[#0c55cc] text-[#0c55cc]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">

          {/* ── GENERAL ── */}
          {activeTab === "general" && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Site Name</label>
                <input className="input" value={form.siteName} onChange={e => set("siteName", e.target.value)} placeholder="AUXOSYS" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Site Description</label>
                <textarea className="textarea" rows={3} value={form.siteDescription} onChange={e => set("siteDescription", e.target.value)} placeholder="Brief description of your website..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Default Meta Title Template</label>
                <input className="input" value={form.defaultMetaTitleTemplate} onChange={e => set("defaultMetaTitleTemplate", e.target.value)} placeholder="%s | AUXOSYS" />
                <p className="text-[11px] text-gray-400 mt-1">Use %s as a placeholder for the page title. e.g. &ldquo;About Us | AUXOSYS&rdquo;</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Default Meta Description</label>
                <textarea className="textarea" rows={3} value={form.defaultMetaDescription} onChange={e => set("defaultMetaDescription", e.target.value)} placeholder="Fallback meta description used when a page has no custom description..." />
                <p className="text-[11px] text-gray-400 mt-1">Recommended length: 150–160 characters.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Default Meta Keywords</label>
                <input className="input" value={form.siteKeywords} onChange={e => set("siteKeywords", e.target.value)} placeholder="corporation, AUXOSYS, business, enterprise..." />
                <p className="text-[11px] text-gray-400 mt-1">Comma-separated keywords.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Canonical Base URL</label>
                <input className="input" value={form.canonicalBaseUrl} onChange={e => set("canonicalBaseUrl", e.target.value)} placeholder="https://www.auxosys.com" />
                <p className="text-[11px] text-gray-400 mt-1">Used to build canonical tags. Include protocol, no trailing slash.</p>
              </div>
            </div>
          )}

          {/* ── OPEN GRAPH ── */}
          {activeTab === "opengraph" && (
            <div className="space-y-5 max-w-2xl">
              <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                Open Graph tags control how your site appears when shared on Facebook, LinkedIn, WhatsApp, and Slack.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">OG Title</label>
                <input className="input" value={form.openGraph.title} onChange={e => setNested("openGraph", "title", e.target.value)} placeholder="AUXOSYS – Leading Business Solutions" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">OG Description</label>
                <textarea className="textarea" rows={3} value={form.openGraph.description} onChange={e => setNested("openGraph", "description", e.target.value)} placeholder="Compelling description shown in social share previews..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">OG Type</label>
                  <select className="input" value={form.openGraph.type} onChange={e => setNested("openGraph", "type", e.target.value)}>
                    <option value="website">website</option>
                    <option value="article">article</option>
                    <option value="profile">profile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">OG Site Name</label>
                  <input className="input" value={form.openGraph.siteName} onChange={e => setNested("openGraph", "siteName", e.target.value)} placeholder="AUXOSYS" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">OG Image <span className="font-normal text-gray-400">(recommended: 1200×630px)</span></label>
                {ogImageUrl ? (
                  <div className="relative mb-3 w-full max-w-sm">
                    <img src={ogImageUrl} alt="OG preview" className="w-full rounded-lg border object-cover" style={{ aspectRatio: "1200/630" }} />
                    <button
                      onClick={() => { setOgImageUrl(null); setNested("openGraph", "imageKey", ""); }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow border hover:bg-gray-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 mb-3 text-center text-gray-400 text-sm">
                    No OG image set
                  </div>
                )}
                {canWrite && (
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload size={16} />
                    {uploadingOg ? "Uploading..." : "Upload OG Image"}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadingOg} onChange={e => handleOgImageUpload(e.target.files[0])} />
                  </label>
                )}
                <p className="text-[11px] text-gray-400 mt-1">JPEG, PNG, or WebP. Ideal size: 1200×630px.</p>
              </div>
            </div>
          )}

          {/* ── TWITTER CARD ── */}
          {activeTab === "twitter" && (
            <div className="space-y-5 max-w-2xl">
              <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                Twitter Card tags control how your links appear when shared on Twitter / X. The OG image is also used as the Twitter image unless overridden.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Card Type</label>
                <select className="input" value={form.twitter.card} onChange={e => setNested("twitter", "card", e.target.value)}>
                  <option value="summary_large_image">Summary – Large Image</option>
                  <option value="summary">Summary</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Twitter / X Site Handle</label>
                <input className="input" value={form.twitter.site} onChange={e => setNested("twitter", "site", e.target.value)} placeholder="@opmcorporation" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Twitter Title</label>
                <input className="input" value={form.twitter.title} onChange={e => setNested("twitter", "title", e.target.value)} placeholder="AUXOSYS" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Twitter Description</label>
                <textarea className="textarea" rows={3} value={form.twitter.description} onChange={e => setNested("twitter", "description", e.target.value)} placeholder="Description shown in Twitter card previews..." />
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && (
            <div className="space-y-5 max-w-2xl">
              <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                These IDs are served to the frontend so the appropriate tracking scripts can be loaded. Save them here and configure your frontend to read from the SEO API.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Google Analytics 4 – Measurement ID</label>
                <input className="input" value={form.googleAnalyticsId} onChange={e => set("googleAnalyticsId", e.target.value)} placeholder="G-XXXXXXXXXX" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Google Tag Manager ID</label>
                <input className="input" value={form.googleTagManagerId} onChange={e => set("googleTagManagerId", e.target.value)} placeholder="GTM-XXXXXXX" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Facebook Pixel ID</label>
                <input className="input" value={form.facebookPixelId} onChange={e => set("facebookPixelId", e.target.value)} placeholder="123456789012345" />
              </div>
            </div>
          )}

          {/* ── ORGANIZATION ── */}
          {activeTab === "organization" && (
            <div className="space-y-5 max-w-2xl">
              <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                These fields power the Organization JSON-LD structured data schema injected into the site &lt;head&gt;. Helps Google understand your business.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Organization Name</label>
                <input className="input" value={form.organization.name} onChange={e => setNested("organization", "name", e.target.value)} placeholder="AUXOSYS" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Website URL</label>
                <input className="input" value={form.organization.url} onChange={e => setNested("organization", "url", e.target.value)} placeholder="https://www.auxosys.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Organization Description</label>
                <textarea className="textarea" rows={3} value={form.organization.description} onChange={e => setNested("organization", "description", e.target.value)} placeholder="Brief description of your organization..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Organization Logo</label>
                {orgLogoUrl ? (
                  <div className="relative mb-3 inline-block">
                    <img src={orgLogoUrl} alt="Logo" className="h-16 rounded border object-contain bg-gray-50 p-1" />
                    <button
                      onClick={() => { setOrgLogoUrl(null); setNested("organization", "logoKey", ""); }}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow border hover:bg-gray-50"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 mb-3 text-center text-gray-400 text-sm w-48">
                    No logo set
                  </div>
                )}
                {canWrite && (
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload size={16} />
                      {uploadingLogo ? "Uploading..." : "Upload Logo"}
                      <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={e => handleLogoUpload(e.target.files[0])} />
                    </label>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label>
                  <input className="input" value={form.organization.linkedIn} onChange={e => setNested("organization", "linkedIn", e.target.value)} placeholder="https://linkedin.com/company/..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Twitter / X URL</label>
                  <input className="input" value={form.organization.twitter} onChange={e => setNested("organization", "twitter", e.target.value)} placeholder="https://twitter.com/..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Facebook URL</label>
                  <input className="input" value={form.organization.facebook} onChange={e => setNested("organization", "facebook", e.target.value)} placeholder="https://facebook.com/..." />
                </div>
              </div>
            </div>
          )}

          {/* ── ROBOTS ── */}
          {activeTab === "robots" && (
            <div className="space-y-5 max-w-2xl">
              <p className="text-sm text-gray-500">
                Control how search engine crawlers interact with your site by default.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Default Robots Meta Directive</label>
                <select className="input" value={form.defaultRobots} onChange={e => set("defaultRobots", e.target.value)}>
                  <option value="index, follow">index, follow – fully crawlable (recommended)</option>
                  <option value="noindex, follow">noindex, follow – don\'t index but follow links</option>
                  <option value="index, nofollow">index, nofollow – index but don\'t follow links</option>
                  <option value="noindex, nofollow">noindex, nofollow – completely hidden from crawlers</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">Applied site-wide unless overridden per-post.</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-700 font-medium mb-1">Per-Post Noindex</p>
                <p className="text-xs text-amber-600">
                  Each newsroom post has a &ldquo;noindex&rdquo; toggle in its SEO &amp; Meta section. Enabling it adds a noindex directive only to that post, overriding this global setting.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {canWrite && (
        <div className="flex justify-end">
          <button onClick={saveSettings} disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save SEO Settings"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SEO;
