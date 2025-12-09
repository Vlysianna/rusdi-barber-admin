import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users } from 'lucide-react';
import { stylistsAPI, Stylist, CreateStylistRequest, customersAPI } from '../../../lib/api';
import { Button, Loading } from '../../../shared/components';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface StylistFormModalProps {
  stylist: Stylist | null;
  onClose: () => void;
  onSuccess: () => void;
}

type CreateMode = 'new' | 'existing';

const StylistFormModal: React.FC<StylistFormModalProps> = ({
  stylist,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>('new');

  const [formData, setFormData] = useState<CreateStylistRequest>({
    // For existing user
    userId: stylist?.userId || '',
    // For new user
    email: '',
    password: '',
    fullName: '',
    phone: '',
    // Stylist data
    specialties: stylist?.specialties || [],
    experience: stylist?.experience || 0,
    commissionRate: stylist?.commissionRate || 15,
    bio: stylist?.bio || '',
    isAvailable: stylist?.isAvailable !== undefined ? stylist.isAvailable : true,
  });

  // Fetch available users for dropdown (only when using existing user)
  useEffect(() => {
    const fetchUsers = async () => {
      if (stylist || createMode !== 'existing') return;
      
      setLoadingUsers(true);
      try {
        const response = await customersAPI.getAll({ limit: 100 });
        if (response.success && response.data) {
          setUsers(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [stylist, createMode]);

  useEffect(() => {
    if (stylist) {
      setFormData({
        userId: stylist.userId,
        specialties: stylist.specialties || [],
        experience: stylist.experience || 0,
        commissionRate: stylist.commissionRate || 15,
        bio: stylist.bio || '',
        isAvailable: stylist.isAvailable,
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
        // Update existing stylist
        const updateData = {
          specialties: formData.specialties,
          experience: formData.experience,
          commissionRate: formData.commissionRate,
          bio: formData.bio,
          isAvailable: formData.isAvailable,
        };
        response = await stylistsAPI.update(stylist.id, updateData);
      } else {
        // Create new stylist
        const createData: CreateStylistRequest = {
          specialties: formData.specialties,
          experience: formData.experience,
          commissionRate: formData.commissionRate,
          bio: formData.bio,
          isAvailable: formData.isAvailable,
        };

        if (createMode === 'new') {
          // Create new user + stylist
          createData.email = formData.email;
          createData.password = formData.password;
          createData.fullName = formData.fullName;
          // Only include phone if it's not empty
          if (formData.phone && formData.phone.trim() !== '') {
            createData.phone = formData.phone;
          }
        } else {
          // Use existing user
          createData.userId = formData.userId;
        }

        response = await stylistsAPI.create(createData);
      }

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Gagal menyimpan data stylist');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      const message = err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan data stylist';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

          {/* Mode Selection - Only for new stylist */}
          {!stylist && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Pilih Metode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCreateMode('new')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    createMode === 'new'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="text-sm font-medium">User Baru</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateMode('existing')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    createMode === 'existing'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">User Existing</span>
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* New User Fields */}
            {!stylist && createMode === 'new' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Data User Baru</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleChange}
                    required={createMode === 'new'}
                    placeholder="Nama lengkap stylist"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    required={createMode === 'new'}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    required={createMode === 'new'}
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="08123456789"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Existing User Selection */}
            {!stylist && createMode === 'existing' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih User <span className="text-red-500">*</span>
                </label>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-3">
                    <Loading size="sm" />
                    <span className="ml-2 text-sm text-gray-500">Memuat daftar user...</span>
                  </div>
                ) : (
                  <select
                    name="userId"
                    value={formData.userId || ''}
                    onChange={handleChange}
                    required={createMode === 'existing'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih User --</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Pilih user yang akan dijadikan stylist
                </p>
              </div>
            )}

            {/* Stylist Data */}
            <div className={!stylist ? "border-t pt-4 mt-4" : ""}>
              {!stylist && <h3 className="font-medium text-gray-900 mb-4">Data Stylist</h3>}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spesialisasi
                  </label>
                  <input
                    type="text"
                    name="specialties"
                    value={Array.isArray(formData.specialties) ? formData.specialties.join(', ') : ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        specialties: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter((s) => s),
                      });
                    }}
                    placeholder="Contoh: Classic Haircut, Beard Styling"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pisahkan dengan koma untuk multiple spesialisasi
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pengalaman (tahun)
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience || 0}
                      onChange={handleChange}
                      min="0"
                      max="50"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Komisi (%)
                    </label>
                    <input
                      type="number"
                      name="commissionRate"
                      value={formData.commissionRate || 15}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biografi
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    placeholder="Deskripsi singkat tentang stylist..."
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maksimal 500 karakter
                  </p>
                </div>

                {/* Status Toggle */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable ?? true}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">
                        Tersedia untuk Booking
                      </span>
                      <p className="text-xs text-gray-500">
                        Stylist dapat menerima booking ketika tersedia
                      </p>
                    </div>
                  </label>
                </div>
              </div>
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
                <span className="flex items-center">
                  <Loading size="sm" />
                  <span className="ml-2">Menyimpan...</span>
                </span>
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
