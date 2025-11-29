import React from 'react';
import { Clock, User, Scissors, MoreVertical } from 'lucide-react';
import { Booking } from '../../../lib/api';
import { Badge } from '../../../shared/components';
import { formatCurrency, formatDate } from '../../../lib/utils/format';

interface BookingTableProps {
  bookings: Booking[];
  onViewDetail: (id: string) => void;
  onStatusUpdate: (id: string, action: 'confirm' | 'cancel' | 'complete') => void;
  loading?: boolean;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onViewDetail,
  onStatusUpdate,
  loading = false,
}) => {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  const getActionsByStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return [
          { label: 'Konfirmasi', action: 'confirm' as const, color: 'text-blue-600' },
          { label: 'Batalkan', action: 'cancel' as const, color: 'text-red-600' },
        ];
      case 'confirmed':
        return [
          { label: 'Selesaikan', action: 'complete' as const, color: 'text-green-600' },
          { label: 'Batalkan', action: 'cancel' as const, color: 'text-red-600' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Layanan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stylist
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Waktu
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onViewDetail(booking.id)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{booking.id.substring(0, 8)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customer?.fullName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.customer?.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <Scissors className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm text-gray-900">
                        {booking.service?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.service?.duration} menit
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.stylist?.user?.fullName || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    ⭐ {booking.stylist?.rating ? Number(booking.stylist.rating).toFixed(1) : 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <div>
                      <div className="text-gray-900">
                        {formatDate(booking.appointmentDate)}
                      </div>
                      <div className="text-xs">{booking.appointmentTime}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge status={booking.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(booking.totalAmount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveMenu(activeMenu === booking.id ? null : booking.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeMenu === booking.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => onViewDetail(booking.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Lihat Detail
                          </button>
                          {getActionsByStatus(booking.status).map((action) => (
                            <button
                              key={action.action}
                              onClick={() => {
                                onStatusUpdate(booking.id, action.action);
                                setActiveMenu(null);
                              }}
                              className={`block w-full text-left px-4 py-2 text-sm ${action.color} hover:bg-gray-100`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default BookingTable;
