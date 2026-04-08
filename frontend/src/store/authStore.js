import { create } from "zustand";
import axios from "axios";

const API_URL =
  import.meta.env.MODE === "production" ? "/api" : "http://localhost:3000/api";

// Setup axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await api.get("/auth/get-me");
      set({
        user: response.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
      return true;
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
      return false;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/login", { email, password });

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoading: false,
      });
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      set({
        user: response.data.user,
        isAuthenticated: false, // Wait for verification
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Registration failed",
        isLoading: false,
      });
      return false;
    }
  },

  // Note: the backend handles verification directly via redirect
  // But if we need an API call for it or resend:
  resendVerification: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/auth/resend-verification", { email });
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to resend verification",
        isLoading: false,
      });
      return false;
    }
  },

  socialLogin: async (provider, tokenOrCode) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = provider === "google" ? "/auth/google" : "/auth/github";
      // Both backend routes expect { code } in the request body
      const payload = { code: tokenOrCode };

      const response = await api.post(endpoint, payload);

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.message || `${provider} login failed`,
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/auth/logout");
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    } catch {
      // still logout locally even if backend fails
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    }
  },
}));

export default useAuthStore;
