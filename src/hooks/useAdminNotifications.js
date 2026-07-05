import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { apiClient } from "../helper/apiClient";
import { useNotificationSettings } from "../context/NotificationContext";

/**
 * Polls the backend every 30 seconds for new enquiries and job applications.
 *
 * Fixes:
 * - Increased poll interval from 7s to 30s to reduce server load
 * - Tracks last-seen counts in a ref (survives re-renders, no stale closures)
 * - Backend no longer holds in-memory state — detection is done here
 * - First poll initializes baseline without showing toasts
 */
const useAdminNotifications = () => {
  const { preferences } = useNotificationSettings();
  const initialized = useRef(false);
  const lastCounts = useRef({ enquiries: 0, jobApplications: 0 });

  useEffect(() => {
    const poll = async () => {
      // Prevent polling if user is logged out (avoids 401 console errors)
      if (!localStorage.getItem("accessToken")) {
        return;
      }

      try {
        const res = await apiClient.get("/notifications/count");
        const { enquiries, jobApplications } = res.data.data;

        if (!initialized.current) {
          // First poll — just set the baseline, no toasts
          lastCounts.current = { enquiries, jobApplications };
          initialized.current = true;
          return;
        }

        if (preferences.newEnquiries && enquiries > lastCounts.current.enquiries) {
          toast.info("📩 New enquiry received");
        }

        if (preferences.jobApplications && jobApplications > lastCounts.current.jobApplications) {
          toast.success("🧑‍💼 New job application received");
        }

        lastCounts.current = { enquiries, jobApplications };
      } catch {
        // Silent fail — notifications are non-critical
      }
    };

    poll();
    const interval = setInterval(poll, 30000); // Poll every 30s (was 7s)
    return () => clearInterval(interval);
  }, [preferences]);
};

export default useAdminNotifications;
