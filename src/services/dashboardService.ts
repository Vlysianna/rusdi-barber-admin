import { apiService, handleApiError, buildPaginationParams } from "./api";
import type {
  DashboardStats,
  TopStylist,
  MonthlyRevenue,
  BookingStatusCount,
  Booking,
  ApiResponse,
} from "../types";

export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  stylistId?: string;
  serviceId?: string;
}

export interface RevenueAnalytics {
  totalRevenue: string;
  monthlyGrowth: number;
  dailyRevenue: { date: string; amount: string }[];
  revenueByService: { serviceName: string; revenue: string; count: number }[];
  revenueByPaymentMethod: {
    method: string;
    amount: string;
    percentage: number;
  }[];
}

export interface BookingAnalytics {
  totalBookings: number;
  monthlyGrowth: number;
  bookingsByStatus: BookingStatusCount[];
  bookingsByHour: { hour: number; count: number }[];
  bookingsByDay: { day: string; count: number }[];
  averageBookingValue: string;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerGrowth: number;
  topCustomers: {
    id: string;
    name: string;
    avatar?: string;
    totalBookings: number;
    totalSpent: string;
    lastBooking: string;
  }[];
  customerRetentionRate: number;
}

export interface StylistAnalytics {
  totalStylists: number;
  averageRating: number;
  topStylists: TopStylist[];
  stylistPerformance: {
    stylistId: string;
    name: string;
    avatar?: string;
    bookingsCount: number;
    revenue: string;
    rating: number;
    utilizationRate: number;
  }[];
}

class DashboardService {
  // Transform backend response to frontend format
  private transformBackendResponse(backendData: any): DashboardStats {
    // Handle both new flat format and legacy nested format
    const isNewFormat = backendData.totalCustomers !== undefined;

    if (isNewFormat) {
      // New flat format matching DashboardStats interface
      return {
        totalCustomers: backendData.totalCustomers || 0,
        totalBookings: backendData.totalBookings || 0,
        totalRevenue: backendData.totalRevenue || "0",
        averageRating:
          typeof backendData.averageRating === "number"
            ? backendData.averageRating
            : 0,
        todayBookings: backendData.todayBookings || 0,
        pendingBookings: backendData.pendingBookings || 0,
        completedBookings: backendData.completedBookings || 0,
        cancelledBookings: backendData.cancelledBookings || 0,
        monthlyBookings: backendData.monthlyBookings || 0,
        bookingsByStatus: backendData.bookingsByStatus || [],
        topStylists: backendData.topStylists || [],
        recentBookings: backendData.recentBookings || [],
        monthlyRevenue: backendData.monthlyRevenue || [],
      };
    } else {
      // Legacy nested format - transform to flat format
      return {
        totalCustomers:
          backendData.users?.totalUsers ||
          backendData._detailed?.users?.totalUsers ||
          0,
        totalBookings:
          backendData.bookings?.totalBookings ||
          backendData._detailed?.bookings?.totalBookings ||
          0,
        totalRevenue:
          backendData.payments?.totalRevenue?.toString() ||
          backendData._detailed?.payments?.totalRevenue?.toString() ||
          "0",
        averageRating:
          backendData.reviews?.averageRating ||
          backendData._detailed?.reviews?.averageRating ||
          0,
        todayBookings:
          backendData.bookings?.todayBookings ||
          backendData._detailed?.bookings?.todayBookings ||
          0,
        pendingBookings:
          backendData.bookings?.pendingBookings ||
          backendData._detailed?.bookings?.pendingBookings ||
          0,
        completedBookings:
          backendData.bookings?.completedBookings ||
          backendData._detailed?.bookings?.completedBookings ||
          0,
        cancelledBookings:
          backendData.bookings?.cancelledBookings ||
          backendData._detailed?.bookings?.cancelledBookings ||
          0,
        monthlyBookings:
          backendData.bookings?.thisMonthBookings ||
          backendData._detailed?.bookings?.thisMonthBookings ||
          0,
        bookingsByStatus: this.transformBookingsByStatus(backendData),
        topStylists: [], // Will be populated separately
        recentBookings: [], // Will be populated separately
        monthlyRevenue: [], // Will be populated separately
      };
    }
  }

  private transformBookingsByStatus(backendData: any): BookingStatusCount[] {
    // Check if already transformed in new format
    if (Array.isArray(backendData.bookingsByStatus)) {
      return backendData.bookingsByStatus;
    }

    // Transform from legacy nested format
    const bookings =
      backendData.bookings || backendData._detailed?.bookings || {};
    const total = bookings.totalBookings || 1; // Avoid division by zero

    return [
      {
        status: "pending",
        count: bookings.pendingBookings || 0,
        percentage:
          total > 0 ? ((bookings.pendingBookings || 0) / total) * 100 : 0,
      },
      {
        status: "confirmed",
        count: bookings.confirmedBookings || 0,
        percentage:
          total > 0 ? ((bookings.confirmedBookings || 0) / total) * 100 : 0,
      },
      {
        status: "completed",
        count: bookings.completedBookings || 0,
        percentage:
          total > 0 ? ((bookings.completedBookings || 0) / total) * 100 : 0,
      },
      {
        status: "cancelled",
        count: bookings.cancelledBookings || 0,
        percentage:
          total > 0 ? ((bookings.cancelledBookings || 0) / total) * 100 : 0,
      },
    ];
  }

  async getDashboardStats(filters?: DashboardFilters): Promise<DashboardStats> {
    try {
      console.log("🔄 Fetching dashboard stats from backend...");
      const response = await apiService.get<any>("/dashboard/stats", filters);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch dashboard stats");
      }

      console.log("✅ Dashboard stats loaded from backend", response.data);

      // Transform backend response to frontend format
      const dashboardStats = this.transformBackendResponse(response.data);

      // Ensure averageRating is a valid number
      if (
        typeof dashboardStats.averageRating !== "number" ||
        isNaN(dashboardStats.averageRating)
      ) {
        dashboardStats.averageRating = 0;
      }

      // Fetch additional data if not already provided by backend
      if (
        !dashboardStats.topStylists.length ||
        !dashboardStats.recentBookings.length
      ) {
        try {
          const [topStylists, recentBookings] = await Promise.allSettled([
            this.getTopStylists(5),
            this.getRecentBookings(5),
          ]);

          if (
            topStylists.status === "fulfilled" &&
            !dashboardStats.topStylists.length
          ) {
            dashboardStats.topStylists = topStylists.value;
          }

          if (
            recentBookings.status === "fulfilled" &&
            !dashboardStats.recentBookings.length
          ) {
            dashboardStats.recentBookings = recentBookings.value;
          }
        } catch (additionalDataError) {
          console.warn(
            "Could not fetch additional dashboard data:",
            additionalDataError,
          );
        }
      }

      return dashboardStats;
    } catch (error) {
      console.warn(
        "⚠️ Backend unavailable, using mock data:",
        handleApiError(error),
      );

      // Import and use mock data as fallback
      const { mockDashboardService } = await import("./mockDashboardService");
      return await mockDashboardService.getDashboardStats(filters);
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(
    filters?: DashboardFilters,
  ): Promise<RevenueAnalytics> {
    try {
      console.log("🔄 Fetching revenue analytics from backend...");
      const response = await apiService.get<RevenueAnalytics>(
        "/dashboard/revenue",
        filters,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch revenue analytics",
        );
      }

      return response.data;
    } catch (error) {
      console.warn("⚠️ Revenue analytics backend unavailable, using mock data");
      // Return mock revenue analytics
      return {
        totalRevenue: "15000000",
        monthlyGrowth: 12.5,
        dailyRevenue: [],
        revenueByService: [],
        revenueByPaymentMethod: [],
      };
    }
  }

  // Get booking analytics
  async getBookingAnalytics(
    filters?: DashboardFilters,
  ): Promise<BookingAnalytics> {
    try {
      console.log("🔄 Fetching booking analytics from backend...");
      const response = await apiService.get<BookingAnalytics>(
        "/dashboard/trends",
        filters,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch booking analytics",
        );
      }

      return response.data;
    } catch (error) {
      console.warn("⚠️ Booking analytics backend unavailable, using mock data");
      // Return mock booking analytics
      return {
        totalBookings: 156,
        monthlyGrowth: 8.2,
        bookingsByStatus: [],
        bookingsByHour: [],
        bookingsByDay: [],
        averageBookingValue: "85000",
      };
    }
  }

  // Get customer analytics
  async getCustomerAnalytics(
    filters?: DashboardFilters,
  ): Promise<CustomerAnalytics> {
    try {
      console.log("🔄 Fetching customer analytics from backend...");
      const response = await apiService.get<CustomerAnalytics>(
        "/dashboard/analytics/customers",
        filters,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch customer analytics",
        );
      }

      return response.data;
    } catch (error) {
      console.warn(
        "⚠️ Customer analytics backend unavailable, using mock data",
      );
      // Return mock customer analytics
      return {
        totalCustomers: 89,
        newCustomers: 12,
        returningCustomers: 77,
        customerGrowth: 15.3,
        topCustomers: [],
        customerRetentionRate: 85.2,
      };
    }
  }

  // Get stylist analytics
  async getStylistAnalytics(
    filters?: DashboardFilters,
  ): Promise<StylistAnalytics> {
    try {
      console.log("🔄 Fetching stylist analytics from backend...");
      const response = await apiService.get<StylistAnalytics>(
        "/dashboard/analytics/stylists",
        filters,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch stylist analytics",
        );
      }

      return response.data;
    } catch (error) {
      console.warn("⚠️ Stylist analytics backend unavailable, using mock data");
      // Return mock stylist analytics
      return {
        totalStylists: 5,
        averageRating: 4.7,
        topStylists: [],
        stylistPerformance: [],
      };
    }
  }

  // Get recent bookings
  async getRecentBookings(limit: number = 10): Promise<Booking[]> {
    try {
      console.log("🔄 Fetching recent bookings from backend...");
      const params = buildPaginationParams(1, limit, "createdAt", "desc");
      const response = await apiService.get<Booking[]>("/bookings", {
        ...params,
        recent: true,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch recent bookings");
      }

      return response.data;
    } catch (error) {
      console.warn("⚠️ Recent bookings backend unavailable, using mock data");
      // Return empty array as fallback
      return [];
    }
  }

  // Get top performing stylists
  async getTopStylists(
    limit: number = 5,
    period: "week" | "month" | "year" = "month",
  ): Promise<TopStylist[]> {
    try {
      console.log("🔄 Fetching top stylists from backend...");
      const response = await apiService.get<TopStylist[]>("/users", {
        limit,
        period,
        role: "stylist",
        top: true,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch top stylists");
      }

      return response.data;
    } catch (error) {
      console.warn("⚠️ Top stylists backend unavailable, using mock data");
      // Return empty array as fallback
      return [];
    }
  }

  // Get monthly revenue trend
  async getMonthlyRevenue(months: number = 12): Promise<MonthlyRevenue[]> {
    try {
      const response = await apiService.get<MonthlyRevenue[]>(
        "/dashboard/monthly-revenue",
        {
          months,
        },
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch monthly revenue");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get booking status distribution
  async getBookingStatusDistribution(
    filters?: DashboardFilters,
  ): Promise<BookingStatusCount[]> {
    try {
      const response = await apiService.get<BookingStatusCount[]>(
        "/dashboard/booking-status",
        filters,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch booking status distribution",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Export reports
  async exportReport(
    type: "revenue" | "bookings" | "customers" | "stylists",
    format: "csv" | "xlsx" | "pdf",
    filters?: DashboardFilters,
  ): Promise<Blob> {
    try {
      const response = await apiService.api.get(`/dashboard/export/${type}`, {
        params: { format, ...filters },
        responseType: "blob",
      });

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get real-time stats (WebSocket would be better for this)
  async getRealTimeStats(): Promise<{
    onlineStylists: number;
    todayBookings: number;
    pendingPayments: number;
    activeCustomers: number;
  }> {
    try {
      const response = await apiService.get("/dashboard/realtime-stats");

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch real-time stats");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get service popularity
  async getServicePopularity(limit: number = 10): Promise<
    {
      serviceId: string;
      serviceName: string;
      bookingsCount: number;
      revenue: string;
      averageRating: number;
    }[]
  > {
    try {
      const response = await apiService.get("/dashboard/service-popularity", {
        limit,
      });

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch service popularity",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get peak hours analysis
  async getPeakHours(): Promise<
    {
      hour: number;
      bookingsCount: number;
      utilizationRate: number;
    }[]
  > {
    try {
      const response = await apiService.get("/dashboard/peak-hours");

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch peak hours");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Get customer satisfaction metrics
  async getCustomerSatisfaction(): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { rating: number; count: number; percentage: number }[];
    satisfactionTrend: { month: string; rating: number }[];
  }> {
    try {
      const response = await apiService.get("/dashboard/customer-satisfaction");

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch customer satisfaction",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();

// Export class for testing
export { DashboardService };
