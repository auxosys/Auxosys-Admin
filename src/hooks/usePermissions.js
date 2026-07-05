import { useAuth } from "../context/AuthContext";

export const usePermissions = (moduleName) => {
  const { hasAccess, hasPermission, isLoading } = useAuth();
  
  return {
    canRead: hasAccess(moduleName),
    canWrite: hasPermission(moduleName, "Read & Write"),
    loading: isLoading,
  };
};
