import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../helper/apiClient";
import { toast } from "react-toastify";
import RichTextEditor from "../Components/RichTextEditor";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { RELATED_PAGES } from "./CreateNewsroom";
import { usePermissions } from "../hooks/usePermissions";

const EditNewsroom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { canWrite, loading: permsLoading } = usePermissions("newsroom");
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [ogImageFile, setOgImageFile] = useState(null);
  const [seoOpen, setSeoOpen] = useState(false);

  useEffect(() => {
    if (!permsLoading && !canWrite) {
      toast.error("Permission denied");
      navigate("/newsroom");
    }
  }, [canWrite, permsLoading, navigate]);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
    tags: "",
    status: "Draft",
    publishedAt: "",
    featuredImage: "",
    relatedPage: "",
    author: "AUXOSYS Editorial",
  });

  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    noindex: false,
    ogImageKey: "",
  });

  const [existingOgImageUrl, setExistingOgImageUrl] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await apiClient.get(`/news/admin/${id}`);
        const post = res.data.data;

        if (!post) {
          toast.error("Post not found");
          navigate("/newsroom");
          return;
        }

        setForm({
          title: post.title || "",
          summary: post.summary || "",
          content: post.content || "",
          category: post.category || "",
          tags: post.tags?.join(", ") || "",
          status: post.status || "Draft",
          publishedAt: post.publishedAt ? post.publishedAt.slice(0, 10) : "",
          featuredImage: post.featuredImage || "",
          relatedPage: post.relatedPage || "",
          author: post.author || "AUXOSYS Editorial",
        });

        if (post.seo) {
          setSeo({
            metaTitle: post.seo.metaTitle || "",
            metaDescription: post.seo.metaDescription || "",
            metaKeywords: post.seo.metaKeywords || "",
            canonicalUrl: post.seo.canonicalUrl || "",
            noindex: post.seo.noindex || false,
            ogImageKey: post.seo.ogImageKey || "",
          });
          if (post.seo.ogImageUrl) setExistingOgImageUrl(post.seo.ogImageUrl);
        }

        setLoading(false);
      } catch {
        toast.error("Failed to load post");
        navigate("/newsroom");
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const updatePost = async () => {
    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key !== "featuredImage") data.append(key, value ?? "");
      });

      if (image) data.append("featuredImage", image);

      data.append("seo", JSON.stringify(seo));
      if (ogImageFile) data.append("seoOgImage", ogImageFile);

      await apiClient.put(`/news/${id}`, data);
      toast.success("Post updated successfully");
      navigate("/newsroom");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8">
      {/* HEADER */}
      <div className="pt-6 mb-4 relative">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#132242] hover:text-blue-800 transition font-semibold mb-3 w-fit">
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Edit Newsroom Post</h1>
        <p className="text-gray-500 mt-1">Manage articles, case studies, and press releases.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= CONTENT ================= */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Content</h2>

            <label className="block text-sm text-gray-600 mb-1">Post Title</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Enter a catchy title..." className="input mb-4" />

            <label className="block text-sm text-gray-600 mb-1">Short Summary</label>
            <textarea name="summary" value={form.summary} onChange={handleChange} rows={3} placeholder="Brief description for preview cards..." className="textarea mb-1" />
            <p className="text-[11px] text-gray-400 mb-4">Displayed in the newsroom grid view.</p>

            <label className="block text-sm text-gray-600 mb-2">Body Content</label>
            <RichTextEditor value={form.content} onChange={(value) => setForm((prev) => ({ ...prev, content: value }))} />

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
              <button onClick={updatePost} className="btn-primary">
                {form.status === "Published" ? "Update & Publish" : "Save as Draft"}
              </button>
            </div>
          </div>

          {/* ================= SEO & META ================= */}
          <div className="bg-white rounded-xl border">
            <button
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <div>
                <h2 className="font-semibold text-gray-800">SEO &amp; Meta</h2>
                <p className="text-xs text-gray-500">Override meta tags and Open Graph image for this post.</p>
              </div>
              {seoOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>

            {seoOpen && (
              <div className="px-6 pb-6 space-y-4 border-t pt-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
                  <input
                    className="input"
                    value={seo.metaTitle}
                    onChange={e => setSeo(p => ({ ...p, metaTitle: e.target.value }))}
                    placeholder="Custom page title for search engines (leave blank to use post title)"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Recommended: 50–60 characters.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={seo.metaDescription}
                    onChange={e => setSeo(p => ({ ...p, metaDescription: e.target.value }))}
                    placeholder="Custom meta description for this post (leave blank to use summary)"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Recommended: 150–160 characters.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meta Keywords</label>
                  <input
                    className="input"
                    value={seo.metaKeywords}
                    onChange={e => setSeo(p => ({ ...p, metaKeywords: e.target.value }))}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Canonical URL Override</label>
                  <input
                    className="input"
                    value={seo.canonicalUrl}
                    onChange={e => setSeo(p => ({ ...p, canonicalUrl: e.target.value }))}
                    placeholder="https://www.auxosys.com/newsroom/custom-slug"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Leave blank to use the auto-generated canonical URL.</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Custom OG Image for this Post</label>
                  {existingOgImageUrl && !ogImageFile && (
                    <div className="mb-3">
                      <img src={existingOgImageUrl} alt="Current OG" className="w-full max-w-xs rounded-lg border object-cover" style={{ aspectRatio: "1200/630" }} />
                      <p className="text-[11px] text-gray-400 mt-1">Current OG image. Upload a new one to replace it.</p>
                    </div>
                  )}
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 5 17 10" />
                      <line x1="12" y1="5" x2="12" y2="15" />
                    </svg>
                    {ogImageFile ? ogImageFile.name : "Upload OG Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={e => setOgImageFile(e.target.files[0])} />
                  </label>
                  <p className="text-[11px] text-gray-400 mt-1">Overrides the global OG image for social shares of this post. Ideal: 1200×630px.</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Noindex this post</div>
                    <div className="text-xs text-gray-500">Prevents search engines from indexing this post</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={seo.noindex}
                    onChange={e => setSeo(p => ({ ...p, noindex: e.target.checked }))}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= SIDEBAR ================= */}
        <div className="space-y-6">
          {/* Publishing */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Publishing</h2>

            <label className="text-sm text-gray-600">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input mt-1 mb-4">
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>

            <label className="text-sm text-gray-600">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className="input mt-1 mb-4">
              <option value="">Select category</option>
              <option value="Blog">Blog</option>
              <option value="Case Study">Case Study</option>
              <option value="Press">Press</option>
            </select>

            <label className="text-sm text-gray-600">Related Service/Product</label>
            <select name="relatedPage" value={form.relatedPage} onChange={handleChange} className="input mt-1 mb-4">
              {RELATED_PAGES.map((page) => (
                <option key={page.value} value={page.value}>{page.label}</option>
              ))}
            </select>

            <label className="text-sm text-gray-600">Author</label>
            <input name="author" value={form.author} onChange={handleChange} placeholder="AUXOSYS Editorial" className="input mt-1 mb-4" />

            <label className="text-sm text-gray-600">Date Published</label>
            <input type="date" name="publishedAt" value={form.publishedAt} onChange={handleChange} className="input mt-1 mb-4" />

            <label className="text-sm text-gray-600">Tags</label>
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="Add tags (comma separated)" className="input mt-1" />
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Featured image</h2>
            <div className="border border-dashed rounded-lg p-6">
              <img src="/upload news.png" alt="Upload illustration" className="mx-auto mb-6 max-h-48" />
              <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 5 17 10" />
                  <line x1="12" y1="5" x2="12" y2="15" />
                </svg>
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files[0])} />
              </label>
              {image && <p className="text-xs text-gray-500 mt-2">{image.name}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNewsroom;
