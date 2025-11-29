import React from 'react';
import { BookingFilters } from '../../../lib/api';
import { Button } from '../../../shared/components';

interface BookingFiltersPanelProps {
  filters: BookingFilters;
  onFilterChange: (filters: Partial<BookingFilters>) => void;
}

const BookingFiltersPanel: React.FC<BookingFiltersPanelProps> = ({
  filters,
  onFilterChange,
}) => {
  const [localFilters, setLocalFilters] = React.useState(filters);

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters: BookingFilters = {
      page: 1,
      limit: 10,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                status: e.target.value || undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="in_progress">Sedang Berlangsung</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
            <option value="no_show">Tidak Hadir</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={localFilters.startDate || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                startDate: e.target.value || undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={localFilters.endDate || ''}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                endDate: e.target.value || undefined,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Urutkan Berdasarkan
          </label>
          <select
            value={localFilters.sortBy || 'createdAt'}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                sortBy: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Tanggal Dibuat</option>
            <option value="appointmentDate">Tanggal Appointment</option>
            <option value="totalAmount">Total Harga</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 mt-4">
        <Button variant="ghost" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Terapkan Filter
        </Button>
      </div>
    </div>
  );
};

export default BookingFiltersPanel;
