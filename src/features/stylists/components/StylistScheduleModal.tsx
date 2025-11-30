import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar } from 'lucide-react';
import { stylistsAPI, Stylist, StylistSchedule } from '../../../lib/api';
import { Button, Loading, Card } from '../../../shared/components';

interface StylistScheduleModalProps {
  stylist: Stylist;
  onClose: () => void;
  onSuccess: () => void;
}

const days = [
  { value: 'monday', label: 'Senin' },
  { value: 'tuesday', label: 'Selasa' },
  { value: 'wednesday', label: 'Rabu' },
  { value: 'thursday', label: 'Kamis' },
  { value: 'friday', label: 'Jumat' },
  { value: 'saturday', label: 'Sabtu' },
  { value: 'sunday', label: 'Minggu' },
];

const StylistScheduleModal: React.FC<StylistScheduleModalProps> = ({
  stylist,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<StylistSchedule[]>([]);

  const [formData, setFormData] = useState({
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '17:00',
    isAvailable: true,
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const response = await stylistsAPI.getSchedule(stylist.id);
      
      if (response.success && response.data) {
        setSchedules(response.data);
      }
    } catch (err) {
      console.error('Load schedules error:', err);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await stylistsAPI.addSchedule(stylist.id, formData);

      if (response.success) {
        loadSchedules();
        setFormData({
          dayOfWeek: 'monday',
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
        });
      } else {
        setError(response.message || 'Gagal menambah jadwal');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Terjadi kesalahan saat menyimpan jadwal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Yakin ingin menghapus jadwal ini?')) return;

    try {
      const response = await stylistsAPI.deleteSchedule(stylist.id, scheduleId);
      if (response.success) {
        loadSchedules();
      } else {
        alert(response.message || 'Gagal menghapus jadwal');
      }
    } catch (error) {
      console.error('Delete schedule error:', error);
      alert('Gagal menghapus jadwal');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      // Ensure value is never undefined to prevent controlled/uncontrolled input warning
      setFormData({ ...formData, [name]: value ?? '' });
    }
  };

  const getDayLabel = (dayValue: string) => {
    return days.find(d => d.value === dayValue)?.label || dayValue;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Kelola Jadwal</h2>
            <p className="text-sm text-gray-600 mt-1">{stylist.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Add Schedule Form */}
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Tambah Jadwal Baru
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hari <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {days.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <label className="flex items-center cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Tersedia</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jam Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jam Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Loading size="sm" className="mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    'Tambah Jadwal'
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Schedules List */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Jadwal Saat Ini
            </h3>

            {loadingSchedules ? (
              <Loading size="md" text="Memuat jadwal..." />
            ) : schedules.length === 0 ? (
              <Card>
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Belum ada jadwal</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-20">
                          <span className="font-medium text-gray-900">
                            {getDayLabel(schedule.dayOfWeek)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div>
                          {schedule.isAvailable ? (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              Tersedia
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                              Libur
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={onSuccess}>
              Selesai
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StylistScheduleModal;
