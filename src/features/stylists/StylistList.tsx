import React, { useEffect, useState } from 'react';
import { Plus, Search, Users, Calendar } from 'lucide-react';
import { stylistsAPI, Stylist, StylistFilters } from '../../lib/api';
import { Card, Button, Loading, Alert, EmptyState, Pagination } from '../../shared/components';
import StylistCard from './components/StylistCard';
import StylistFormModal from './components/StylistFormModal';
import StylistScheduleModal from './components/StylistScheduleModal';

const StylistList: React.FC = () => {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(12);

  // Filters
  const [filters, setFilters] = useState<StylistFilters>({
    page: 1,
    limit: 12,
    isActive: undefined,
    search: undefined,
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadStylists();
  }, [filters]);

  const loadStylists = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await stylistsAPI.getAll(filters);
      
      if (response.success && response.data) {
        setStylists(response.data);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
          setCurrentPage(response.pagination.page);
        }
      } else {
        setError(response.message || 'Gagal memuat data stylist');
      }
    } catch (err) {
      console.error('Load stylists error:', err);
      setError('Gagal memuat data stylist');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setFilters({
      ...filters,
      isActive: status === 'all' ? undefined : status === 'active',
      page: 1,
    });
  };

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search: search || undefined, page: 1 });
  };

  const handleCreate = () => {
    setEditingStylist(null);
    setShowFormModal(true);
  };

  const handleEdit = (stylist: Stylist) => {
    setEditingStylist(stylist);
    setShowFormModal(true);
  };

  const handleManageSchedule = (stylist: Stylist) => {
    setSelectedStylist(stylist);
    setShowScheduleModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus stylist ini?')) return;

    try {
      const response = await stylistsAPI.delete(id);
      if (response.success) {
        loadStylists();
      } else {
        alert(response.message || 'Gagal menghapus stylist');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus stylist');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await stylistsAPI.toggleActive(id);
      if (response.success) {
        loadStylists();
      } else {
        alert(response.message || 'Gagal mengubah status');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      alert('Gagal mengubah status stylist');
    }
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setEditingStylist(null);
    loadStylists();
  };

  const handleScheduleSuccess = () => {
    setShowScheduleModal(false);
    setSelectedStylist(null);
    loadStylists();
  };

  const activeStylists = stylists.filter(s => s.isActive).length;
  const totalBookings = stylists.reduce((sum, s) => sum + (s.totalBookings || 0), 0);
  const avgRating = stylists.length > 0
    ? stylists.reduce((sum, s) => sum + (s.rating || 0), 0) / stylists.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Stylist</h1>
          <p className="text-gray-600 mt-1">Kelola tim stylist barbershop</p>
        </div>
        <Button onClick={handleCreate} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Stylist
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stylist</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif</p>
              <p className="text-2xl font-bold text-green-600">{activeStylists}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Booking</p>
              <p className="text-2xl font-bold text-purple-600">{totalBookings}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rata-rata Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{avgRating.toFixed(1)}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-bold">★</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari stylist..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => handleStatusFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => handleStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Nonaktif
            </button>
          </div>
        </div>
      </Card>

      {/* Stylists Grid */}
      {loading && stylists.length === 0 ? (
        <Loading size="lg" text="Memuat data stylist..." />
      ) : stylists.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="w-16 h-16" />}
            title="Belum ada stylist"
            description="Mulai tambahkan stylist untuk tim Anda"
            action={
              <Button onClick={handleCreate} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Stylist Pertama
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stylists.map((stylist) => (
              <StylistCard
                key={stylist.id}
                stylist={stylist}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onManageSchedule={handleManageSchedule}
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

      {/* Form Modal */}
      {showFormModal && (
        <StylistFormModal
          stylist={editingStylist}
          onClose={() => {
            setShowFormModal(false);
            setEditingStylist(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedStylist && (
        <StylistScheduleModal
          stylist={selectedStylist}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedStylist(null);
          }}
          onSuccess={handleScheduleSuccess}
        />
      )}
    </div>
  );
};

export default StylistList;
