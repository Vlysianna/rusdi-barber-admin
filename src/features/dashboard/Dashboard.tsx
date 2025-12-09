import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Calendar, Users, Star } from 'lucide-react';
import StatCard from './components/StatCard';
import { RevenueChart, BookingsStatusChart, TopServicesChart } from './components/Charts';
import RecentBookingsTable from './components/RecentBookingsTable';
import { Loading, Alert } from '../../shared/components';
import { dashboardAPI, DashboardStats } from '../../lib/api';
import { formatCurrency, formatNumber } from '../../lib/utils/format';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        dateFrom: getDateRangeFilter(dateRange).from,
        dateTo: getDateRangeFilter(dateRange).to,
      };

      const response = await dashboardAPI.getStats(filters);
      
      if (response.success && response.data) {
        console.log('Dashboard data:', response.data);
        setStats(response.data);
      } else {
        console.error('Dashboard response:', response);
        setError(response.message || 'Gagal memuat data dashboard');
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeFilter = (range: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case 'today':
        return {
          from: today.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
        };
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          from: weekStart.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
        };
      }
      case 'month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          from: monthStart.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
        };
      }
      case 'year': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return {
          from: yearStart.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
        };
      }
      default:
        return {
          from: today.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
        };
    }
  };

  if (loading) {
    return <Loading size="lg" text="Memuat dashboard..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert type="error" message={error} />
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!stats) {
    return <Alert type="error" message="Data tidak tersedia" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang di Rusdi Barber</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center space-x-2">
          {['today', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range as typeof dateRange)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {range === 'today' && 'Hari Ini'}
              {range === 'week' && 'Minggu Ini'}
              {range === 'month' && 'Bulan Ini'}
              {range === 'year' && 'Tahun Ini'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pendapatan"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          trend={stats.revenueGrowth}
          trendLabel="vs periode sebelumnya"
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Total Booking"
          value={formatNumber(stats.totalBookings)}
          icon={<Calendar className="w-6 h-6" />}
          trend={stats.bookingsGrowth}
          trendLabel="vs periode sebelumnya"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Pelanggan"
          value={formatNumber(stats.totalCustomers)}
          icon={<Users className="w-6 h-6" />}
          trend={stats.customersGrowth}
          trendLabel="vs periode sebelumnya"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Rating Rata-rata"
          value={stats.averageRating.toFixed(1)}
          icon={<Star className="w-6 h-6" />}
          trend={stats.ratingChange}
          trendLabel="vs periode sebelumnya"
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={stats.revenueByDay} />
        <BookingsStatusChart data={stats.bookingsByStatus} />
      </div>

      {/* Top Services */}
      <TopServicesChart data={stats.topServices} />

      {/* Recent Bookings */}
      <RecentBookingsTable 
        bookings={stats.recentBookings} 
        onViewDetails={(id) => navigate(`/bookings/${id}`)}
      />
    </div>
  );
};

export default Dashboard;
