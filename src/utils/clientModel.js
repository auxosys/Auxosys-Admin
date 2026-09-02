/**
 * Single source of truth for client status values and the shape of a
 * client record. Imported by both the backend (validation) and the
 * frontend (dropdowns, badges) so the two never drift apart.
 */

export const CLIENT_STATUSES = [
  "Lead",
  "In Discussion",
  "Proposal Sent",
  "On Hold",
  "Closed/Confirmed",
  "Not Proceeding",
  "Inactive",
];

export const DEFAULT_STATUS = "Lead";

// Used for the colored status badge/pill in the table and detail view.
export const STATUS_COLORS = {
  "Lead": { bg: "#EAF1F7", fg: "#1F4B6E" },
  "In Discussion": { bg: "#FFF4E0", fg: "#8A5A00" },
  "Proposal Sent": { bg: "#EAF3FF", fg: "#1D4ED8" },
  "On Hold": { bg: "#F1F1F1", fg: "#5A6472" },
  "Closed/Confirmed": { bg: "#E6F6EC", fg: "#1B6E3C" },
  "Not Proceeding": { bg: "#FBEAEA", fg: "#B3261E" },
  "Inactive": { bg: "#F1F1F1", fg: "#8B93A0" },
};

/** Required fields for creating a client. Kept intentionally small. */
export const REQUIRED_FIELDS = ["companyName", "contactPerson", "phone"];

export function emptyClient() {
  return {
    companyName: "",
    contactPerson: "",
    email: "",
    phoneCountryCode: "+91",
    phone: "",
    whatsappCountryCode: "+91",
    whatsapp: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
    industry: "",
    status: DEFAULT_STATUS,
    notes: "",
  };
}

export function validateClient(data) {
  const errors = {};
  if (!data.companyName?.trim()) errors.companyName = "Client / Company name is required";
  if (!data.contactPerson?.trim()) errors.contactPerson = "Contact person is required";
  if (data.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = "Enter a valid email";
  if (!data.phone?.trim()) errors.phone = "Phone number is required";
  if (data.status && !CLIENT_STATUSES.includes(data.status)) errors.status = "Invalid status";
  return errors;
}
