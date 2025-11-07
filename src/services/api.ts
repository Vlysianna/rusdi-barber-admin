import axios from "axios";
import type { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import type { ApiResponse, PaginatedResponse } from "../types";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token =
          localStorage.getItem("authToken") ||
          sessionStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        // Handle common errors
        if (error.response && error.response.status === 401) {
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }

        if (error.response && error.response.status === 403) {
          // Forbidden - show access denied message
          console.error("Access denied");
        }

        if (error.response && error.response.status >= 500) {
          // Server error
          console.error("Server error:", error.message);
        }

        return Promise.reject(error);
      },
    );
  }

  // Generic methods
  async get<T>(
    url: string,
    params?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(url, { params });
      return response.data;
    } catch (error) {
      console.error(`API GET ${url} failed:`, error);
      throw error;
    }
  }

  async post<T>(
    url: string,
    data?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, data);
      return response.data;
    } catch (error) {
      console.error(`API POST ${url} failed:`, error);
      throw error;
    }
  }

  async put<T>(
    url: string,
    data?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data);
      return response.data;
    } catch (error) {
      console.error(`API PUT ${url} failed:`, error);
      throw error;
    }
  }

  async patch<T>(
    url: string,
    data?: Record<string, unknown>,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch(url, data);
      return response.data;
    } catch (error) {
      console.error(`API PATCH ${url} failed:`, error);
      throw error;
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url);
      return response.data;
    } catch (error) {
      console.error(`API DELETE ${url} failed:`, error);
      throw error;
    }
  }

  async upload<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`API UPLOAD ${url} failed:`, error);
      throw error;
    }
  }

  // Paginated requests
  async getPaginated<T>(
    url: string,
    params?: Record<string, unknown>,
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await this.api.get(url, { params });
      return response.data.data;
    } catch (error) {
      console.error(`API GET PAGINATED ${url} failed:`, error);
      throw error;
    }
  }

  // Expose axios instance for direct access when needed
  get api() {
    return this.api;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing
export { ApiService };

// Error handling utilities
export const handleApiError = (error: unknown): string => {
  const err = error as any;
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }

  if (err?.response?.data?.error) {
    return err.response.data.error;
  }

  if (err?.message) {
    return err.message;
  }

  return "An unexpected error occurred";
};

// Request/Response type helpers
export interface ApiRequestConfig {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export const buildPaginationParams = (
  page: number = 1,
  limit: number = 10,
  sort?: string,
  order: "asc" | "desc" = "desc",
): PaginationParams => {
  const params: PaginationParams = { page, limit };

  if (sort) {
    params.sort = sort;
    params.order = order;
  }

  return params;
};
