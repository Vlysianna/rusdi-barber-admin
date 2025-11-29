import React, { useEffect, useState } from 'react';
import { Search, Users, TrendingUp, Award } from 'lucide-react';
import { customersAPI, Customer, CustomerFilters } from '../../lib/api';
import { Card, Loading, Alert, EmptyState, Pagination } from '../../shared/components';
import { formatCurrency } from '../../lib/utils/format';
import CustomerTable from './components/CustomerTable';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(20);

  // Filters
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 20,
    search: undefined,
  });

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    avgSpending: 0,
  });

  useEffect(() => {
    loadCustomers();
  }, [filters]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customersAPI.getAll(filters);
      
      if (response.success && response.data) {
        setCustomers(response.data);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
          setCurrentPage(response.pagination.page);
        }

        // Calculate stats
        const totalBookings = response.data.reduce((sum, c) => sum + (c.totalBookings || 0), 0);
        const totalRevenue = response.data.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
        const avgSpending = response.data.length > 0 ? totalRevenue / response.data.length : 0;

        setStats({
          totalCustomers: totalItems,
          totalBookings,
          totalRevenue,
          avgSpending,
        });
      } else {
        setError(response.message || 'Gagal memuat data pelanggan');
      }
    } catch (err) {
      console.error('Load customers error:', err);
      setError('Gagal memuat data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search: search || undefined, page: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pelanggan</h1>
          <p className="text-gray-600 mt-1">Kelola data pelanggan barbershop</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pelanggan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Booking</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalBookings}</p>
            </div>
            <Award className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rata-rata Spending</p>
              <p className="text-xl font-bold text-orange-600">
                {formatCurrency(stats.avgSpending)}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold">₿</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari pelanggan..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Customers Table */}
      {loading && customers.length === 0 ? (
        <Loading size="lg" text="Memuat data pelanggan..." />
      ) : customers.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="w-16 h-16" />}
            title="Belum ada pelanggan"
            description="Data pelanggan akan muncul di sini"
          />
        </Card>
      ) : (
        <>
          <CustomerTable customers={customers} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default CustomerList;
