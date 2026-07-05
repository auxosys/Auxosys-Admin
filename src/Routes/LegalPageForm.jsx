import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, GripHorizontal } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "../helper/apiClient";

const LegalPageForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  
  const [formData, setFormData] = useState({
    title: "",
    status: "Draft",
    seo: {
      metaTitle: "",
      metaDescription: "",
    },
    sections: []
  });

  const [draggedSectionIndex, setDraggedSectionIndex] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchPageDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPageDetails = async () => {
    try {
      setInitialLoading(true);
      const res = await apiClient.get(`/legal/admin/${id}`);
      const data = res.data.data;
      setFormData({
        title: data.title || "",
        status: data.status || "Draft",
        seo: {
          metaTitle: data.seo?.metaTitle || "",
          metaDescription: data.seo?.metaDescription || "",
        },
        sections: data.sections || []
      });
    } catch (err) {
      toast.error("Failed to fetch legal page details");
      navigate("/legal-pages");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSeoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [name]: value }
    }));
  };

  // Section Management
  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { heading: "", content: "", order: prev.sections.length }]
    }));
  };

  const removeSection = (index) => {
    setFormData(prev => {
      const newSections = [...prev.sections];
      newSections.splice(index, 1);
      return { ...prev, sections: newSections };
    });
  };

  const handleSectionChange = (index, field, value) => {
    setFormData(prev => {
      const newSections = [...prev.sections];
      newSections[index][field] = value;
      return { ...prev, sections: newSections };
    });
  };

  // Section Drag and Drop
  const handleDragStart = (e, index) => {
    setDraggedSectionIndex(index);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => { e.target.style.opacity = "0.5"; }, 0);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === index) return;
    
    setFormData(prev => {
      const newSections = [...prev.sections];
      const draggedItem = newSections[draggedSectionIndex];
      newSections.splice(draggedSectionIndex, 1);
      newSections.splice(index, 0, draggedItem);
      return { ...prev, sections: newSections };
    });
    setDraggedSectionIndex(index);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedSectionIndex(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Page title is required");
      return false;
    }
    for (let i = 0; i < formData.sections.length; i++) {
      const sec = formData.sections[i];
      if (!sec.heading.trim() || !sec.content.trim()) {
        toast.error(`Section ${i + 1} is missing a heading or content`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      // Ensure sections have proper order before saving
      const payload = {
        ...formData,
        sections: formData.sections.map((sec, idx) => ({ ...sec, order: idx }))
      };

      if (isEditing) {
        await apiClient.put(`/legal/${id}`, payload);
        toast.success("Legal page updated successfully");
      } else {
        await apiClient.post("/legal", payload);
        toast.success("Legal page created successfully");
        navigate("/legal-pages"); // Redirect to list on successful creation
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save legal page");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="flex-1 ml-64 p-8 min-h-screen text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 bg-gray-50 min-h-screen pb-24 overflow-hidden relative">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/legal-pages")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Legal Page" : "Create Legal Page"}</h1>
              <p className="text-sm text-gray-500 mt-0.5">Build sections for terms, policies, etc.</p>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-[#132242] hover:bg-[#0b1327] text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Page"}
          </button>
        </div>

        <form className="space-y-6" onSubmit={e => e.preventDefault()}>
          
          {/* Basic Info & Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <h2 className="text-lg font-semibold text-gray-800 pb-2 border-b border-gray-100">Page Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Page Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleBasicChange}
                  placeholder="e.g. Privacy Policy"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-[#132242] outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleBasicChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-[#132242] outline-none transition-all bg-white"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-medium text-gray-700 mb-3">SEO (Optional)</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.seo.metaTitle}
                  onChange={handleSeoChange}
                  placeholder="SEO Title Override"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#132242] outline-none"
                />
                <textarea
                  name="metaDescription"
                  value={formData.seo.metaDescription}
                  onChange={handleSeoChange}
                  placeholder="SEO Meta Description"
                  rows="2"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#132242] outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section Builder */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-lg font-semibold text-gray-800">Content Sections</h2>
            </div>

            {formData.sections.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
                <p className="text-gray-500 text-sm mb-4">No sections added yet. Start building your legal page.</p>
                <button
                  type="button"
                  onClick={addSection}
                  className="mx-auto flex items-center gap-2 bg-[#132242] hover:bg-[#0b1327] text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add First Section
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.sections.map((section, index) => (
                  <div 
                    key={index}
                    className="group flex gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {/* Drag Handle */}
                    <div className="pt-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                      <GripHorizontal className="w-5 h-5" />
                    </div>

                    {/* Section Inputs */}
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <input
                          type="text"
                          value={section.heading}
                          onChange={(e) => handleSectionChange(index, "heading", e.target.value)}
                          placeholder={`Section ${index + 1} Heading (e.g. Data Collection)`}
                          className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-200 font-medium text-gray-900 focus:border-[#132242] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeSection(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Remove Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <textarea
                        value={section.content}
                        onChange={(e) => handleSectionChange(index, "content", e.target.value)}
                        placeholder="Enter the detailed legal text for this section here..."
                        rows="5"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm focus:border-[#132242] outline-none resize-y min-h-[100px]"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSection}
                  className="w-full py-4 mt-2 border-2 border-dashed border-blue-200 hover:border-[#132242] bg-blue-50/50 hover:bg-blue-50 text-[#132242] font-medium rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Section
                </button>
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default LegalPageForm;
