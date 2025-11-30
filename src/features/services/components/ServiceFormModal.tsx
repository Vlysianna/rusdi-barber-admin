import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { servicesAPI, Service, CreateServiceRequest } from '../../../lib/api';
import { Button, Loading } from '../../../shared/components';

interface ServiceFormModalProps {
  service: Service | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  service,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateServiceRequest>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: 'haircut',
    isActive: true,
    isPopular: false,
    image: undefined,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        isActive: service.isActive,
        isPopular: service.isPopular,
        image: service.image,
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up formData - remove undefined/empty image
      const submitData = {
        ...formData,
        image: formData.image || undefined,
      };
      
      // Remove image key if it's undefined/empty to avoid validation issues
      if (!submitData.image) {
        delete submitData.image;
      }

      let response;
      if (service) {
        response = await servicesAPI.update(service.id, submitData);
      } else {
        response = await servicesAPI.create(submitData);
      }

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Gagal menyimpan layanan');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat menyimpan layanan';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {service ? 'Edit Layanan' : 'Tambah Layanan Baru'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Layanan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Contoh: Potong Rambut Classic"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Deskripsikan layanan ini..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="haircut">Potong Rambut</option>
                  <option value="beard_trim">Cukur Jenggot</option>
                  <option value="hair_wash">Keramas</option>
                  <option value="styling">Styling</option>
                  <option value="coloring">Pewarnaan</option>
                  <option value="treatment">Perawatan</option>
                  <option value="package">Paket</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durasi (menit) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  min={5}
                  step={5}
                  placeholder="30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min={0}
                step={1000}
                placeholder="50000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Gambar (Opsional)
              </label>
              <input
                type="url"
                name="image"
                value={formData.image || ''}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Masukkan URL gambar atau kosongkan untuk menggunakan gambar default
              </p>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">
                  Status Aktif
                </span>
                <p className="text-xs text-gray-500">
                  Layanan yang aktif akan ditampilkan kepada pelanggan
                </p>
              </div>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isPopular"
                checked={formData.isPopular}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">
                  Tandai Sebagai Populer
                </span>
                <p className="text-xs text-gray-500">
                  Layanan populer akan ditampilkan di bagian utama
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Loading size="sm" />
                  <span className="ml-2">Menyimpan...</span>
                </>
              ) : (
                <>{service ? 'Simpan Perubahan' : 'Tambah Layanan'}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
