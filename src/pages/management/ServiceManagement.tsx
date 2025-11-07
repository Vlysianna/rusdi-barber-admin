import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  DollarSign,
  Clock,
  Users,
  Filter,
  Tag,
  MoreVertical,
  Star,
  TrendingUp,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { usePermissions } from "../../hooks/useAuth";
import { serviceService } from "../../services/serviceService";
import { ServiceFormModal, ServiceDetailsModal } from "../../components/modals";
import type { Service } from "../../types";
import type { ServiceFormData } from "../../components/modals";

const ServiceManagement: React.FC = () => {
  const { canManageServices, isAdmin } = usePermissions();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (canManageServices) {
      loadServices();
    }
  }, [canManageServices]);

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

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await serviceService.getAllServices();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || service.category === filterCategory;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && service.isActive) ||
      (filterStatus === "inactive" && !service.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getCategoryInfo = (category: string) => {
    return categories.find((cat) => cat.value === category) || categories[0];
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setShowCreateModal(true);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const handleViewService = (service: Service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleFormSubmit = async (data: ServiceFormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const serviceData = {
        ...data,
        price: data.price.toString(),
      };

      if (selectedService) {
        await serviceService.updateService(selectedService.id, serviceData);
        setSuccess("Service updated successfully!");
        setShowEditModal(false);
      } else {
        await serviceService.createService(serviceData);
        setSuccess("Service created successfully!");
        setShowCreateModal(false);
      }

      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setError(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setError(null);
    setSelectedService(null);
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      await serviceService.updateService(service.id, {
        isActive: !service.isActive,
      });
      setSuccess(
        `Service ${!service.isActive ? "activated" : "deactivated"} successfully!`,
      );
      await loadServices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update service status",
      );
    }
  };

  const handleTogglePopular = async (service: Service) => {
    try {
      await serviceService.toggleServicePopularity(service.id);
      setSuccess(
        `Service ${!service.isPopular ? "marked as popular" : "unmarked as popular"}!`,
      );
      await loadServices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update popular status",
      );
    }
  };

  const handleDeleteService = async (service: Service) => {
    if (!isAdmin) {
      setError("Only administrators can delete services");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await serviceService.deleteService(service.id);
        setSuccess("Service deleted successfully!");
        await loadServices();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete service",
        );
      }
    }
  };

  if (!canManageServices) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to manage services.
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
            Service Management
          </h1>
          <p className="text-gray-600">
            Manage services, pricing, and availability
          </p>
        </div>
        <Button
          onClick={handleCreateService}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Services
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {services.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Services
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {services.filter((s) => s.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Popular Services
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {services.filter((s) => s.isPopular).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {services.length > 0
                    ? formatCurrency(
                        services.reduce(
                          (sum, s) => sum + parseFloat(s.price),
                          0,
                        ) / services.length,
                      )
                    : formatCurrency(0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
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
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <Card.Body>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="w-12 h-8 bg-gray-200 rounded"></div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="hover:shadow-md transition-shadow"
            >
              <Card.Body>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                      {getCategoryInfo(service.category).icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getCategoryInfo(service.category).label}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-2 hover:bg-gray-100 rounded-md">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Price</span>
                    <span className="font-bold text-primary-600">
                      {formatCurrency(parseFloat(service.price))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">
                      {formatDuration(service.duration)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {service.tags && service.tags.length > 0 && (
                    <div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {service.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {service.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{service.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {service.isPopular && (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-medium">Popular</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewService(service)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={service.isActive ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleToggleStatus(service)}
                  >
                    {service.isActive ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant={service.isPopular ? "warning" : "secondary"}
                    size="sm"
                    onClick={() => handleTogglePopular(service)}
                  >
                    <Star
                      className={`w-4 h-4 ${service.isPopular ? "fill-current" : ""}`}
                    />
                  </Button>

                  {isAdmin && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteService(service)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Card.Body>
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Services Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ||
                filterCategory !== "all" ||
                filterStatus !== "all"
                  ? "No services match your current search and filters."
                  : "Get started by adding your first service."}
              </p>
              {!searchTerm &&
                filterCategory === "all" &&
                filterStatus === "all" && (
                  <Button onClick={handleCreateService}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Service
                  </Button>
                )}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modals */}
      <ServiceFormModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onSubmit={handleFormSubmit}
        service={null}
        loading={submitting}
        error={error}
      />

      <ServiceFormModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleFormSubmit}
        service={selectedService}
        loading={submitting}
        error={error}
      />

      <ServiceDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        service={selectedService}
        onEdit={handleEditService}
        onDelete={handleDeleteService}
        onToggleStatus={handleToggleStatus}
        onTogglePopular={handleTogglePopular}
        canEdit={canManageServices}
        canDelete={isAdmin}
      />

      {/* Success Message */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
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
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md shadow-lg">
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

export default ServiceManagement;
