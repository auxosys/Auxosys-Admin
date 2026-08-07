import React, { useEffect, useState, useCallback, useMemo } from "react";
import { apiClient } from "../../helper/apiClient";
import { toast } from "react-toastify";
import {
  Search,
  Share2,
  BarChart2,
  Building2,
  Shield,
  Map,
  FileText,
  Link as LinkIcon,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Construction,
} from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import RedirectsManager from "./Redirects";
import PageSEO from "./PageSEO";
import HealthDashboard from "./Dashboard";

const TABS = [
  { id: "dashboard", label: "Health Dashboard", icon: BarChart2, group: "Core" },
  { id: "general", label: "Global Settings", icon: Settings, group: "Core" },
  { id: "page_seo", label: "Page SEO", icon: Search, group: "Core" },
  { id: "metadata", label: "Metadata", icon: Search, group: "Core" },
  { id: "structured_data", label: "Structured Data", icon: Building2, group: "Core" },
  { id: "sitemap", label: "Sitemap", icon: Map, group: "Discovery" },
  { id: "robots", label: "Robots", icon: Shield, group: "Discovery" },
  { id: "redirects", label: "Redirects", icon: LinkIcon, group: "Discovery" },
  { id: "social", label: "Social Sharing", icon: Share2, group: "Appearance" },
  { id: "ai_search", label: "AI Search", icon: FileText, group: "Appearance" },
  { id: "analytics", label: "Analytics", icon: BarChart2, group: "Appearance" },
];

const TAB_GROUPS = ["Core", "Discovery", "Appearance"];

// ---------- Small shared building blocks ----------

const Field = ({ label, hint, children, className = "" }) => (
  <div className={className}>
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase">{label}</label>
    </div>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
  </div>
);

const CharCount = ({ value = "", min, max }) => {
  const len = value.length;
  const bad = (min && len < min) || (max && len > max);
  return (
    <span className={`text-[11px] font-medium ${bad ? "text-amber-600" : "text-gray-400"}`}>
      {len}
      {max ? ` / ${max}` : ""} characters
    </span>
  );
};

const SectionCard = ({ title, description, children, footer }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
    {(title || description) && (
      <div className="px-6 py-4 border-b border-gray-100">
        {title && <h3 className="text-sm font-semibold text-gray-800">{title}</h3>}
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    )}
    <div className="p-6 space-y-5">{children}</div>
    {footer && <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">{footer}</div>}
  </div>
);

const SaveButton = ({ onClick, saving, disabled, label = "Save changes" }) => (
  <button
    onClick={onClick}
    disabled={saving || disabled}
    className="inline-flex items-center gap-2 bg-[#132242] hover:bg-[#0d1830] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
  >
    {saving && <Loader2 size={14} className="animate-spin" />}
    {saving ? "Saving..." : label}
  </button>
);

const ComingSoon = ({ label, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/60">
    <div className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-3">
      <Construction size={18} className="text-gray-400" />
    </div>
    <h3 className="text-sm font-semibold text-gray-700">{label} is on its way</h3>
    <p className="text-xs text-gray-400 mt-1 max-w-xs">
      This section is being migrated to the new settings schema. Check back soon.
    </p>
  </div>
);

const JsonField = ({ label, hint, value, onChange, placeholder }) => {
  const text = typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : value || "";
  const status = useMemo(() => {
    if (!text.trim()) return null;
    try {
      JSON.parse(text);
      return "valid";
    } catch {
      return "invalid";
    }
  }, [text]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase">{label}</label>
        {status === "valid" && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <CheckCircle2 size={12} /> Valid JSON
          </span>
        )}
        {status === "invalid" && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500">
            <AlertCircle size={12} /> Invalid JSON
          </span>
        )}
      </div>
      <textarea
        className="textarea font-mono text-xs w-full"
        rows={7}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
      {hint && <p className="text-xs text-gray-400 mt-1.5">{hint}</p>}
    </div>
  );
};

// ---------- Main component ----------

const SEO = () => {
  const { canWrite } = usePermissions("seo");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({});
  const [sitemap, setSitemap] = useState({});
  const [llmsTxt, setLlmsTxt] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsRes, sitemapRes, filesRes] = await Promise.all([
        apiClient.get("/api/v1/seo/settings"),
        apiClient.get("/api/v1/seo/sitemap"),
        apiClient.get("/api/v1/seo/files"),
      ]);

      setSettings(settingsRes.data.data || {});
      setSitemap(sitemapRes.data.data || {});
      
      const files = filesRes.data.data || [];
      const llmsFile = files.find((f) => f.filename === "llms.txt");
      if (llmsFile) setLlmsTxt(llmsFile.content);
    } catch (err) {
      toast.error("Failed to load SEO data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateSetting = (field, value) => setSettings((prev) => ({ ...prev, [field]: value }));
  const updateSitemap = (field, value) => setSitemap((prev) => ({ ...prev, [field]: value }));

  const saveSettings = async () => {
    try {
      setSaving(true);
      await apiClient.patch("/api/v1/seo/settings", settings);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const saveSitemap = async () => {
    try {
      setSaving(true);
      await apiClient.patch("/api/v1/seo/sitemap", sitemap);
      toast.success("Sitemap settings saved");
    } catch {
      toast.error("Failed to save sitemap settings");
    } finally {
      setSaving(false);
    }
  };

  const saveAiFiles = async () => {
    try {
      setSaving(true);
      await apiClient.post("/api/v1/seo/files", { filename: "llms.txt", content: llmsTxt });
      toast.success("AI Search files saved");
    } catch {
      toast.error("Failed to save AI files");
    } finally {
      setSaving(false);
    }
  };

  const activeMeta = TABS.find((t) => t.id === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 size={22} className="animate-spin" />
          <p className="text-sm">Loading SEO dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page header */}
      <div className="border-b border-gray-200 bg-white px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SEO Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1 max-w-xl">
              Manage global metadata, structured data, sitemaps, redirects, and AI search visibility from one place.
            </p>
          </div>
          {!canWrite && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <Shield size={12} /> Read-only access
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-6 max-w-[1400px] mx-auto">
        <div className="flex gap-6 items-start">
          {/* Sidebar navigation */}
          <aside className="w-56 shrink-0 hidden md:block sticky top-6">
            <nav className="space-y-5">
              {TAB_GROUPS.map((group) => (
                <div key={group}>
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    {group}
                  </p>
                  <div className="space-y-0.5">
                    {TABS.filter((t) => t.group === group).map(({ id, label, icon: Icon }) => {
                      const isActive = activeTab === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-[#132242] text-white"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                        >
                          <Icon size={15} className={isActive ? "text-white" : "text-gray-400"} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Mobile tab select */}
          <div className="md:hidden w-full mb-2">
            <select
              className="input w-full"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {TABS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              {activeMeta && <activeMeta.icon size={16} className="text-gray-400" />}
              <h2 className="text-sm font-semibold text-gray-500">{activeMeta?.label}</h2>
            </div>

            <fieldset disabled={!canWrite} className="space-y-6">
              
              {/* HEALTH DASHBOARD */}
              {activeTab === "dashboard" && <HealthDashboard />}

              {/* GENERAL SETTINGS */}
              {activeTab === "general" && (
                <SectionCard
                  title="Site identity"
                  description="Core details search engines use to identify your site."
                  footer={<SaveButton onClick={saveSettings} saving={saving} disabled={!canWrite} />}
                >
                  <Field label="Site title" hint="Shown in browser tabs and as a fallback page title.">
                    <input
                      className="input w-full"
                      value={settings.site_title || ""}
                      onChange={(e) => updateSetting("site_title", e.target.value)}
                      placeholder="Acme Inc. — Enterprise Software"
                    />
                  </Field>
                  <Field label="Canonical URL" hint="The preferred, indexable domain for this site.">
                    <input
                      className="input w-full font-mono text-sm"
                      value={settings.canonical_url || ""}
                      onChange={(e) => updateSetting("canonical_url", e.target.value)}
                      placeholder="https://www.example.com"
                    />
                  </Field>
                </SectionCard>
              )}

              {/* PAGE SEO OVERRIDES */}
              {activeTab === "page_seo" && <PageSEO canWrite={canWrite} />}

              {/* METADATA */}
              {activeTab === "metadata" && (
                <SectionCard
                  title="Default metadata"
                  description="Applied to pages that don't set their own title or description."
                  footer={<SaveButton onClick={saveSettings} saving={saving} disabled={!canWrite} />}
                >
                  <Field label="Default title template" hint="Use %s as a placeholder for the page-specific title.">
                    <input
                      className="input w-full"
                      value={settings.default_title_template || ""}
                      onChange={(e) => updateSetting("default_title_template", e.target.value)}
                      placeholder="%s | Acme Inc."
                    />
                  </Field>
                  <Field label="Meta description">
                    <textarea
                      className="textarea w-full"
                      rows={3}
                      value={settings.meta_description || ""}
                      onChange={(e) => updateSetting("meta_description", e.target.value)}
                      placeholder="A concise, compelling summary of the page for search results."
                    />
                    <div className="flex justify-end mt-1">
                      <CharCount value={settings.meta_description || ""} max={160} />
                    </div>
                  </Field>
                  <Field label="Keywords" hint="Comma-separated. Low ranking impact, still used by some tools.">
                    <input
                      className="input w-full"
                      value={settings.keywords || ""}
                      onChange={(e) => updateSetting("keywords", e.target.value)}
                      placeholder="enterprise software, saas, automation"
                    />
                  </Field>
                </SectionCard>
              )}

              {/* STRUCTURED DATA */}
              {activeTab === "structured_data" && (
                <SectionCard
                  title="Structured data & sitelinks"
                  footer={<SaveButton onClick={saveSettings} saving={saving} disabled={!canWrite} />}
                >
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3">
                    <Building2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Google generates sitelinks automatically from your site structure. Defining an{" "}
                      <strong>Organization</strong> schema and a <strong>WebSite</strong> schema with a{" "}
                      <strong>SearchAction</strong> tells Google how to interpret your brand and can enable a
                      sitelinks search box.
                    </p>
                  </div>

                  <JsonField
                    label="Organization schema"
                    value={settings.organization_schema}
                    onChange={(v) => updateSetting("organization_schema", v)}
                    placeholder='{"@context":"https://schema.org","@type":"Organization", ...}'
                  />

                  <JsonField
                    label="Website & sitelinks search schema"
                    value={settings.website_schema}
                    onChange={(v) => updateSetting("website_schema", v)}
                    placeholder='{"@context":"https://schema.org","@type":"WebSite","potentialAction":{...}}'
                  />
                </SectionCard>
              )}

              {/* SITEMAP */}
              {activeTab === "sitemap" && (
                <SectionCard footer={<SaveButton onClick={saveSitemap} saving={saving} disabled={!canWrite} />}>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-sm font-semibold text-emerald-800">Dynamic sitemap active</h3>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          Generated on the fly and cached for high performance.
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://admin.auxosys.com/sitemap.xml"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs bg-white border border-emerald-200 px-3 py-1.5 rounded-lg shadow-sm text-emerald-700 font-medium hover:bg-emerald-100 whitespace-nowrap"
                    >
                      View XML <ExternalLink size={12} />
                    </a>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-700 tracking-wide uppercase mb-2">
                      Content included
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { key: "include_services", label: "Services" },
                        { key: "include_products", label: "Products" },
                        { key: "include_news", label: "Newsroom" },
                        { key: "include_jobs", label: "Careers" },
                      ].map(({ key, label }) => (
                        <label
                          key={key}
                          className="flex items-center gap-2.5 border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer hover:border-gray-300 has-[:checked]:border-[#132242] has-[:checked]:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={sitemap[key] || false}
                            onChange={(e) => updateSitemap(key, e.target.checked)}
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Field label="Global priority" hint="Relative priority hint for crawlers, from 0.0 to 1.0.">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      className="input max-w-[150px]"
                      value={sitemap.priority ?? 0.8}
                      onChange={(e) => updateSitemap("priority", parseFloat(e.target.value))}
                    />
                  </Field>
                </SectionCard>
              )}

              {/* REDIRECTS */}
              {activeTab === "redirects" && <RedirectsManager canWrite={canWrite} />}

              {/* AI SEARCH */}
              {activeTab === "ai_search" && (
                <SectionCard footer={<SaveButton onClick={saveAiFiles} saving={saving} disabled={!canWrite} />}>
                  <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg flex gap-3">
                    <FileText size={16} className="text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-purple-800">AEO — AI Engine Optimization</h3>
                      <p className="text-xs text-purple-600 mt-0.5">
                        Configure llms.txt to guide ChatGPT, Perplexity, and Gemini on how to interpret your
                        company data.
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase">
                        llms.txt contents
                      </label>
                      <span className="text-[11px] text-gray-400 font-mono">/llms.txt</span>
                    </div>
                    <textarea
                      className="textarea font-mono text-sm w-full"
                      rows={16}
                      value={llmsTxt}
                      onChange={(e) => setLlmsTxt(e.target.value)}
                      placeholder={"# Acme Inc.\n\n> One-line summary of what this company does.\n\n## Docs\n- [Product overview](/docs/overview): ..."}
                      spellCheck={false}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px] text-gray-400">Markdown supported</span>
                      <CharCount value={llmsTxt} />
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* PLACEHOLDER TABS */}
              {activeTab === "analytics" && <ComingSoon label="Analytics" icon={BarChart2} />}
              {activeTab === "robots" && <ComingSoon label="Robots" icon={Shield} />}
              {activeTab === "social" && <ComingSoon label="Social Sharing" icon={Share2} />}
            </fieldset>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SEO;
