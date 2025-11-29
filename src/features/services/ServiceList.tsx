import React, { useEffect, useState } from 'react';
import { Plus, Search, Scissors } from 'lucide-react';
import { servicesAPI, Service, ServiceFilters } from '../../lib/api';
import { Card, Button, Badge, Loading, Alert, EmptyState, Pagination } from '../../shared/components';
import { formatCurrency } from '../../lib/utils/format';
import ServiceCard from './components/ServiceCard';
import ServiceFormModal from './components/ServiceFormModal';

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(12);

  // Filters
  const [filters, setFilters] = useState<ServiceFilters>({
    page: 1,
    limit: 12,
    category: undefined,
    isActive: undefined,
    search: undefined,
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'haircut', label: 'Potong Rambut' },
    { value: 'beard_trim', label: 'Cukur Jenggot' },
    { value: 'hair_wash', label: 'Keramas' },
    { value: 'styling', label: 'Styling' },
    { value: 'coloring', label: 'Pewarnaan' },
    { value: 'treatment', label: 'Perawatan' },
    { value: 'package', label: 'Paket' },
  ];

  useEffect(() => {
    loadServices();
  }, [filters]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await servicesAPI.getAll(filters);
      
      if (response.success && response.data) {
        setServices(response.data);
        
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
          setCurrentPage(response.pagination.page);
        }
      } else {
        setError(response.message || 'Gagal memuat data layanan');
      }
    } catch (err) {
      console.error('Load services error:', err);
      setError('Gagal memuat data layanan');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setFilters({
      ...filters,
      category: category === 'all' ? undefined : category,
      page: 1,
    });
  };

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search: search || undefined, page: 1 });
  };

  const handleCreate = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus layanan ini?')) return;

    try {
      const response = await servicesAPI.delete(id);
      if (response.success) {
        loadServices();
      } else {
        alert(response.message || 'Gagal menghapus layanan');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus layanan');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await servicesAPI.toggleActive(id);
      if (response.success) {
        loadServices();
      } else {
        alert(response.message || 'Gagal mengubah status');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      alert('Gagal mengubah status layanan');
    }
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setEditingService(null);
    loadServices();
  };

  const activeServices = services.filter(s => s.isActive).length;
  const popularServices = services.filter(s => s.isPopular).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Layanan</h1>
          <p className="text-gray-600 mt-1">Kelola semua layanan barbershop</p>
        </div>
        <Button onClick={handleCreate} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Layanan
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Layanan</p>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <Scissors className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif</p>
              <p className="text-2xl font-bold text-green-600">{activeServices}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Populer</p>
              <p className="text-2xl font-bold text-yellow-600">{popularServices}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-bold">⭐</span>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kategori</p>
              <p className="text-2xl font-bold text-purple-600">7</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">#</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Category Filter */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari layanan..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Services Grid */}
      {loading && services.length === 0 ? (
        <Loading size="lg" text="Memuat layanan..." />
      ) : services.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Scissors className="w-16 h-16" />}
            title="Belum ada layanan"
            description="Mulai tambahkan layanan untuk barbershop Anda"
            action={
              <Button onClick={handleCreate} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Layanan Pertama
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
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

      {/* Service Form Modal */}
      {showModal && (
        <ServiceFormModal
          service={editingService}
          onClose={() => {
            setShowModal(false);
            setEditingService(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default ServiceList;
