import React, { useState } from 'react';
import { Card, Button } from '../../../shared/components';
import { PaymentFilters } from '../../../lib/api';

interface PaymentFiltersPanelProps {
  filters: PaymentFilters;
  onFilterChange: (filters: Partial<PaymentFilters>) => void;
}

const PaymentFiltersPanel: React.FC<PaymentFiltersPanelProps> = ({
  filters,
  onFilterChange,
}) => {
  const [localFilters, setLocalFilters] = useState<Partial<PaymentFilters>>({
    status: filters.status,
    paymentMethod: filters.paymentMethod,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      status: undefined,
      paymentMethod: undefined,
      startDate: undefined,
      endDate: undefined,
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card>
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Filter Pembayaran</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Selesai</option>
              <option value="failed">Gagal</option>
              <option value="refunded">Refund</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metode Pembayaran
            </label>
            <select
              value={localFilters.paymentMethod || ''}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  paymentMethod: e.target.value || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Metode</option>
              <option value="cash">Tunai</option>
              <option value="card">Kartu</option>
              <option value="ewallet">E-Wallet</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dari Tanggal
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sampai Tanggal
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Terapkan Filter
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PaymentFiltersPanel;
