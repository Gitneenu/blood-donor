import axios from "axios";

// The React app ONLY talks to FastAPI - never directly to Supabase.
// FastAPI holds the service_role key server-side.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

export default api;

// ---- Volunteers ----
export const createVolunteer = (data) => api.post("/volunteers", data);
export const listVolunteers = () => api.get("/volunteers");

// ---- Donors ----
export const registerDonor = (data) => api.post("/donors", data);
export const listDonors = (params) => api.get("/donors", { params });
export const updateDonor = (id, data) => api.patch(`/donors/${id}`, data);

// ---- Requests ----
export const createRequest = (data) => api.post("/requests", data);
export const listRequests = (status) =>
  api.get("/requests", { params: status ? { status } : {} });
export const getRequest = (id) => api.get(`/requests/${id}`);
export const getEligibleDonors = (id) => api.get(`/requests/${id}/eligible-donors`);
export const broadcastRequest = (id) => api.post(`/requests/${id}/broadcast`);
export const cancelRequest = (id) => api.post(`/requests/${id}/cancel`);

// ---- Donations ----
export const addDonorToRequest = (requestId, donorId) =>
  api.post(`/requests/${requestId}/donations`, { donor_id: donorId });
export const listDonationsForRequest = (requestId) =>
  api.get(`/requests/${requestId}/donations`);
export const updateDonationStatus = (requestId, donationId, status) =>
  api.patch(`/requests/${requestId}/donations/${donationId}`, { status });

// ---- Summary ----
export const getSummary = () => api.get("/summary");
