import React, { useEffect, useState } from 'react';
import { Search, Star, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { reviewsAPI, Review, ReviewFilters } from '../../lib/api';
import { Card, Button, Badge, Loading, Alert, EmptyState, Pagination } from '../../shared/components';
import { formatDate } from '../../lib/utils/format';
import ReviewCard from './components/ReviewCard';

const ReviewList: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(12);

  // Filters
  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: 12,
    rating: undefined,
    isVisible: undefined,
  });

  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    visibleReviews: 0,
    hiddenReviews: 0,
  });

  useEffect(() => {
    loadReviews();
  }, [filters]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reviewsAPI.getAll(filters);
      
      if (response.success && response.data) {
        setReviews(response.data);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
          setCurrentPage(response.pagination.page);
        }

        // Calculate stats
        const avgRating = response.data.length > 0
          ? response.data.reduce((sum, r) => sum + r.rating, 0) / response.data.length
          : 0;
        
        const visibleReviews = response.data.filter(r => r.isVisible).length;
        const hiddenReviews = response.data.filter(r => !r.isVisible).length;

        setStats({
          totalReviews: totalItems,
          avgRating,
          visibleReviews,
          hiddenReviews,
        });
      } else {
        setError(response.message || 'Gagal memuat data ulasan');
      }
    } catch (err: unknown) {
      console.error('Load reviews error:', err);
      // Handle 404 gracefully - reviews endpoint not implemented yet
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError?.response?.status === 404) {
          setError('Fitur ulasan belum tersedia. Endpoint sedang dalam pengembangan.');
          setReviews([]);
          return;
        }
      }
      setError('Gagal memuat data ulasan');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      const response = await reviewsAPI.toggleVisibility(id);
      if (response.success) {
        loadReviews();
      } else {
        alert(response.message || 'Gagal mengubah visibility');
      }
    } catch (error) {
      console.error('Toggle visibility error:', error);
      alert('Gagal mengubah visibility ulasan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus ulasan ini?')) return;

    try {
      const response = await reviewsAPI.delete(id);
      if (response.success) {
        loadReviews();
      } else {
        alert(response.message || 'Gagal menghapus ulasan');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus ulasan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Ulasan</h1>
          <p className="text-gray-600 mt-1">Kelola ulasan dan rating pelanggan</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ulasan</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rata-rata Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.avgRating.toFixed(1)}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500 fill-current" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ditampilkan</p>
              <p className="text-2xl font-bold text-green-600">{stats.visibleReviews}</p>
            </div>
            <Eye className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disembunyikan</p>
              <p className="text-2xl font-bold text-gray-600">{stats.hiddenReviews}</p>
            </div>
            <EyeOff className="w-8 h-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Rating
            </label>
            <select
              value={filters.rating || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  rating: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Rating</option>
              <option value="5">5 Bintang</option>
              <option value="4">4 Bintang</option>
              <option value="3">3 Bintang</option>
              <option value="2">2 Bintang</option>
              <option value="1">1 Bintang</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              value={
                filters.isVisible === undefined
                  ? ''
                  : filters.isVisible
                  ? 'visible'
                  : 'hidden'
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isVisible:
                    e.target.value === ''
                      ? undefined
                      : e.target.value === 'visible',
                  page: 1,
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua</option>
              <option value="visible">Ditampilkan</option>
              <option value="hidden">Disembunyikan</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reviews Grid */}
      {loading && reviews.length === 0 ? (
        <Loading size="lg" text="Memuat ulasan..." />
      ) : reviews.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MessageSquare className="w-16 h-16" />}
            title="Belum ada ulasan"
            description="Ulasan pelanggan akan muncul di sini"
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onToggleVisibility={handleToggleVisibility}
                onDelete={handleDelete}
              />
            ))}
          </div>

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

export default ReviewList;
