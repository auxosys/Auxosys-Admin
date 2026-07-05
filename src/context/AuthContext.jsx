import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../helper/apiClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      const res = await apiClient.get("/profile/me");
      setProfile(res.data.data.admin);
    } catch (err) {
      console.error("Failed to fetch profile", err);
      // Optional: Clear token if unauthorized, but ProtectedRoute handles main logic
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const hasAccess = (moduleName) => {
    if (!profile) return false;
    // Superadmin always has full access
    if (profile.role === "Superadmin") return true;
    if (profile.email === "ausosys@gmail.com" || profile.email === "auxosys@gmail.com") return true;
    if (!profile.permissions || !Array.isArray(profile.permissions)) return false;
    
    return profile.permissions.some(p => {
      if (typeof p === 'string') return p === moduleName;
      return p.module === moduleName && (p.access === 'Read' || p.access === 'Read Only' || p.access === 'Read & Write');
    });
  };

  const hasPermission = (moduleName, accessType = "Read & Write") => {
    if (!profile) return false;
    // Superadmin always has full access
    if (profile.role === "Superadmin") return true;
    if (profile.email === "ausosys@gmail.com" || profile.email === "auxosys@gmail.com") return true;
    if (!profile.permissions || !Array.isArray(profile.permissions)) return false;
    
    return profile.permissions.some(p => p.module === moduleName && p.access === accessType);
  };

  return (
    <AuthContext.Provider value={{ profile, isLoading, hasAccess, hasPermission, setProfile, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
