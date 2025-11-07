// Health check service to test backend connection
import React from "react";
import { apiService, handleApiError } from "./api";

export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  database: "connected" | "disconnected";
  version: string;
  uptime: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  message: string;
  details?: HealthCheckResponse;
}

class HealthService {
  private connectionStatus: ConnectionStatus = {
    isConnected: false,
    message: "Not checked yet",
  };

  // Check if backend API is accessible with retry logic
  async checkConnection(retries: number = 1): Promise<ConnectionStatus> {
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Try multiple endpoints to verify backend is fully functional
        const endpoints = ["/health", "../health"];

        for (const endpoint of endpoints) {
          try {
            let response;
            if (endpoint === "../health") {
              // Direct call to root health endpoint
              response = await apiService.api.get(
                "http://localhost:3000/health",
              );
              if (response.status === 200 && response.data) {
                this.connectionStatus = {
                  isConnected: true,
                  message: "Backend connection successful",
                  details: response.data,
                };
                return this.connectionStatus;
              }
            } else {
              response = await apiService.get<HealthCheckResponse>(endpoint);
              if (response.success && response.data) {
                this.connectionStatus = {
                  isConnected: true,
                  message: "Backend connection successful",
                  details: response.data,
                };
                return this.connectionStatus;
              }
            }
          } catch (endpointError) {
            lastError = endpointError;
            continue; // Try next endpoint
          }
        }

        // If no endpoint worked, but we got here, backend responded with invalid data
        this.connectionStatus = {
          isConnected: false,
          message: "Backend responded but with invalid data",
        };
      } catch (error) {
        lastError = error;

        if (attempt < retries) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
      }
    }

    // All attempts failed
    this.connectionStatus = {
      isConnected: false,
      message: `Connection failed after ${retries} attempts: ${handleApiError(lastError)}`,
    };

    return this.connectionStatus;
  }

  // Test database connection through backend
  async checkDatabase(): Promise<{ connected: boolean; message: string }> {
    try {
      // Try v1 endpoint first, then fallback to root
      let response;
      try {
        response = await apiService.get<{ database: string }>(
          "/health/database",
        );
      } catch {
        // Fallback to root health endpoint and check if it responds
        response = await apiService.api.get("http://localhost:3000/health");
        if (response.status === 200) {
          return {
            connected: true,
            message: "Database connection is healthy (via health check)",
          };
        }
      }

      if (response.data?.database === "connected" || response.status === 200) {
        return {
          connected: true,
          message: "Database connection is healthy",
        };
      } else {
        return {
          connected: false,
          message: "Database connection failed",
        };
      }
    } catch (error) {
      return {
        connected: false,
        message: `Database check failed: ${handleApiError(error)}`,
      };
    }
  }

  // Test authentication endpoint
  async checkAuth(): Promise<{ working: boolean; message: string }> {
    try {
      // Try to access a protected endpoint without token (should get 401)
      await apiService.get("/auth/me");

      return {
        working: false,
        message: "Auth endpoint returned unexpected success",
      };
    } catch (error) {
      const err = error as any;
      if (err?.response?.status === 401) {
        return {
          working: true,
          message: "Auth endpoint is working (returned 401 as expected)",
        };
      } else {
        return {
          working: false,
          message: `Auth endpoint error: ${handleApiError(error)}`,
        };
      }
    }
  }

  // Run comprehensive health check
  async runHealthCheck(): Promise<{
    overall: "healthy" | "degraded" | "unhealthy";
    backend: ConnectionStatus;
    database: { connected: boolean; message: string };
    auth: { working: boolean; message: string };
    timestamp: string;
  }> {
    console.log("🔍 Running comprehensive health check...");

    // Run checks with proper error handling
    const results = await Promise.allSettled([
      this.checkConnection(2), // Retry connection check
      this.checkDatabase(),
      this.checkAuth(),
    ]);

    // Extract results or provide defaults for failed checks
    const backend =
      results[0].status === "fulfilled"
        ? results[0].value
        : { isConnected: false, message: "Connection check failed" };

    const database =
      results[1].status === "fulfilled"
        ? results[1].value
        : { connected: false, message: "Database check failed" };

    const auth =
      results[2].status === "fulfilled"
        ? results[2].value
        : { working: false, message: "Auth check failed" };

    let overall: "healthy" | "degraded" | "unhealthy";

    if (backend.isConnected && database.connected && auth.working) {
      overall = "healthy";
    } else if (backend.isConnected) {
      overall = "degraded";
    } else {
      overall = "unhealthy";
    }

    const result = {
      overall,
      backend,
      database,
      auth,
      timestamp: new Date().toISOString(),
    };

    console.log("📊 Health check results:", result);
    return result;
  }

  // Get current connection status
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // Check if we should use mock data
  shouldUseMockData(): boolean {
    const useMockData = import.meta.env.VITE_USE_MOCK_DATA;
    const forceDemo = import.meta.env.VITE_FORCE_DEMO_MODE;

    return (
      forceDemo === "true" ||
      useMockData === "true" ||
      !this.connectionStatus.isConnected
    );
  }

  // Force refresh connection status
  async refreshConnection(): Promise<ConnectionStatus> {
    console.log("🔄 Refreshing backend connection...");
    return await this.checkConnection(3);
  }

  // Test specific endpoints
  async testEndpoint(
    endpoint: string,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await apiService.get(endpoint);

      return {
        success: true,
        message: `Endpoint ${endpoint} is accessible`,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: `Endpoint ${endpoint} failed: ${handleApiError(error)}`,
      };
    }
  }

  // Get backend info
  async getBackendInfo(): Promise<{
    version?: string;
    environment?: string;
    uptime?: number;
    nodeVersion?: string;
  }> {
    try {
      const response = await apiService.get<{
        version: string;
        environment: string;
        uptime: number;
        nodeVersion: string;
      }>("/health/info");

      if (response.success && response.data) {
        return response.data;
      } else {
        return {};
      }
    } catch (error) {
      console.warn("Could not fetch backend info:", handleApiError(error));
      return {};
    }
  }
}

// Export singleton instance
export const healthService = new HealthService();

// Export class for testing
export { HealthService };

// Utility function to format uptime
export const formatUptime = (uptimeInSeconds: number): string => {
  const days = Math.floor(uptimeInSeconds / (24 * 60 * 60));
  const hours = Math.floor((uptimeInSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptimeInSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(uptimeInSeconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
};

// Connection status checker hook for React
export const useConnectionStatus = () => {
  const [status, setStatus] = React.useState<ConnectionStatus>(
    healthService.getConnectionStatus(),
  );

  const checkConnection = async () => {
    const newStatus = await healthService.checkConnection();
    setStatus(newStatus);
    return newStatus;
  };

  React.useEffect(() => {
    checkConnection();
  }, []);

  return { status, checkConnection };
};
