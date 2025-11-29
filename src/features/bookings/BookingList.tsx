import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Search, Filter } from 'lucide-react';
import { bookingsAPI, Booking, BookingFilters } from '../../lib/api';
import { Card, Button, Badge, Loading, Alert, EmptyState, Pagination } from '../../shared/components';
import { formatCurrency, formatDate } from '../../lib/utils/format';
import BookingFiltersPanel from './components/BookingFiltersPanel';
import BookingTable from './components/BookingTable';

const BookingList: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 10,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadBookings();
  }, [filters]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingsAPI.getAll(filters);
      
      if (response.success && response.data) {
        setBookings(response.data);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
          setCurrentPage(response.pagination.page);
        }
      } else {
        setError(response.message || 'Gagal memuat data booking');
      }
    } catch (err) {
      console.error('Load bookings error:', err);
      setError('Gagal memuat data booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleFilterChange = (newFilters: Partial<BookingFilters>) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handleViewDetail = (id: string) => {
    navigate(`/bookings/${id}`);
  };

  const handleCreateNew = () => {
    navigate('/bookings/new');
  };

  const handleStatusUpdate = async (id: string, action: 'confirm' | 'cancel' | 'complete') => {
    try {
      let response;
      
      if (action === 'confirm') {
        response = await bookingsAPI.confirm(id);
      } else if (action === 'complete') {
        response = await bookingsAPI.complete(id);
      } else {
        const reason = prompt('Alasan pembatalan:');
        if (!reason) return;
        response = await bookingsAPI.cancel(id, reason);
      }

      if (response.success) {
        loadBookings();
      } else {
        alert(response.message || 'Gagal update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      alert('Gagal update status booking');
    }
  };

  if (loading && bookings.length === 0) {
    return <Loading size="lg" text="Memuat data booking..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-1">Kelola semua booking dan appointment</p>
        </div>
        <Button onClick={handleCreateNew} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Booking Baru
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Booking</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Menunggu</p>
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-bold">!</span>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dikonfirmasi</p>
              <p className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">✓</span>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Selesai</p>
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'completed').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari customer, stylist, atau layanan..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  // Implement search functionality
                }}
              />
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {showFilters && (
          <BookingFiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}
      </Card>

      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Calendar className="w-16 h-16" />}
            title="Belum ada booking"
            description="Mulai buat booking baru untuk melihat data di sini"
            action={
              <Button onClick={handleCreateNew} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Buat Booking Baru
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <BookingTable
            bookings={bookings}
            onViewDetail={handleViewDetail}
            onStatusUpdate={handleStatusUpdate}
            loading={loading}
          />

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

export default BookingList;
