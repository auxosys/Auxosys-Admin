import React, { useState, useEffect } from "react";
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

  const backgroundImages = [
    "/images/bg-gradient.jpg",
    "/images/bg-tech.jpg",
    "/images/bg-robot.jpg"
  ];
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 6000); // Change image every 6 seconds
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#021326]">
      {/* IMMERSIVE BACKGROUND SLIDESHOW */}
      {backgroundImages.map((src, idx) => (
        <img
          key={src}
          src={src}
          loading={idx === 0 ? "eager" : "lazy"}
          fetchpriority={idx === 0 ? "high" : "auto"}
          alt={`AUXOSYS Background ${idx}`}
          className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-[2000ms] ease-in-out ${
            idx === currentBg ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {/* Subtle Overlay to ensure text readability without hiding the image */}
      <div className="absolute inset-0 bg-[#021326]/40 z-10" />

      {/* FLOATING LOGO */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20">
        <img src="/icon.svg" alt="AUXOSYS Logo" className="h-16 w-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]" />
      </div>

      {/* CENTER GLASS CARD */}
      <div className="relative z-20 w-full max-w-md mx-4 animate-[fadeIn_0.6s_ease-out]">
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 p-8 sm:p-10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {/* Subtle top glow inside the card */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0FB5A6]/70 to-transparent" />
          
          <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-wide">
            Admin Sign In
          </h2>

          <p className="text-center text-blue-200/60 mb-8 text-sm">
            Secure access to the Auxosys portal
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-6 backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-xs font-medium text-blue-200/70 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@auxosys.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#0FB5A6]/50 focus:border-[#0FB5A6]/50 outline-none text-white placeholder-blue-100/20 transition-all"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-medium text-blue-200/70 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#0FB5A6]/50 focus:border-[#0FB5A6]/50 outline-none text-white placeholder-blue-100/20 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-blue-200/50 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(15,181,166,0.2)] hover:shadow-[0_0_25px_rgba(15,181,166,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #0FB5A6 0%, #0c9689 100%)",
                }}
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
