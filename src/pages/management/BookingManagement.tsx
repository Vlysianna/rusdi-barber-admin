import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Scissors,
  DollarSign,
  Eye,
  Edit3,
  X,
  Check,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  Download,
  RefreshCw,
  Users,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { usePermissions } from "../../hooks/useAuth";
import { bookingService } from "../../services/bookingService";
import { stylistService } from "../../services/stylistService";
import { serviceService } from "../../services/serviceService";
import type { Booking, Stylist, Service, BookingStatus } from "../../types";

interface BookingFilters {
  status: string;
  stylistId: string;
  serviceId: string;
  dateFrom: string;
  dateTo: string;
  customerId: string;
}

interface BookingFormData {
  customerId: string;
  stylistId: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  status: BookingStatus;
}

const BookingManagement: React.FC = () => {
  const { canManageAllBookings, canManageBookings, isAdmin, user } =
    usePermissions();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<BookingFilters>({
    status: "all",
    stylistId: "all",
    serviceId: "all",
    dateFrom: "",
    dateTo: "",
    customerId: "",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    customerId: "",
    stylistId: "",
    serviceId: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
    status: "pending" as BookingStatus,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800",
      icon: Check,
    },
    {
      value: "in_progress",
      label: "In Progress",
      color: "bg-purple-100 text-purple-800",
      icon: RefreshCw,
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-green-100 text-green-800",
      icon: Check,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
      icon: X,
    },
    {
      value: "no_show",
      label: "No Show",
      color: "bg-gray-100 text-gray-800",
      icon: AlertCircle,
    },
  ];

  useEffect(() => {
    if (canManageBookings) {
      loadBookings();
      loadStylists();
      loadServices();
    }
  }, [canManageBookings, filters]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      let data;

      if (canManageAllBookings) {
        data = await bookingService.getAllBookings(filters);
      } else {
        // Stylist can only see their own bookings
        data = await bookingService.getStylistBookings(user?.id || "", filters);
      }

      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const loadStylists = async () => {
    try {
      const data = await stylistService.getAllStylists();
      setStylists(data);
    } catch (err) {
      console.error("Failed to load stylists:", err);
    }
  };

  const loadServices = async () => {
    try {
      const data = await serviceService.getAllServices();
      setServices(data.filter((s) => s.isActive));
    } catch (err) {
      console.error("Failed to load services:", err);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.stylist.user.fullName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.service.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: BookingStatus) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0];
  };

  const handleCreateBooking = () => {
    setFormData({
      customerId: "",
      stylistId: "",
      serviceId: "",
      appointmentDate: "",
      appointmentTime: "",
      notes: "",
      status: "pending" as BookingStatus,
    });
    setSelectedBooking(null);
    setShowCreateModal(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setFormData({
      customerId: booking.customerId,
      stylistId: booking.stylistId,
      serviceId: booking.serviceId,
      appointmentDate: booking.appointmentDate.split("T")[0],
      appointmentTime: booking.appointmentTime,
      notes: booking.notes || "",
      status: booking.status,
    });
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const bookingData = {
        ...formData,
        appointmentDate: `${formData.appointmentDate}T${formData.appointmentTime}:00.000Z`,
      };

      if (selectedBooking) {
        await bookingService.updateBooking(selectedBooking.id, bookingData);
        setSuccess("Booking updated successfully!");
        setShowEditModal(false);
      } else {
        await bookingService.createBooking(bookingData);
        setSuccess("Booking created successfully!");
        setShowCreateModal(false);
      }

      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (
    booking: Booking,
    newStatus: BookingStatus,
  ) => {
    try {
      await bookingService.updateBooking(booking.id, { status: newStatus });
      setSuccess(
        `Booking status changed to ${getStatusInfo(newStatus).label}!`,
      );
      await loadBookings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update booking status",
      );
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingService.updateBooking(booking.id, {
          status: "cancelled" as BookingStatus,
        });
        setSuccess("Booking cancelled successfully!");
        await loadBookings();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to cancel booking",
        );
      }
    }
  };

  const renderBookingModal = (isEdit: boolean) => (
    <Modal
      isOpen={isEdit ? showEditModal : showCreateModal}
      onClose={() =>
        isEdit ? setShowEditModal(false) : setShowCreateModal(false)
      }
      title={isEdit ? "Edit Booking" : "Create New Booking"}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stylist *
            </label>
            <select
              value={formData.stylistId}
              onChange={(e) =>
                setFormData({ ...formData, stylistId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Stylist</option>
              {stylists
                .filter((s) => s.isAvailable)
                .map((stylist) => (
                  <option key={stylist.id} value={stylist.id}>
                    {stylist.user.fullName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service *
            </label>
            <select
              value={formData.serviceId}
              onChange={(e) =>
                setFormData({ ...formData, serviceId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {formatCurrency(parseFloat(service.price))}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) =>
                setFormData({ ...formData, appointmentDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <input
              type="time"
              value={formData.appointmentTime}
              onChange={(e) =>
                setFormData({ ...formData, appointmentTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {isEdit && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as BookingStatus,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="Any special requests or notes..."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              isEdit ? setShowEditModal(false) : setShowCreateModal(false)
            }
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? "Update Booking" : "Create Booking"}
          </Button>
        </div>
      </form>
    </Modal>
  );

  const renderDetailsModal = () => (
    <Modal
      isOpen={showDetailsModal}
      onClose={() => setShowDetailsModal(false)}
      title="Booking Details"
      size="large"
    >
      {selectedBooking && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Booking #{selectedBooking.id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-gray-600">
                  {formatDate(selectedBooking.appointmentDate)} at{" "}
                  {formatTime(selectedBooking.appointmentTime)}
                </p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusInfo(selectedBooking.status).color}`}
            >
              {getStatusInfo(selectedBooking.status).label}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Customer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">
                  {selectedBooking.customer.fullName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">
                  {selectedBooking.customer.email}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">
                  {selectedBooking.customer.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Scissors className="w-4 h-4 mr-2" />
              Service Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-900">
                  {selectedBooking.service.name}
                </p>
                <p className="text-gray-600">
                  {selectedBooking.service.description}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {selectedBooking.service.duration} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(selectedBooking.service.price))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stylist Info */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Stylist Information
            </h4>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                {selectedBooking.stylist.user.avatar ? (
                  <img
                    src={selectedBooking.stylist.user.avatar}
                    alt={selectedBooking.stylist.user.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="font-semibold text-primary-600">
                    {selectedBooking.stylist.user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {selectedBooking.stylist.user.fullName}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>
                    {selectedBooking.stylist.rating?.toFixed(1) || "0.0"}
                  </span>
                  <span>•</span>
                  <span>
                    {selectedBooking.stylist.experience || 0} years experience
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {selectedBooking.notes && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                {selectedBooking.notes}
              </p>
            </div>
          )}

          {/* Payment Info */}
          {selectedBooking.payment && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Payment Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(parseFloat(selectedBooking.payment.amount))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium capitalize">
                    {selectedBooking.payment.method.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedBooking.payment.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : selectedBooking.payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedBooking.payment.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              {canManageAllBookings &&
                selectedBooking.status !== "completed" &&
                selectedBooking.status !== "cancelled" && (
                  <>
                    {selectedBooking.status === "pending" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(selectedBooking, "confirmed")
                        }
                      >
                        Confirm
                      </Button>
                    )}
                    {selectedBooking.status === "confirmed" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(selectedBooking, "in_progress")
                        }
                      >
                        Start Service
                      </Button>
                    )}
                    {selectedBooking.status === "in_progress" && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(selectedBooking, "completed")
                        }
                      >
                        Mark Complete
                      </Button>
                    )}
                  </>
                )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEditBooking(selectedBooking)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              {selectedBooking.status !== "cancelled" &&
                selectedBooking.status !== "completed" && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancelBooking(selectedBooking)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );

  if (!canManageBookings) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to manage bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Booking Management
          </h1>
          <p className="text-gray-600">
            Manage appointments, schedules, and customer bookings
          </p>
        </div>
        {canManageAllBookings && (
          <Button
            onClick={handleCreateBooking}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === "pending").length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Today's Bookings
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    bookings.filter(
                      (b) =>
                        new Date(b.appointmentDate).toDateString() ===
                        new Date().toDateString(),
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    bookings.filter((b) => {
                      const bookingDate = new Date(b.appointmentDate);
                      const currentDate = new Date();
                      return (
                        bookingDate.getMonth() === currentDate.getMonth() &&
                        bookingDate.getFullYear() === currentDate.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filters.stylistId}
            onChange={(e) =>
              setFilters({ ...filters, stylistId: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Stylists</option>
            {stylists.map((stylist) => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.user.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <Card.Body>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusInfo = getStatusInfo(booking.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={booking.id}
                className="hover:shadow-md transition-shadow"
              >
                <Card.Body>
                  <div className="flex items-center justify-between">
                    {/* Left: Booking Info */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        {booking.customer.avatar ? (
                          <img
                            src={booking.customer.avatar}
                            alt={booking.customer.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold text-primary-600">
                            {booking.customer.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {booking.customer.fullName}
                          </h3>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">
                            #{booking.id.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(booking.appointmentDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(booking.appointmentTime)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Scissors className="w-4 h-4" />
                            <span>{booking.service.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{booking.stylist.user.fullName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(parseFloat(booking.service.price))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.service.duration} min
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${statusInfo.color}`}
                      >
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {statusInfo.label}
                      </span>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewBooking(booking)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {canManageAllBookings && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditBooking(booking)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}

                        {booking.status !== "cancelled" &&
                          booking.status !== "completed" && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleCancelBooking(booking)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Notes:</strong> {booking.notes}
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <Card.Body>
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Bookings Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ||
                filters.status !== "all" ||
                filters.stylistId !== "all"
                  ? "No bookings match your current search and filters."
                  : "No bookings have been made yet."}
              </p>
              {canManageAllBookings &&
                !searchTerm &&
                filters.status === "all" &&
                filters.stylistId === "all" && (
                  <Button onClick={handleCreateBooking}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Booking
                  </Button>
                )}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modals */}
      {renderBookingModal(false)}
      {renderBookingModal(true)}
      {renderDetailsModal()}

      {/* Success Message */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              <span>{success}</span>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="ml-4 text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md shadow-lg z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
