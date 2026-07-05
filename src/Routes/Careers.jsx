import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  MapPin,
  Briefcase,
  Clock,
  Edit2,
  Trash2,
  LayoutGrid,
  List as ListIcon,
  Search,
  ArrowLeft,
  Users,
  CheckCircle,
  Briefcase as BriefcaseIcon,
  TrendingUp,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "../helper/apiClient";
import { toast } from "react-toastify";
import { usePermissions } from "../hooks/usePermissions";

const Careers = () => {
  const navigate = useNavigate();
  const { canWrite } = usePermissions("careers");

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "job-posting";
  
  const setActiveTab = (tab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams);
  };
  const [viewMode, setViewMode] = useState("grid");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [meta, setMeta] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });

  // Tracks the AbortController for the current in-flight fetch so we can
  // cancel it when the component unmounts or a new fetch starts. This
  // prevents the "Failed to load jobs" toast from firing on other pages
  // after the user has already navigated away from Careers.
  const abortRef = useRef(null);

  const postedLabel = (createdAt) => {
    const days = Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return days === 0 ? "Posted today" : `Posted ${days} days ago`;
  };

  const isNewJob = (createdAt) =>
    (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24) <= 3;

  const fetchJobs = useCallback(async () => {
    // Cancel any previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setJobsError("");

      const params = { page, limit, search: debouncedSearch };
      if (status) params.status = status;

      const res = await apiClient.get("/job/admin", { params, signal: controller.signal });
      let list = res?.data?.data;
      const m = res?.data?.meta || {};

      if (!Array.isArray(list)) throw new Error("Unexpected response shape");

      // Normalize Supabase 'id' to '_id' for frontend components
      list = list.map(job => ({ ...job, _id: job.id || job._id }));

      setJobs(list);
      setMeta({
        page: m.page ?? page,
        limit: m.limit ?? limit,
        total: m.total ?? list.length,
        totalPages: Math.max(1, m.totalPages ?? 1),
      });
    } catch (err) {
      // Request was intentionally aborted (navigation away or new fetch) — do nothing
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      setJobs([]);
      setMeta((prev) => ({ ...prev, total: 0, totalPages: 1 }));
      setJobsError("Failed to load jobs. Please retry.");
      toast.error("Failed to load jobs");
    } finally {
      // Only clear loading if this request wasn't aborted
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [page, limit, debouncedSearch, status]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Cancel in-flight request when component unmounts
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await apiClient.delete(`/job/${id}`);
      toast.success("Job deleted");
      fetchJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const editJob = (id) => navigate(`/careers/edit/${id}`);

  const toggleJobStatus = async (id) => {
    try {
      await apiClient.patch(`/job/${id}/toggle`);
      toast.success("Job status updated");
      fetchJobs();
    } catch {
      toast.error("Failed to toggle job status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8 px-6">
      <div className="pt-6 mb-4 shrink-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#132242] hover:text-blue-800 transition font-semibold w-fit">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6 pt-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Careers</h1>
          <p className="text-gray-500 mt-1">Manage job postings and candidate applications.</p>
        </div>
        {canWrite && (
          <button
            onClick={() => navigate("/careers/new")}
            className="flex items-center gap-2 bg-[#132242] hover:bg-[#132242] text-white px-4 py-2 rounded-lg font-medium shadow-sm text-sm"
          >
            <Plus size={16} strokeWidth={3} />
            New Job
          </button>
        )}
      </div>

      {/* TOP BAR */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-5">
        <div className="bg-gray-200 p-1 rounded-lg flex w-fit">
          <button
            onClick={() => setActiveTab("job-posting")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === "job-posting" ? "bg-white shadow text-gray-800" : "text-gray-500"
              }`}
          >
            Job Posting
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === "applications" ? "bg-white shadow text-gray-800" : "text-gray-500"
              }`}
          >
            Applications
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-[260px] bg-white"
            />
          </div>

          <select
            className="py-2 px-3 border rounded-lg text-sm bg-white"
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            className="py-2 px-3 border rounded-lg text-sm bg-white"
            value={limit}
            onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
          >
            <option value={6}>6 / page</option>
            <option value={9}>9 / page</option>
            <option value={12}>12 / page</option>
            <option value={24}>24 / page</option>
          </select>

          {activeTab === "job-posting" && (
            <div className="flex bg-gray-200 p-1 rounded-lg w-fit">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white text-blue-500" : "text-gray-500"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded ${viewMode === "list" ? "bg-white text-blue-500" : "text-gray-500"}`}
              >
                <ListIcon size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DASHBOARD WIDGETS */}
      {!loading && !jobsError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <h3 className="text-2xl font-bold text-gray-800">{meta.total}</h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-[#132242]">
              <BriefcaseIcon size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {jobs.filter(j => j.status === "Active").length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Applicants</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {jobs.reduce((acc, curr) => acc + (curr.applicantCount || 0), 0)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
              <Users size={24} />
            </div>
          </div>
          <div className="bg-white rounded-xl border p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Applications</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {jobs.length ? Math.round(jobs.reduce((acc, curr) => acc + (curr.applicantCount || 0), 0) / jobs.length) : 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      )}

      {/* ERROR BANNER */}
      {!loading && jobsError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{jobsError}</span>
          <button
            type="button"
            onClick={fetchJobs}
            className="rounded border border-red-300 bg-white px-3 py-1 text-xs font-medium hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="text-center text-gray-400 py-20">Loading jobs...</div>
      ) : activeTab === "applications" ? (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b">
            <div className="text-lg font-semibold text-gray-800">Applications</div>
            <div className="text-sm text-gray-500">Open a job to view its applicants</div>
          </div>
          <div className="divide-y">
            {jobs.length === 0 ? (
              <div className="px-5 py-10 text-gray-400 text-sm text-center">No jobs found.</div>
            ) : (
              jobs.map((job) => (
                <button
                  key={job._id}
                  onClick={() => navigate(`/careers/applications/${job._id}`)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-800">{job.title}</div>
                    <div className="text-sm text-gray-500">
                      {job.location || "—"} &bull; {job.type || "—"} &bull;{" "}
                      {job.status === "Active" ? "Active" : "Closed"}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {job.applicantCount ?? 0} applicant{(job.applicantCount ?? 0) !== 1 ? "s" : ""}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        jobs.length === 0 ? (
          <div className="text-center text-gray-400 py-20">No jobs found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white border rounded-xl p-5 hover:shadow-md">
                <div className="flex justify-between mb-3">
                  <div className="flex gap-2">
                    {isNewJob(job.createdAt) && (
                      <span className="bg-[#132242] text-white text-[10px] px-2 py-1 rounded">New</span>
                    )}
                    <span
                      className={`text-[10px] px-2 py-1 rounded ${job.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {job.status === "Active" ? "Active" : "Closed"}
                    </span>
                  </div>
                  <div className="flex gap-3 text-gray-400 items-center">
                    {canWrite && (
                      <>
                        <button
                          className={`text-xs px-2 py-1 rounded border transition-colors ${job.status === "Active"
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                          onClick={() => toggleJobStatus(job._id)}
                        >
                          {job.status === "Active" ? "Close" : "Activate"}
                        </button>
                        <Edit2 size={16} className="cursor-pointer" onClick={() => editJob(job._id)} />
                        <Trash2 size={16} className="cursor-pointer" onClick={() => deleteJob(job._id)} />
                      </>
                    )}
                  </div>
                </div>

                <h3 className="font-bold mb-2">{job.title}</h3>

                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <div className="flex items-center">
                    <MapPin size={12} className="mr-1" /> {job.location || "—"}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Briefcase size={12} className="mr-1" /> {job.type || "—"}
                    </span>
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" /> {postedLabel(job.createdAt)}
                    </span>
                  </div>
                </div>

                <div
                  onClick={() => navigate(`/careers/applications/${job._id}`)}
                  className="border-t pt-3 flex justify-between cursor-pointer"
                >
                  <span className="text-2xl font-black text-[#132242]">{job.applicantCount ?? 0}</span>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Applications</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Location</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Applicants</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td className="p-4 text-gray-400 text-center" colSpan={6}>
                    No jobs found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="border-t">
                    <td className="p-4 font-medium text-gray-800">{job.title}</td>
                    <td className="p-4 text-gray-600">{job.location || "—"}</td>
                    <td className="p-4 text-gray-600">{job.type || "—"}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${job.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {job.status === "Active" ? "Active" : "Closed"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#132242]">{job.applicantCount ?? 0}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-3 text-gray-400 items-center">
                        <button
                          className="hover:text-gray-700 text-xs"
                          onClick={() => navigate(`/careers/applications/${job._id}`)}
                        >
                          Applicants
                        </button>
                        {canWrite && (
                          <>
                            <button
                              className={`text-xs px-2 py-1 rounded border transition-colors ${job.status === "Active"
                                  ? "border-red-200 text-red-600 hover:bg-red-50"
                                  : "border-green-200 text-green-600 hover:bg-green-50"
                                }`}
                              onClick={() => toggleJobStatus(job._id)}
                            >
                              {job.status === "Active" ? "Close" : "Activate"}
                            </button>
                            <Edit2
                              size={16}
                              className="cursor-pointer"
                              onClick={() => editJob(job._id)}
                            />
                            <Trash2
                              size={16}
                              className="cursor-pointer"
                              onClick={() => deleteJob(job._id)}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {!loading && (
        <div className="flex items-center justify-end mt-6">
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Prev
            </button>
            <div className="text-sm text-gray-700">
              Page <span className="font-semibold">{meta.page}</span> /{" "}
              <span className="font-semibold">{meta.totalPages}</span>
            </div>
            <button
              className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
              disabled={page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
