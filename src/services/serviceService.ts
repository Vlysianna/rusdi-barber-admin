import { apiService, handleApiError } from "./api";
import type { Service } from "../types";

export interface CreateServiceData {
  name: string;
  description: string;
  price: string;
  duration: number;
  category: string;
  isActive: boolean;
  isPopular?: boolean;
  requirements?: string[];
  instructions?: string;
  image?: string;
  tags?: string[];
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: string;
  duration?: number;
  category?: string;
  isActive?: boolean;
  isPopular?: boolean;
  requirements?: string[];
  instructions?: string;
  image?: string;
  tags?: string[];
}

export interface ServiceFilters {
  category?: string;
  isActive?: boolean;
  isPopular?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ServiceAnalytics {
  serviceId: string;
  totalBookings: number;
  totalRevenue: string;
  averageRating: number;
  popularityRank: number;
  monthlyStats: {
    month: string;
    bookings: number;
    revenue: string;
  }[];
  customerSatisfaction: {
    rating: number;
    count: number;
  }[];
}

class ServiceService {
  /**
   * Get all services
   */
  async getAllServices(filters?: ServiceFilters): Promise<Service[]> {
    try {
      const response = await apiService.get<Service[]>("/services", filters);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch services");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<Service> {
    try {
      const response = await apiService.get<Service>(`/services/${id}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch service");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new service
   */
  async createService(data: CreateServiceData): Promise<Service> {
    try {
      const response = await apiService.post<Service>("/services", data);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create service");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update service
   */
  async updateService(id: string, data: UpdateServiceData): Promise<Service> {
    try {
      const response = await apiService.put<Service>(`/services/${id}`, data);

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update service");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete service
   */
  async deleteService(id: string): Promise<void> {
    try {
      const response = await apiService.delete(`/services/${id}`);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete service");
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get active services (for booking)
   */
  async getActiveServices(): Promise<Service[]> {
    try {
      const response = await apiService.get<Service[]>("/services/active");

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch active services");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get popular services
   */
  async getPopularServices(limit: number = 10): Promise<Service[]> {
    try {
      const response = await apiService.get<Service[]>("/services/popular", {
        limit,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch popular services");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(category: string): Promise<Service[]> {
    try {
      const response = await apiService.get<Service[]>(
        `/services/category/${category}`,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch services by category",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get service categories
   */
  async getServiceCategories(): Promise<
    { value: string; label: string; count: number }[]
  > {
    try {
      const response = await apiService.get<
        { value: string; label: string; count: number }[]
      >("/services/categories");

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch service categories",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get service analytics
   */
  async getServiceAnalytics(
    id: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<ServiceAnalytics> {
    try {
      const response = await apiService.get<ServiceAnalytics>(
        `/services/${id}/analytics`,
        { dateFrom, dateTo },
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch service analytics",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update service status (active/inactive)
   */
  async updateServiceStatus(id: string, isActive: boolean): Promise<Service> {
    try {
      const response = await apiService.patch<Service>(
        `/services/${id}/status`,
        {
          isActive,
        },
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update service status");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Toggle service popularity
   */
  async toggleServicePopularity(id: string): Promise<Service> {
    try {
      const response = await apiService.post<Service>(
        `/services/${id}/toggle-popular`,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to toggle service popularity",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Upload service image
   */
  async uploadServiceImage(id: string, imageFile: File): Promise<Service> {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await apiService.post<Service>(
        `/services/${id}/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to upload service image");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get service reviews
   */
  async getServiceReviews(
    id: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    reviews: any[];
    total: number;
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    try {
      const response = await apiService.get<any>(`/services/${id}/reviews`, {
        page,
        limit,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch service reviews");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get services for a specific stylist
   */
  async getServicesByStylist(stylistId: string): Promise<Service[]> {
    try {
      const response = await apiService.get<Service[]>(
        `/services/stylist/${stylistId}`,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch services by stylist",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get service pricing history
   */
  async getServicePricingHistory(id: string): Promise<{
    priceHistory: {
      price: string;
      effectiveDate: string;
      changedBy: string;
    }[];
    currentPrice: string;
  }> {
    try {
      const response = await apiService.get<any>(
        `/services/${id}/pricing-history`,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch service pricing history",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Bulk update services
   */
  async bulkUpdateServices(
    serviceIds: string[],
    updates: Partial<UpdateServiceData>,
  ): Promise<Service[]> {
    try {
      const response = await apiService.patch<Service[]>(
        "/services/bulk-update",
        {
          serviceIds,
          updates,
        },
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to bulk update services");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get service availability for a specific date/time
   */
  async getServiceAvailability(
    serviceId: string,
    date: string,
    time: string,
  ): Promise<{
    isAvailable: boolean;
    availableStylists: any[];
    nextAvailableSlot?: string;
  }> {
    try {
      const response = await apiService.get<any>(
        `/services/${serviceId}/availability`,
        {
          date,
          time,
        },
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to check service availability",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get recommended services for a customer
   */
  async getRecommendedServices(customerId?: string): Promise<Service[]> {
    try {
      const response = await apiService.get<Service[]>(
        "/services/recommended",
        {
          customerId,
        },
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || "Failed to fetch recommended services",
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Export services data
   */
  async exportServices(format: "csv" | "excel" = "csv"): Promise<Blob> {
    try {
      const response = await apiService.get(
        `/services/export`,
        {
          format,
        },
        {
          responseType: "blob",
        },
      );

      if (!response.data) {
        throw new Error("Failed to export services data");
      }

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const serviceService = new ServiceService();

// Export class for testing
export { ServiceService };
