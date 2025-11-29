import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { stylistsAPI, Stylist, CreateStylistRequest } from '../../../lib/api';
import { Button, Loading } from '../../../shared/components';

interface StylistFormModalProps {
  stylist: Stylist | null;
  onClose: () => void;
  onSuccess: () => void;
}

const StylistFormModal: React.FC<StylistFormModalProps> = ({
  stylist,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateStylistRequest>({
    name: '',
    phoneNumber: '',
    specialization: '',
    isActive: true,
    photoUrl: undefined,
  });

  useEffect(() => {
    if (stylist) {
      setFormData({
        name: stylist.name,
        phoneNumber: stylist.phoneNumber || '',
        specialization: stylist.specialization || '',
        isActive: stylist.isActive,
        photoUrl: stylist.photoUrl,
      });
    }
  }, [stylist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (stylist) {
        response = await stylistsAPI.update(stylist.id, formData);
      } else {
        response = await stylistsAPI.create(formData);
      }

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Gagal menyimpan data stylist');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Terjadi kesalahan saat menyimpan data stylist');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {stylist ? 'Edit Stylist' : 'Tambah Stylist Baru'}
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Contoh: John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                placeholder="08123456789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spesialisasi
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="Contoh: Classic Haircut & Beard Styling"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Keahlian khusus stylist (opsional)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Foto Profil
              </label>
              <input
                type="url"
                name="photoUrl"
                value={formData.photoUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Kosongkan untuk menggunakan inisial nama
              </p>
            </div>

            {/* Status Toggle */}
            <div className="p-4 bg-gray-50 rounded-lg">
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
                    Stylist aktif dapat menerima booking
                  </p>
                </div>
              </label>
            </div>
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
                  <Loading size="sm" className="mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>{stylist ? 'Simpan Perubahan' : 'Tambah Stylist'}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StylistFormModal;
