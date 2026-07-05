import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../helper/apiClient";
import { toast } from "react-toastify";
import RichTextEditor from "../Components/RichTextEditor";
import { usePermissions } from "../hooks/usePermissions";
import { ArrowLeft, Save, Send, Plus, X } from "lucide-react";

const TABS = ["Basic Info", "Location & Comp", "Role Details", "Candidate Req", "Settings & SEO"];

const PostJob = () => {
  const navigate = useNavigate();
  const { canWrite, loading: permsLoading } = usePermissions("careers");

  useEffect(() => {
    if (!permsLoading && !canWrite) {
      toast.error("Permission denied");
      navigate("/careers");
    }
  }, [canWrite, permsLoading, navigate]);

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    department: "",
    team: "",
    employment_type: "Full-Time",
    work_mode: "Hybrid",
    experience_level: "Mid Level",
    hiring_manager: "",
    hiring_priority: "Medium",
    openings: 1,
    status: "Published",
    featured: false,
    urgent: false,
    campus_hiring: false,
    country: "India",
    state: "",
    city: "",
    office_location: "",
    remote_regions: "",
    timezone: "",
    relocation_support: false,
    currency: "INR",
    min_salary: "",
    max_salary: "",
    salary_type: "Annual",
    hide_salary: false,
    salary_negotiable: true,
    stipend: "",
    bonus: "",
    equity: "",
    benefits_included: "",
    expected_joining_date: "",
    closing_date: "",
    short_summary: "",
    description: "",
    responsibilities: "",
    requirements: "",
    preferred_qualifications: "",
    nice_to_have: "",
    tech_skills: [],
    soft_skills: [],
    certifications: "",
    education: "",
    languages: "",
    required_documents: { resume: true, coverLetter: false, portfolio: false, github: false, linkedin: false },
    required_fields: { phone: true, noticePeriod: true, currentCtc: true, expectedCtc: true, currentCompany: true },
    application_form_config: {
      jobCategory: "Experienced",
      sections: {
        education: true,
        experience: true,
        certifications: true,
        projects: false
      },
      fields: {
        currentCompany: "optional",
        currentDesignation: "optional",
        experience: "required",
        qualification: "required",
        noticePeriod: "required",
        currentCTC: "optional",
        expectedCTC: "optional",
        college: "required",
        degree: "required",
        stream: "optional",
        currentSemester: "optional",
        graduationYear: "required",
        cgpa: "optional",
        relevantSkills: "required",
        internshipExperience: "optional",
        portfolio: "optional",
        github: "optional",
        linkedin: "optional"
      }
    },
    meta_title: "",
    meta_description: "",
    canonical_url: "",
    slug: "",
    homepage_highlight: false,
    career_page_highlight: false,
    contact_hr_name: "",
    contact_hr_email: ""
  });

  const [techInput, setTechInput] = useState("");
  const [softInput, setSoftInput] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleConfigChange = (key, value) => {
    setForm({
      ...form,
      application_form_config: { ...form.application_form_config, [key]: value }
    });
  };

  const handleConfigSectionChange = (section) => {
    setForm({
      ...form,
      application_form_config: {
        ...form.application_form_config,
        sections: { ...form.application_form_config.sections, [section]: !form.application_form_config.sections[section] }
      }
    });
  };

  const handleConfigFieldChange = (field, value) => {
    setForm({
      ...form,
      application_form_config: {
        ...form.application_form_config,
        fields: { ...form.application_form_config.fields, [field]: value }
      }
    });
  };

  const addTag = (type) => {
    if (type === "tech" && techInput.trim()) {
      if (!form.tech_skills.includes(techInput.trim())) {
        setForm({ ...form, tech_skills: [...form.tech_skills, techInput.trim()] });
      }
      setTechInput("");
    } else if (type === "soft" && softInput.trim()) {
      if (!form.soft_skills.includes(softInput.trim())) {
        setForm({ ...form, soft_skills: [...form.soft_skills, softInput.trim()] });
      }
      setSoftInput("");
    }
  };

  const removeTag = (type, tagToRemove) => {
    if (type === "tech") {
      setForm({ ...form, tech_skills: form.tech_skills.filter(t => t !== tagToRemove) });
    } else {
      setForm({ ...form, soft_skills: form.soft_skills.filter(t => t !== tagToRemove) });
    }
  };

  const handleSubmit = async (submitStatus = "Published") => {
    if (!form.title.trim()) { toast.error("Job Title is required"); return; }
    if (!form.department.trim()) { toast.error("Department is required"); return; }

    try {
      setSubmitting(true);
      const payload = { ...form, status: submitStatus, published_at: new Date().toISOString() };
      await apiClient.post("/job", payload);
      toast.success(`Job ${submitStatus === "Draft" ? "saved as draft" : "published"} successfully`);
      navigate("/careers");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create job");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 px-6">
      <div className="pt-6 mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#0c55cc] hover:text-blue-800 transition font-semibold w-fit">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Create Enterprise Job</h1>
          <p className="text-gray-500 mt-1">Fill out the details to post a new job opening.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit("Draft")}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            <Save size={16} /> Save Draft
          </button>
          <button
            onClick={() => handleSubmit("Published")}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 bg-[#0c55cc] text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
          >
            <Send size={16} /> Publish Job
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-t-xl border-b overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === tab ? "text-[#0c55cc] border-b-2 border-[#0c55cc]" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-b-xl shadow-sm border border-t-0">
        
        {/* TAB 1: Basic Info */}
        {activeTab === "Basic Info" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="e.g. Senior Full Stack Engineer" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <input type="text" name="department" value={form.department} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="e.g. Engineering" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
              <input type="text" name="team" value={form.team} onChange={handleChange} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none" placeholder="e.g. Core Platform" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select name="employment_type" value={form.employment_type} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
              <select name="work_mode" value={form.work_mode} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select name="experience_level" value={form.experience_level} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                <option value="Fresher">Fresher</option>
                <option value="Junior">Junior</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Architect">Architect</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Openings</label>
              <input type="number" name="openings" min="1" value={form.openings} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hiring Priority</label>
              <select name="hiring_priority" value={form.hiring_priority} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hiring Manager</label>
              <input type="text" name="hiring_manager" value={form.hiring_manager} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="Name of manager" />
            </div>
          </div>
        )}

        {/* TAB 2: Location & Comp */}
        {activeTab === "Location & Comp" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full border-b pb-4 mb-2"><h3 className="text-lg font-semibold text-gray-800">Location Details</h3></div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input type="text" name="country" value={form.country} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g. India" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State / Region</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g. Karnataka" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g. Bangalore" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Location Name</label>
              <input type="text" name="office_location" value={form.office_location} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g. Auxosys HQ" />
            </div>

            <div className="col-span-full flex gap-6 mt-2 mb-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <input type="checkbox" name="relocation_support" checked={form.relocation_support} onChange={handleChange} className="w-4 h-4 text-[#0c55cc] rounded" />
                Relocation Support Provided
              </label>
            </div>

            <div className="col-span-full border-b pb-4 mb-2 mt-4"><h3 className="text-lg font-semibold text-gray-800">Compensation & Timeline</h3></div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Type</label>
              <select name="salary_type" value={form.salary_type} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white">
                <option value="Annual">Per Year</option>
                <option value="Monthly">Per Month</option>
                <option value="Hourly">Per Hour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
              <input type="number" name="min_salary" value={form.min_salary} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g. 1000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
              <input type="number" name="max_salary" value={form.max_salary} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g. 1500000" />
            </div>

            <div className="col-span-full flex gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <input type="checkbox" name="hide_salary" checked={form.hide_salary} onChange={handleChange} className="w-4 h-4 rounded" />
                Hide Salary on Public Page
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <input type="checkbox" name="salary_negotiable" checked={form.salary_negotiable} onChange={handleChange} className="w-4 h-4 rounded text-green-600" />
                Salary / Stipend is Negotiable
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Joining Date</label>
              <input type="date" name="expected_joining_date" value={form.expected_joining_date} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Closing Date</label>
              <input type="date" name="closing_date" value={form.closing_date} onChange={handleChange} className="w-full p-2.5 border rounded-lg" />
            </div>
          </div>
        )}

        {/* TAB 3: Role Details */}
        {activeTab === "Role Details" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Summary (Shown on Job Cards)</label>
              <textarea name="short_summary" value={form.short_summary} onChange={handleChange} rows="3" className="w-full p-2.5 border rounded-lg resize-y outline-none focus:ring-2 focus:ring-blue-100" placeholder="Brief 1-2 sentence overview..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Job Description</label>
              <RichTextEditor value={form.description} onChange={(val) => setForm({ ...form, description: val })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
              <RichTextEditor value={form.responsibilities} onChange={(val) => setForm({ ...form, responsibilities: val })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
              <RichTextEditor value={form.requirements} onChange={(val) => setForm({ ...form, requirements: val })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benefits / Perks (Comma separated)</label>
              <input type="text" name="benefits_included" value={form.benefits_included} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="Health Insurance, Remote Work, Flexible Hours..." />
            </div>
          </div>
        )}

        {/* TAB 4: Candidate Requirements */}
        {activeTab === "Candidate Req" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technologies / Tools (Chips)</label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {form.tech_skills.map(skill => (
                    <span key={skill} className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                      {skill} <button onClick={() => removeTag("tech", skill)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag("tech")} className="flex-1 p-2 border rounded-lg text-sm" placeholder="e.g. React, Docker..." />
                  <button onClick={() => addTag("tech")} type="button" className="bg-gray-200 px-3 rounded-lg text-sm font-medium hover:bg-gray-300">Add</button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Soft Skills (Chips)</label>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {form.soft_skills.map(skill => (
                    <span key={skill} className="bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                      {skill} <button onClick={() => removeTag("soft", skill)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={softInput} onChange={(e) => setSoftInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTag("soft")} className="flex-1 p-2 border rounded-lg text-sm" placeholder="e.g. Leadership..." />
                  <button onClick={() => addTag("soft")} type="button" className="bg-gray-200 px-3 rounded-lg text-sm font-medium hover:bg-gray-300">Add</button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Application Form Configuration</h3>
              <p className="text-sm text-gray-500 mb-6">Dynamically configure what candidates see based on the job role.</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Category</label>
                <select 
                  value={form.application_form_config.jobCategory} 
                  onChange={(e) => handleConfigChange("jobCategory", e.target.value)}
                  className="w-full md:w-1/3 p-2 border rounded-lg"
                >
                  <option value="Internship">Internship</option>
                  <option value="Fresher">Fresher / Graduate</option>
                  <option value="Experienced">Experienced Professional</option>
                  <option value="Leadership">Senior / Leadership</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sections Toggle */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">Active Sections</p>
                  <div className="space-y-3">
                    {Object.keys(form.application_form_config.sections).map(section => (
                      <label key={section} className="flex items-center gap-3 text-sm text-gray-600 capitalize cursor-pointer hover:text-blue-600">
                        <input 
                          type="checkbox" 
                          checked={form.application_form_config.sections[section]} 
                          onChange={() => handleConfigSectionChange(section)} 
                          className="rounded text-blue-600 w-4 h-4 focus:ring-blue-500" 
                        />
                        <span className="font-medium">{section.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fields Configuration */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3 border-b pb-2">Field Requirements</p>
                  <div className="space-y-4">
                    {Object.keys(form.application_form_config.fields)
                      .filter(field => {
                        const isInternship = form.application_form_config.jobCategory === "Internship";
                        const internshipFields = ["college", "degree", "stream", "currentSemester", "graduationYear", "cgpa", "relevantSkills", "internshipExperience", "portfolio", "github", "linkedin"];
                        const professionalFields = ["currentCompany", "currentDesignation", "experience", "qualification", "noticePeriod", "currentCTC", "expectedCTC", "portfolio", "github", "linkedin"];
                        return isInternship ? internshipFields.includes(field) : professionalFields.includes(field);
                      })
                      .map(field => {
                        // Force Expected CTC to hidden if salary is fixed (not negotiable)
                        const isFixedCTC = field === "expectedCTC" && form.salary_negotiable === false;
                        const status = isFixedCTC ? "hidden" : form.application_form_config.fields[field];
                        
                        return (
                          <div key={field} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-sm text-gray-600 capitalize font-medium">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                              {["required", "optional", "hidden"].map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  disabled={isFixedCTC}
                                  onClick={() => handleConfigFieldChange(field, st)}
                                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                                    status === st 
                                      ? st === "hidden" ? "bg-red-100 text-red-700 shadow-sm" : st === "required" ? "bg-blue-100 text-blue-700 shadow-sm" : "bg-white text-gray-800 shadow-sm"
                                      : "text-gray-500 hover:text-gray-700"
                                  } ${isFixedCTC ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Settings & SEO */}
        {activeTab === "Settings & SEO" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full border-b pb-4 mb-2"><h3 className="text-lg font-semibold text-gray-800">Job Visibility</h3></div>
            
            <div className="col-span-full flex gap-8">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 rounded text-blue-600" />
                Mark as Featured Job
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <input type="checkbox" name="urgent" checked={form.urgent} onChange={handleChange} className="w-4 h-4 rounded text-red-500" />
                Urgent Hiring
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                <input type="checkbox" name="campus_hiring" checked={form.campus_hiring} onChange={handleChange} className="w-4 h-4 rounded text-green-500" />
                Campus Hiring
              </label>
            </div>

            <div className="col-span-full border-b pb-4 mb-2 mt-4"><h3 className="text-lg font-semibold text-gray-800">Contact Information</h3></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HR Name</label>
              <input type="text" name="contact_hr_name" value={form.contact_hr_name} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HR Email</label>
              <input type="email" name="contact_hr_email" value={form.contact_hr_email} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="jane@auxosys.com" />
            </div>

            <div className="col-span-full border-b pb-4 mb-2 mt-4"><h3 className="text-lg font-semibold text-gray-800">Search Engine Optimization (SEO)</h3></div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input type="text" name="meta_title" value={form.meta_title} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="Optimal length: 50-60 characters" />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea name="meta_description" value={form.meta_description} onChange={handleChange} rows="2" className="w-full p-2.5 border rounded-lg resize-none" placeholder="Optimal length: 150-160 characters"></textarea>
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Slug (Optional)</label>
              <input type="text" name="slug" value={form.slug} onChange={handleChange} className="w-full p-2.5 border rounded-lg" placeholder="e.g. senior-react-developer-bangalore" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PostJob;
