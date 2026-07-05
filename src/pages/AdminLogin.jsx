import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../helper/apiClient";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { fetchProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiClient.post("/auth/login", { email, password });
      if (res.data.success && res.data.token) {
        localStorage.setItem("accessToken", res.data.token);
        await fetchProfile(); // Reload the profile before navigating!
        navigate("/");
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT PANEL */}
      <div className="hidden lg:block lg:w-[38%] relative bg-black">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10">
          <img src="/icon.svg" alt="AUXOSYS Logo" className="h-16 w-auto" />
        </div>

        <img
          src="/background.jpg"
          alt="AUXOSYS Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* RIGHT PANEL */}
      <div
        className="flex w-full lg:w-[62%] items-center justify-center px-4 sm:px-6 py-10"
        style={{
          background:
            "radial-gradient(circle at top left,rgba(59,130,246,0.14),transparent 28%)," +
            "radial-gradient(circle at top right,rgba(14,165,233,0.12),transparent 24%)," +
            "linear-gradient(180deg,#f6fbff 0%,#eef6ff 100%)",
        }}
      >
        {/* LOGIN CARD */}
        <div className="glass-card w-full max-w-md p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-center text-brand-dark mb-2">
            Admin Sign In
          </h2>

          <p className="text-center text-text-sub mb-6">
            Enter your admin credentials to continue
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-text-sub mb-1">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-text-sub mb-1">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2.5 rounded-lg font-semibold transition shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, #071b3a 0%, #0c55cc 65%, #0c55cc 100%)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
