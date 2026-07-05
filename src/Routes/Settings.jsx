import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "../helper/apiClient";
import { toast } from "react-toastify";
import { useNotificationSettings } from "../context/NotificationContext";
import { usePermissions } from "../hooks/usePermissions";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
];

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York (EST)" },
  { value: "Europe/London", label: "London (GMT)" },
];

const Settings = () => {
  const { canWrite } = usePermissions("settings");
  const { setPreferences } = useNotificationSettings();
  const [settingsId, setSettingsId] = useState(null);
  const [form, setForm] = useState({
    language: "en",
    timezone: "Asia/Kolkata",
    notifications: { newEnquiries: true, jobApplications: true, newSubscribers: false },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPw, setSavingPw] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/settings");
      const data = res.data?.data;
      if (data) {
        setSettingsId(data.id);
        const notifications = {
          newEnquiries: data.notifications?.newEnquiries ?? true,
          jobApplications: data.notifications?.jobApplications ?? true,
          newSubscribers: data.notifications?.newSubscribers ?? false,
        };
        setForm({
          language: data.language || "en",
          timezone: data.timezone || "Asia/Kolkata",
          notifications,
        });
        setPreferences(notifications);
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [setPreferences]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async () => {
    if (!settingsId) return;
    try {
      setSaving(true);
      await apiClient.patch(`/settings/${settingsId}`, form);
      setPreferences(form.notifications);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      setSavingPw(true);
      await apiClient.patch("/settings/change-password", pwForm);
      toast.success("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-8 px-6">
      <div className="mb-6 pt-2">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-1">Manage regional preferences and notifications.</p>
      </div>

      {/* ── Regional ── */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Regional</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
            <select
              value={form.language}
              onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
              className="input"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Timezone</label>
            <select
              value={form.timezone}
              onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))}
              className="input"
            >
              {TIMEZONES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Notifications ── */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800 text-sm">New Enquiries</div>
              <div className="text-xs text-gray-500">Get notified when a new enquiry is submitted</div>
            </div>
            <input
              type="checkbox"
              checked={form.notifications.newEnquiries}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  notifications: { ...p.notifications, newEnquiries: e.target.checked },
                }))
              }
              className="w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800 text-sm">Job Applications</div>
              <div className="text-xs text-gray-500">Get notified when a new job application arrives</div>
            </div>
            <input
              type="checkbox"
              checked={form.notifications.jobApplications}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  notifications: { ...p.notifications, jobApplications: e.target.checked },
                }))
              }
              className="w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800 text-sm">New Subscribers</div>
              <div className="text-xs text-gray-500">Get notified when someone subscribes to the newsletter</div>
            </div>
            <input
              type="checkbox"
              checked={form.notifications.newSubscribers}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  notifications: { ...p.notifications, newSubscribers: e.target.checked },
                }))
              }
              className="w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Save regional + notifications */}
      {canWrite && (
        <div className="flex justify-end mb-8">
          <button onClick={saveSettings} disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      )}

      {/* ── Change Password ── */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Change Password</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
              className="input"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
              className="input"
              placeholder="New password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password</label>
            <input
              type="password"
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              className="input"
              placeholder="Confirm new password"
            />
          </div>
        </div>

        {canWrite && (
          <div className="flex justify-end mt-5">
            <button onClick={changePassword} disabled={savingPw} className="btn-primary bg-gray-800 hover:bg-gray-900 border-none">
              {savingPw ? "Updating…" : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
