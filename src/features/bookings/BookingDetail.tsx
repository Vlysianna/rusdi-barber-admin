import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Scissors, CreditCard, MessageSquare } from 'lucide-react';
import { bookingsAPI, Booking } from '../../lib/api';
import { Card, Button, Badge, Loading, Alert } from '../../shared/components';
import { formatCurrency, formatDate, formatDateTime } from '../../lib/utils/format';

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBookingDetail();
    }
  }, [id]);

  const loadBookingDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) return;

      const response = await bookingsAPI.getById(id);
      
      if (response.success && response.data) {
        setBooking(response.data);
      } else {
        setError(response.message || 'Gagal memuat detail booking');
      }
    } catch (err) {
      console.error('Load booking detail error:', err);
      setError('Gagal memuat detail booking');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (action: 'confirm' | 'cancel' | 'complete') => {
    if (!id) return;

    try {
      let response;
      
      if (action === 'confirm') {
        response = await bookingsAPI.confirm(id);
      } else if (action === 'complete') {
        response = await bookingsAPI.complete(id);
      } else {
        const reason = prompt('Alasan pembatalan:');
        if (!reason) return;
        response = await bookingsAPI.cancel(id, reason);
      }

      if (response.success) {
        loadBookingDetail();
      } else {
        alert(response.message || 'Gagal update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      alert('Gagal update status booking');
    }
  };

  if (loading) {
    return <Loading size="lg" text="Memuat detail booking..." />;
  }

  if (error || !booking) {
    return (
      <div className="space-y-4">
        <Alert type="error" message={error || 'Booking tidak ditemukan'} />
        <Button onClick={() => navigate('/bookings')} variant="secondary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>
    );
  }

  const canConfirm = booking.status === 'pending';
  const canComplete = booking.status === 'confirmed' || booking.status === 'in_progress';
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/bookings')} variant="ghost">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detail Booking #{booking.id.substring(0, 8)}
            </h1>
            <p className="text-gray-600 mt-1">
              Dibuat {formatDateTime(booking.createdAt)}
            </p>
          </div>
        </div>
        <Badge status={booking.status} />
      </div>

      {/* Actions */}
      {(canConfirm || canComplete || canCancel) && (
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Aksi Cepat</p>
            <div className="flex space-x-2">
              {canConfirm && (
                <Button
                  onClick={() => handleStatusUpdate('confirm')}
                  variant="primary"
                >
                  Konfirmasi Booking
                </Button>
              )}
              {canComplete && (
                <Button
                  onClick={() => handleStatusUpdate('complete')}
                  variant="success"
                >
                  Selesaikan Booking
                </Button>
              )}
              {canCancel && (
                <Button
                  onClick={() => handleStatusUpdate('cancel')}
                  variant="danger"
                >
                  Batalkan Booking
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informasi Customer
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">
                    {booking.customer?.fullName}
                  </p>
                  <p className="text-sm text-gray-500">{booking.customer?.email}</p>
                  <p className="text-sm text-gray-500">{booking.customer?.phone}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Service Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Scissors className="w-5 h-5 mr-2" />
              Informasi Layanan
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Layanan</span>
                <span className="font-medium text-gray-900">
                  {booking.service?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kategori</span>
                <span className="font-medium text-gray-900 capitalize">
                  {booking.service?.category.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durasi</span>
                <span className="font-medium text-gray-900">
                  {booking.service?.duration} menit
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Harga</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(booking.service?.price || 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Stylist Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informasi Stylist
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">
                    {booking.stylist?.user?.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    ⭐ Rating: {booking.stylist?.rating ? Number(booking.stylist.rating).toFixed(1) : 'N/A'} • {' '}
                    {booking.stylist?.totalReviews} ulasan
                  </p>
                  <p className="text-sm text-gray-500">
                    Pengalaman: {booking.stylist?.experience} tahun
                  </p>
                </div>
              </div>
              {booking.stylist?.specialties && Array.isArray(booking.stylist.specialties) && booking.stylist.specialties.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Spesialisasi:</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.stylist.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Notes */}
          {booking.notes && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Catatan
              </h3>
              <p className="text-gray-700">{booking.notes}</p>
            </Card>
          )}

          {/* Cancel Reason */}
          {booking.cancelReason && (
            <Card>
              <h3 className="text-lg font-semibold text-red-600 mb-4">
                Alasan Pembatalan
              </h3>
              <p className="text-gray-700">{booking.cancelReason}</p>
              <p className="text-sm text-gray-500 mt-2">
                Dibatalkan pada {formatDateTime(booking.cancelledAt || '')}
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Appointment Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Waktu Appointment
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Tanggal</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(booking.appointmentDate, 'long')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jam</p>
                <p className="text-lg font-medium text-gray-900 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {booking.appointmentTime}
                  {booking.endTime && ` - ${booking.endTime}`}
                </p>
              </div>
            </div>
          </Card>

          {/* Payment Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Pembayaran
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
            </div>
          </Card>

          {/* Timestamps */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Dibuat</p>
                <p className="text-gray-900">{formatDateTime(booking.createdAt)}</p>
              </div>
              {booking.confirmedAt && (
                <div>
                  <p className="text-gray-600">Dikonfirmasi</p>
                  <p className="text-gray-900">{formatDateTime(booking.confirmedAt)}</p>
                </div>
              )}
              {booking.completedAt && (
                <div>
                  <p className="text-gray-600">Diselesaikan</p>
                  <p className="text-gray-900">{formatDateTime(booking.completedAt)}</p>
                </div>
              )}
              {booking.cancelledAt && (
                <div>
                  <p className="text-gray-600">Dibatalkan</p>
                  <p className="text-gray-900">{formatDateTime(booking.cancelledAt)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Terakhir Diupdate</p>
                <p className="text-gray-900">{formatDateTime(booking.updatedAt)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
