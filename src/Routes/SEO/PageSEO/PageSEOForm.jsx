import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { apiClient } from "../../../helper/apiClient";
import { toast } from "react-toastify";

const Field = ({ label, hint, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-gray-700 tracking-wide uppercase mb-1.5">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 mt-1.5">{hint}</p>}
  </div>
);

export default function PageSEOForm({ pageId, onBack, canWrite }) {
  const [loading, setLoading] = useState(!!pageId);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    page_slug: "",
    status: "Published",
    title: "",
    description: "",
    keywords: "",
    canonical: "",
    og_title: "",
    og_description: "",
    og_image: "",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
    schema_type: "None",
    robots_index: true,
    robots_follow: true,
    ai_summary: "",
    ai_keywords: "",
    ai_description: "",
    entity_tags: ""
  });

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await apiClient.get(`/api/v1/seo/pages/${pageId}`);
        if (res.data.data) {
          setForm(res.data.data);
        }
      } catch (err) {
        toast.error("Failed to fetch page data");
      } finally {
        setLoading(false);
      }
    };

    if (pageId) fetchPage();
  }, [pageId]);

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real app, this should hit an image optimization API endpoint (compression/resizing to 1200x630 webp)
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      toast.info("Uploading & optimizing image...");
      const res = await apiClient.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setForm(f => ({ ...f, [field]: res.data.data.url }));
        toast.success("Image uploaded successfully");
      }
    } catch (err) {
      toast.error("Image upload failed");
    }
  };

  const handleSave = async () => {
    if (!form.page_slug) return toast.error("Page Slug is required");
    setSaving(true);
    try {
      if (pageId) {
        await apiClient.put(`/api/v1/seo/pages/${pageId}`, form);
        toast.success("Page SEO updated");
      } else {
        await apiClient.post("/api/v1/seo/pages", form);
        toast.success("Page SEO created");
      }
      onBack();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save SEO");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading page data...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-base font-semibold text-gray-900">{pageId ? "Edit Page SEO" : "Create Page SEO"}</h2>
            <p className="text-sm text-gray-500">{form.page_slug || "New Route"}</p>
          </div>
        </div>
        {canWrite && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#132242] hover:bg-[#0d1830] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-70"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save SEO"}
          </button>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Core Routing</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Route Slug" hint="e.g. /about or /services/consulting">
                <input
                  type="text"
                  className="input w-full"
                  placeholder="/path"
                  value={form.page_slug}
                  onChange={(e) => setForm({ ...form, page_slug: e.target.value })}
                />
              </Field>
              <Field label="Status" hint="Visibility state">
                <select
                  className="input w-full"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Archived">Archived</option>
                </select>
              </Field>
            </div>
            {form.status === "Scheduled" && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Publish At">
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={form.publish_at ? form.publish_at.substring(0, 16) : ""}
                    onChange={(e) => setForm({ ...form, publish_at: e.target.value })}
                  />
                </Field>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Meta Tags</h3>
            <Field label="SEO Title" hint="Optimal length: 50-60 chars">
              <input
                type="text"
                className="input w-full"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>
            <Field label="Meta Description" hint="Optimal length: 150-160 chars">
              <textarea
                className="input w-full min-h-[100px] resize-y"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Field label="Keywords" hint="Comma separated">
              <input
                type="text"
                className="input w-full"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              />
            </Field>
            <Field label="Canonical URL" hint="Overrides Global Settings canonical (e.g. https://www.auxosys.com/about)">
              <input
                type="url"
                className="input w-full"
                placeholder="Leave blank to use default"
                value={form.canonical || ""}
                onChange={(e) => setForm({ ...form, canonical: e.target.value })}
              />
            </Field>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">AEO / GEO</span>
              AI Search Metadata
            </h3>
            <Field label="AI Summary" hint="A concise factual summary optimized for LLM consumption">
              <textarea
                className="input w-full min-h-[80px]"
                value={form.ai_summary || ""}
                onChange={(e) => setForm({ ...form, ai_summary: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="AI Keywords">
                <input
                  type="text"
                  className="input w-full"
                  value={form.ai_keywords || ""}
                  onChange={(e) => setForm({ ...form, ai_keywords: e.target.value })}
                />
              </Field>
              <Field label="Entity Tags">
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g. Organization, Product, SaaS"
                  value={form.entity_tags || ""}
                  onChange={(e) => setForm({ ...form, entity_tags: e.target.value })}
                />
              </Field>
            </div>
          </section>

        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Social & Open Graph</h3>
            
            <Field label="OG Image (1200x630)">
              {form.og_image && (
                <img src={form.og_image} alt="OG" className="w-full h-32 object-cover rounded-lg border mb-2" />
              )}
              <label className="flex items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <Upload size={16} /> {form.og_image ? "Change Image" : "Upload Image"}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "og_image")} />
              </label>
            </Field>
            
            <Field label="OG Title">
              <input type="text" className="input w-full text-sm py-1.5" value={form.og_title} onChange={(e) => setForm({ ...form, og_title: e.target.value })} />
            </Field>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Indexing Controls</h3>
            
            <label className="flex items-center gap-3 mb-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
                checked={form.robots_index}
                onChange={(e) => setForm({ ...form, robots_index: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Allow Indexing (robots: index)</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 rounded"
                checked={form.robots_follow}
                onChange={(e) => setForm({ ...form, robots_follow: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Follow Links (robots: follow)</span>
            </label>

            <Field label="Schema Type">
              <select
                className="input w-full text-sm py-1.5"
                value={form.schema_type}
                onChange={(e) => setForm({ ...form, schema_type: e.target.value })}
              >
                <option value="None">None</option>
                <option value="Organization">Organization</option>
                <option value="WebSite">WebSite</option>
                <option value="Article">Article</option>
                <option value="Product">Product</option>
                <option value="CollectionPage">CollectionPage</option>
                <option value="AboutPage">AboutPage</option>
                <option value="ContactPage">ContactPage</option>
                <option value="Service">Service</option>
                <option value="FAQPage">FAQPage</option>
                <option value="JobPosting">JobPosting</option>
              </select>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}
