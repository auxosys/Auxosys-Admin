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
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { usePermissions } from "../../hooks/usePermissions";
import RedirectsManager from "./Redirects";
import SitemapManager from "./Sitemap";
import RobotsManager from "./Robots";
import SocialManager from "./Social";
import PageSEO from "./PageSEO";
import HealthDashboard from "./Dashboard";
import NavigationManager from "./Navigation";

const TABS = [
  { id: "dashboard", label: "Health Dashboard", icon: BarChart2, group: "Core" },
  { id: "general", label: "Global Settings", icon: Settings, group: "Core" },
  { id: "page_seo", label: "Page SEO", icon: Search, group: "Core" },
  { id: "metadata", label: "Metadata", icon: Search, group: "Core" },
  { id: "structured_data", label: "Structured Data", icon: Building2, group: "Core" },
  { id: "sitemap", label: "Sitemap", icon: Map, group: "Discovery" },
  { id: "navigation", label: "Navigation & Sitelinks", icon: LinkIcon, group: "Discovery" },
  { id: "robots", label: "Robots", icon: Shield, group: "Discovery" },
  { id: "redirects", label: "Redirects", icon: LinkIcon, group: "Discovery" },
  { id: "social", label: "Social Sharing", icon: Share2, group: "Appearance" },
  { id: "ai_search", label: "AI Search", icon: FileText, group: "Appearance" },
];

const TAB_GROUPS = ["Core", "Discovery", "Appearance"];

// ---------- Small shared building blocks ----------

const Field = ({ label, hint, children, className = "" }) => (
  <div className={className}>
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase">{label}</label>
    </div>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1.5 font-normal">{hint}</p>}
  </div>
);

const CharCount = ({ value = "", min, max }) => {
  const len = value.length;
  const bad = (min && len < min) || (max && len > max);
  return (
    <span className={`text-[11px] font-medium ${bad ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
      {len}
      {max ? ` / ${max}` : ""} characters
    </span>
  );
};

const SectionCard = ({ title, description, children, footer }) => (
  <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden transition-shadow hover:shadow">
    {(title || description) && (
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        {title && <h3 className="text-sm font-bold text-gray-900">{title}</h3>}
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    )}
    <div className="p-6 space-y-6">{children}</div>
    {footer && <div className="px-6 py-3.5 bg-gray-50/70 border-t border-gray-100 flex justify-end">{footer}</div>}
  </div>
);

const SaveButton = ({ onClick, saving, disabled, label = "Save changes" }) => (
  <button
    onClick={onClick}
    disabled={saving || disabled}
    className="inline-flex items-center gap-2 bg-[#132242] hover:bg-[#071b3a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
  >
    {saving && <Loader2 size={14} className="animate-spin" />}
    {saving ? "Saving..." : label}
  </button>
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
        <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase">{label}</label>
        {status === "valid" && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 size={12} /> Valid JSON
          </span>
        )}
        {status === "invalid" && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            <AlertCircle size={12} /> Invalid JSON
          </span>
        )}
      </div>
      <textarea
        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all shadow-sm"
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
  const [llmsTxt, setLlmsTxt] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsRes, filesRes] = await Promise.all([
        apiClient.get("/api/v1/seo/settings"),
        apiClient.get("/api/v1/seo/files"),
      ]);

      setSettings(settingsRes.data.data || {});
      
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
          <Loader2 size={22} className="animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading SEO dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Page header */}
      <div className="border-b border-gray-200/80 bg-white px-6 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
              <Search size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SEO Dashboard</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage global metadata, structured data, sitemaps, redirects, and AI search visibility.
              </p>
            </div>
          </div>
          {!canWrite && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full shadow-sm">
              <Shield size={13} /> Read-only mode
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div className="flex gap-6 items-start">
          {/* Sidebar navigation card */}
          <aside className="w-64 shrink-0 hidden md:block sticky top-6">
            <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-sm space-y-5">
              {TAB_GROUPS.map((group) => (
                <div key={group}>
                  <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    {group}
                  </p>
                  <div className="space-y-1">
                    {TABS.filter((t) => t.group === group).map(({ id, label, icon: Icon }) => {
                      const isActive = activeTab === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-[#132242] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
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
            </div>
          </aside>

          {/* Mobile tab select */}
          <div className="md:hidden w-full mb-2">
            <select
              className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 shadow-sm"
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
            {activeTab !== "dashboard" && activeTab !== "navigation" && activeMeta && (
              <div className="flex items-center gap-2.5 pb-3 mb-5 border-b border-gray-200/80">
                <div className="w-7 h-7 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0">
                  <activeMeta.icon size={15} />
                </div>
                <h2 className="text-base font-bold text-gray-900">{activeMeta.label}</h2>
              </div>
            )}

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
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all shadow-sm"
                      value={settings.site_title || ""}
                      onChange={(e) => updateSetting("site_title", e.target.value)}
                      placeholder="Auxosys — Enterprise Digital Solutions"
                    />
                  </Field>
                  <Field label="Canonical URL" hint="The preferred, indexable domain for this site.">
                    <input
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-mono text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all shadow-sm"
                      value={settings.canonical_url || ""}
                      onChange={(e) => updateSetting("canonical_url", e.target.value)}
                      placeholder="https://www.auxosys.com"
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
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all shadow-sm"
                      value={settings.default_title_template || ""}
                      onChange={(e) => updateSetting("default_title_template", e.target.value)}
                      placeholder="%s | Auxosys"
                    />
                  </Field>
                  <Field label="Meta description">
                    <textarea
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all shadow-sm resize-y"
                      rows={3}
                      value={settings.meta_description || ""}
                      onChange={(e) => updateSetting("meta_description", e.target.value)}
                      placeholder="A concise, compelling summary of the page for search results."
                    />
                    <div className="flex justify-end mt-1.5">
                      <CharCount value={settings.meta_description || ""} max={160} />
                    </div>
                  </Field>
                  <Field label="Keywords" hint="Comma-separated. Low ranking impact, still used by some tools.">
                    <input
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all shadow-sm"
                      value={settings.keywords || ""}
                      onChange={(e) => updateSetting("keywords", e.target.value)}
                      placeholder="enterprise software, custom web development, digital transformation"
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
                <SitemapManager canWrite={canWrite} />
              )}

              {/* NAVIGATION */}
              {activeTab === "navigation" && (
                <NavigationManager canWrite={canWrite} />
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
              {activeTab === "robots" && (
                <RobotsManager
                  settings={settings}
                  updateSetting={updateSetting}
                  saveSettings={saveSettings}
                  canWrite={canWrite}
                  saving={saving}
                />
              )}
              {activeTab === "social" && (
                <SocialManager
                  settings={settings}
                  updateSetting={updateSetting}
                  saveSettings={saveSettings}
                  canWrite={canWrite}
                  saving={saving}
                />
              )}
            </fieldset>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SEO;
