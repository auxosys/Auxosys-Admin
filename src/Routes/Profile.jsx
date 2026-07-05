import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../helper/apiClient";
import { toast } from "react-toastify";
import { Camera, Mail, Phone, FileText } from "lucide-react";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff&size=256";

const Profile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    email: "",
    phone: "",
    role: "",
    avatar: DEFAULT_AVATAR,
    permissions: {
      userManagement: false,
      contentPublishing: false,
    },
  });

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get("/profile/me");
      const admin = res.data.data.admin;

      setProfile({
        ...admin,
        avatar:
          admin.avatar && admin.avatar.trim() !== ""
            ? admin.avatar
            : DEFAULT_AVATAR,
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
      toast.success("Logged out successfully");
    } catch {
      console.error("Logout failed");
    } finally {
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  const saveProfile = async () => {
    try {
      await apiClient.patch("/profile/update", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        phone: profile.phone,
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await apiClient.post("/profile/avatar", formData);

      setProfile((prev) => ({
        ...prev,
        avatar: `${res.data.data.avatarUrl}?t=${Date.now()}`,
      }));

      toast.success("Profile image updated");
    } catch {
      toast.error("Avatar upload failed");
    } finally {
      setUploading(false);
    }
  };

  const togglePermission = async (key) => {
    const updated = {
      ...profile.permissions,
      [key]: !profile.permissions[key],
    };

    setProfile({ ...profile, permissions: updated });

    try {
      await apiClient.patch("/profile/permissions", updated);
    } catch {
      toast.error("Failed to update permissions");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen pb-10">
      {/* HEADER */}
      <div className="pt-2 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-500 mt-1">
            Manage your personal information and role details.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm rounded-md border border-danger text-danger hover:bg-red-50"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
        {/* LEFT PROFILE CARD */}
        <div className="bg-white rounded-xl border p-6 text-center glass-card">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <img
              src={profile.avatar || DEFAULT_AVATAR}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border"
            />

            <label className="absolute bottom-1 right-1 bg-primary hover:bg-accent text-white p-2 rounded-full cursor-pointer shadow">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => uploadAvatar(e.target.files[0])}
                disabled={uploading}
              />
            </label>
          </div>

          <h3 className="text-lg font-semibold text-gray-800">
            {profile.firstName} {profile.lastName}
          </h3>
          <p className="text-sm text-gray-500">{profile.role}</p>

          <div className="mt-4 text-sm text-gray-500 space-y-2">
            <p className="flex items-center justify-center gap-2">
              <Mail size={14} /> {profile.email}
            </p>
            <p className="flex items-center justify-center gap-2">
              <Phone size={14} /> {profile.phone || "—"}
            </p>
            <p className="flex items-center justify-center gap-2">
              <FileText size={14} /> {profile.bio || "—"}
            </p>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="lg:col-span-2 space-y-6">
          {/* PERSONAL INFO */}
          <div className="bg-white rounded-xl border p-6 glass-card">
            <h2 className="font-semibold text-gray-800 mb-1">
              Personal Information
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Update your personal details here.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="input focus:ring-primary"
                placeholder="First Name"
                value={profile.firstName}
                onChange={(e) =>
                  setProfile({ ...profile, firstName: e.target.value })
                }
              />
              <input
                className="input focus:ring-primary"
                placeholder="Last name"
                value={profile.lastName}
                onChange={(e) =>
                  setProfile({ ...profile, lastName: e.target.value })
                }
              />
            </div>

            <input
              className="input mt-4 focus:ring-primary"
              placeholder="Phone number"
              value={profile.phone || ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />

            <textarea
              className="textarea mt-4 focus:ring-primary"
              placeholder="Bio"
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />

            <button
              onClick={saveProfile}
              className="mt-4 bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>

          {/* ROLE & PERMISSIONS */}
          <div className="bg-white rounded-xl border p-6 glass-card">
            <h2 className="font-semibold text-gray-800 mb-1">
              Role & Permissions
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              View your access levels and permissions.
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div>
                  <p className="font-medium">Content Publishing</p>
                  <p className="text-xs text-gray-500">
                    Can publish newsroom articles directly
                  </p>
                </div>

                <button
                  onClick={() => togglePermission("contentPublishing")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    profile.permissions.contentPublishing
                      ? "bg-primary"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      profile.permissions.contentPublishing
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
