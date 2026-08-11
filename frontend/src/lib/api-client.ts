import axios from "axios";

import { clearToken, getToken } from "@/lib/token-storage";

/** Fired when a request that carried a Bearer token comes back 401 (expired/invalid session). */
const UNAUTHORIZED_EVENT = "stayfit:unauthorized";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Only requests that were actually authenticated represent a session that
      // just went invalid — a 401 from /auth/login (bad credentials) carries no
      // Authorization header and must stay a local, inline form error instead.
      const hadToken = Boolean(error.config?.headers?.Authorization);
      if (hadToken) {
        clearToken();
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
    }
    return Promise.reject(error);
  },
);

export { apiClient, UNAUTHORIZED_EVENT };
