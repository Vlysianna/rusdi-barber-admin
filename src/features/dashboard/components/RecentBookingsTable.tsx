import React from 'react';
import { Clock, User, Scissors } from 'lucide-react';
import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';
import { formatCurrency, formatDate } from '../../../lib/utils/format';

interface RecentBooking {
  id: string;
  customerName: string;
  serviceName: string;
  stylistName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  totalAmount: number;
}

interface RecentBookingsTableProps {
  bookings: RecentBooking[];
  onViewDetails?: (id: string) => void;
}

const RecentBookingsTable: React.FC<RecentBookingsTableProps> = ({ bookings, onViewDetails }) => {
  if (bookings.length === 0) {
    return (
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Booking Terbaru</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          Tidak ada booking terbaru
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Booking Terbaru</h3>
        <p className="text-sm text-gray-500">10 booking terakhir</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr 
                key={booking.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onViewDetails?.(booking.id)}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customerName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <Scissors className="h-4 w-4 text-gray-400 mr-2" />
                    <div className="text-sm text-gray-900">{booking.serviceName}</div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.stylistName}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <div>
                      <div>{formatDate(booking.appointmentDate)}</div>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentBookingsTable;
