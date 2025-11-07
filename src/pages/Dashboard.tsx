import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { dashboardService } from "../services/dashboardService";
import { healthService } from "../services/healthService";
import type { DashboardStats } from "../types";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "year"
  >("month");
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    message: string;
  }>({ isConnected: false, message: "Checking connection..." });
  useEffect(() => {
    checkBackendConnection();
    loadDashboardData();
  }, [dateRange]);

  const checkBackendConnection = async () => {
    try {
      const status = await healthService.checkConnection();
      setConnectionStatus(status);
    } catch {
      setConnectionStatus({
        isConnected: false,
        message: "Connection check failed",
      });
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        dateFrom: getDateRangeFilter(dateRange).from,
        dateTo: getDateRangeFilter(dateRange).to,
      };

      console.log("🌐 Loading dashboard data from API");
      const data = await dashboardService.getDashboardStats(filters);
      setStats(data);
    } catch (err) {
      console.error("Dashboard data loading error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const getDateRangeFilter = (range: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case "today":
        return {
          from: today.toISOString().split("T")[0],
          to: today.toISOString().split("T")[0],
        };
      case "week": {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          from: weekStart.toISOString().split("T")[0],
          to: today.toISOString().split("T")[0],
        };
      }
      case "month": {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          from: monthStart.toISOString().split("T")[0],
          to: today.toISOString().split("T")[0],
        };
      }
      case "year": {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return {
          from: yearStart.toISOString().split("T")[0],
          to: today.toISOString().split("T")[0],
        };
      }
      default:
        return {
          from: new Date(today.getFullYear(), today.getMonth(), 1)
            .toISOString()
            .split("T")[0],
          to: today.toISOString().split("T")[0],
        };
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "confirmed":
      case "in_progress":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
      case "no_show":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <Card.Body>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Dashboard
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadDashboardData}>Try Again</Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-2">
              {connectionStatus.isConnected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs font-medium">Online</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-orange-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs font-medium">Demo Mode</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-600">
            {connectionStatus.isConnected
              ? "Selamat datang kembali! Berikut adalah ringkasan bisnis Anda hari ini."
              : "Menampilkan data demo - backend tidak terhubung."}
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="flex space-x-2">
          {(["today", "week", "month", "year"] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "primary" : "ghost"}
              size="sm"
              onClick={() => setDateRange(range)}
            >
              {range === "today"
                ? "Hari Ini"
                : range === "week"
                  ? "Minggu Ini"
                  : range === "month"
                    ? "Bulan Ini"
                    : "Tahun Ini"}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Pelanggan
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalCustomers}
                  </p>
                  <span className="text-green-600 text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    12%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Booking
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalBookings}
                  </p>
                  <span className="text-green-600 text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    8%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Pendapatan
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                  <span className="text-green-600 text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    15%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Rating Rata-rata
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.averageRating &&
                    typeof stats.averageRating === "number" &&
                    !isNaN(stats.averageRating)
                      ? stats.averageRating.toFixed(1)
                      : "0.0"}
                  </p>
                  <span className="text-green-600 text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    0.2
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Booking Hari Ini
              </h3>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-medium">{stats.todayBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="font-medium text-yellow-600">
                  {stats.pendingBookings}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Selesai</span>
                <span className="font-medium text-green-600">
                  {stats.completedBookings}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Status Booking
              </h3>
              <CheckCircle className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stats.bookingsByStatus?.map((status) => (
                <div
                  key={status.status}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-600 capitalize">
                    {status.status.toLowerCase().replace("_", " ")}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{status.count}</span>
                    <span className="text-xs text-gray-500">
                      ({status.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Performa Bulanan
              </h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Booking Bulan Ini</span>
                <span className="font-medium">{stats.monthlyBookings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Dibatalkan</span>
                <span className="font-medium text-red-600">
                  {stats.cancelledBookings}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Tingkat Penyelesaian
                </span>
                <span className="font-medium text-green-600">
                  {stats.totalBookings > 0
                    ? (
                        (stats.completedBookings / stats.totalBookings) *
                        100
                      ).toFixed(1)
                    : "0.0"}
                  %
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Stylists */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900">
              Stylist Terbaik
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4"></div>
          </Card.Body>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Booking Terbaru
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/bookings")}
              >
                Lihat Semua
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {stats?.recentBookings && Array.isArray(stats.recentBookings) ? (
                stats.recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {booking.customer.avatar ? (
                          <img
                            src={booking.customer.avatar}
                            alt={booking.customer.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.customer.fullName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {booking.service.name} • {booking.stylist.user.fullName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(booking.bookingDate).toLocaleDateString(
                          "id-ID",
                        )}{" "}
                        {booking.startTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatCurrency(booking.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent bookings available</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
