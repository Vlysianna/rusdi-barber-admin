import React, { useEffect, useState } from 'react';
import { Search, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { paymentsAPI, Payment, PaymentFilters } from '../../lib/api';
import { Card, Button, Badge, Loading, Alert, EmptyState, Pagination } from '../../shared/components';
import { formatCurrency, formatDate } from '../../lib/utils/format';
import PaymentTable from './components/PaymentTable';
import PaymentFiltersPanel from './components/PaymentFiltersPanel';

const PaymentList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(20);

  // Filters
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 20,
    status: undefined,
    paymentMethod: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    completedCount: 0,
    refundedCount: 0,
  });

  useEffect(() => {
    loadPayments();
  }, [filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await paymentsAPI.getAll(filters);
      
      if (response.success && response.data) {
        setPayments(response.data);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
          setCurrentPage(response.pagination.page);
        }

        // Calculate stats
        const totalRevenue = response.data
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0);
        
        const pendingAmount = response.data
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0);

        const completedCount = response.data.filter(p => p.status === 'completed').length;
        const refundedCount = response.data.filter(p => p.status === 'refunded').length;

        setStats({
          totalRevenue,
          pendingAmount,
          completedCount,
          refundedCount,
        });
      } else {
        setError(response.message || 'Gagal memuat data pembayaran');
      }
    } catch (err) {
      console.error('Load payments error:', err);
      setError('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleFilterChange = (newFilters: Partial<PaymentFilters>) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handleRefund = async (id: string) => {
    if (!confirm('Yakin ingin melakukan refund pembayaran ini?')) return;

    try {
      const response = await paymentsAPI.refund(id);
      if (response.success) {
        loadPayments();
      } else {
        alert(response.message || 'Gagal melakukan refund');
      }
    } catch (error) {
      console.error('Refund error:', error);
      alert('Gagal melakukan refund');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pembayaran</h1>
          <p className="text-gray-600 mt-1">Kelola transaksi dan pembayaran</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.pendingAmount)}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Selesai</p>
              <p className="text-2xl font-bold text-blue-600">{stats.completedCount}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Refund</p>
              <p className="text-2xl font-bold text-red-600">{stats.refundedCount}</p>
            </div>
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">↩</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <PaymentFiltersPanel filters={filters} onFilterChange={handleFilterChange} />

      {/* Payments Table */}
      {loading && payments.length === 0 ? (
        <Loading size="lg" text="Memuat data pembayaran..." />
      ) : payments.length === 0 ? (
        <Card>
          <EmptyState
            icon={<DollarSign className="w-16 h-16" />}
            title="Belum ada transaksi"
            description="Transaksi pembayaran akan muncul di sini"
          />
        </Card>
      ) : (
        <>
          <PaymentTable payments={payments} onRefund={handleRefund} />

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

export default PaymentList;
