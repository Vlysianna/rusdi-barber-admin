import React from 'react';
import { Customer } from '../../../lib/api';
import { Card, Badge } from '../../../shared/components';
import { formatCurrency, formatDate } from '../../../lib/utils/format';
import { Mail, Phone, Calendar, Award } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
}

const CustomerTable: React.FC<CustomerTableProps> = ({ customers }) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pelanggan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontak
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Booking
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spending
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bergabung
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                      {(customer.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{customer.fullName}</p>
                      <p className="text-xs text-gray-500">ID: {customer.id.substring(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    {customer.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center text-sm text-gray-900">
                    <Award className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="font-semibold">{customer.totalBookings || 0}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-green-600">
                  {formatCurrency(customer.totalSpent || 0)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(customer.createdAt)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  {(customer.totalBookings || 0) >= 5 ? (
                    <Badge variant="warning" size="sm">
                      VIP
                    </Badge>
                  ) : (customer.totalBookings || 0) >= 1 ? (
                    <Badge variant="success" size="sm">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge variant="secondary" size="sm">
                      Baru
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CustomerTable;
