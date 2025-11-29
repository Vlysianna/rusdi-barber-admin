import React from 'react';
import { Payment } from '../../../lib/api';
import { Card, Badge } from '../../../shared/components';
import { formatCurrency, formatDate } from '../../../lib/utils/format';
import { MoreVertical } from 'lucide-react';

interface PaymentTableProps {
  payments: Payment[];
  onRefund: (id: string) => void;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ payments, onRefund }) => {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'secondary' => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      case 'refunded': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      completed: 'Selesai',
      failed: 'Gagal',
      refunded: 'Refund',
    };
    return labels[status] || status;
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Tunai',
      card: 'Kartu',
      ewallet: 'E-Wallet',
      transfer: 'Transfer',
    };
    return labels[method] || method;
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Pembayaran
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metode
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 text-sm text-gray-900 font-mono">
                  {payment.id.substring(0, 8)}...
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 font-mono">
                  {payment.bookingId.substring(0, 8)}...
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {getMethodLabel(payment.paymentMethod)}
                </td>
                <td className="px-4 py-4">
                  <Badge variant={getStatusVariant(payment.status)} size="sm">
                    {getStatusLabel(payment.status)}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm text-gray-600">
                  {formatDate(payment.paymentDate)}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() => setActiveMenu(activeMenu === payment.id ? null : payment.id)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>

                    {activeMenu === payment.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveMenu(null)}
                        />
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          {payment.status === 'completed' && (
                            <button
                              onClick={() => {
                                onRefund(payment.id);
                                setActiveMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600"
                            >
                              Refund
                            </button>
                          )}
                          <button
                            onClick={() => setActiveMenu(null)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PaymentTable;
