// src/api/client.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const API_BASE_URL = "http://127.0.0.1:8000/api";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", {
      email: email,
      password,
    });
    return response.data;
  },

  signup: async ({
    first_name,
    last_name,
    email,
    password,
  }: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    const response = await apiClient.post("/auth/signup", {
      email,
      password,
      first_name,
      last_name,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async () => {
    const response = await apiClient.get("/tasks");
    return response.data;
  },

  getTask: async (taskId: string) => {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (data: {
    user_task_name: string;
    planned_start_date?: string;
    planned_end_date?: string;
    estimated_effort_min?: number;
  }) => {
    const response = await apiClient.post("/tasks", data);
    return response.data;
  },

  updateTask: async (
    taskId: string,
    data: Partial<{
      user_task_name: string;
      planned_start_date?: string;
      planned_end_date?: string;
      estimated_effort_min?: number;
      status?: string;
    }>
  ) => {
    const response = await apiClient.put(`/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (taskId: string) => {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  },

  getTotalTimeSpent: async (taskId: string) => {
    const response = await apiClient.get(`/tasks/${taskId}/total-time-spent`);
    return response.data;
  },
};

// Time Sessions API
export const timeSessionsAPI = {
  startTimer: async (taskId: string, notes?: string) => {
    const response = await apiClient.post("/time-sessions/start", {
      task_id: taskId,
      notes,
    });
    return response.data;
  },

  stopTimer: async (taskId: string, notes?: string) => {
    const response = await apiClient.post("/time-sessions/stop", {
      task_id: taskId,
      notes,
    });
    return response.data;
  },

  getTimeSessions: async () => {
    const response = await apiClient.get("/time-sessions");
    return response.data;
  },
};

// CDS API
export const cdsAPI = {
  getCurrentDaySummary: async () => {
    const response = await apiClient.get("/cds/current-day-summary");
    return response.data;
  },
};
