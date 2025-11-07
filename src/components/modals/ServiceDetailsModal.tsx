import React from "react";
import {
  Package,
  DollarSign,
  Clock,
  Users,
  Tag,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Eye,
  X,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import type { Service } from "../../types";

interface ServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
  onToggleStatus?: (service: Service) => void;
  onTogglePopular?: (service: Service) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  isOpen,
  onClose,
  service,
  onEdit,
  onDelete,
  onToggleStatus,
  onTogglePopular,
  canEdit = false,
  canDelete = false,
}) => {
  if (!service) return null;

  const categoryLabels: Record<string, { label: string; icon: string }> = {
    haircut: { label: "Haircut", icon: "✂️" },
    beard_trim: { label: "Beard Trim", icon: "🧔" },
    hair_wash: { label: "Hair Wash", icon: "🧴" },
    styling: { label: "Hair Styling", icon: "💇" },
    coloring: { label: "Hair Coloring", icon: "🎨" },
    treatment: { label: "Hair Treatment", icon: "💆" },
    package: { label: "Package Deal", icon: "📦" },
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(typeof amount === "string" ? parseFloat(amount) : amount);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hour${hours > 1 ? "s" : ""}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Eye className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Service Details
            </h3>
            <p className="text-sm text-gray-500">
              View complete service information
            </p>
          </div>
          {(canEdit || canDelete) && (
            <div className="flex items-center space-x-2">
              {canEdit && onEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(service)}
                  className="flex items-center space-x-1"
                >
                  <Package className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
          )}
        </div>
      }
      size="large"
    >
      <div className="space-y-6">
        {/* Service Header */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {service.name}
                </h2>
                <span className="text-2xl">
                  {categoryLabels[service.category]?.icon || "📋"}
                </span>
              </div>
              <p className="text-gray-600 text-lg mb-4">{service.description}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-xl font-semibold text-green-700">
                    {formatCurrency(service.price)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-lg text-blue-700">
                    {formatDuration(service.duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Category Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Service Status
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Availability:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                    service.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {service.isActive ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  {service.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {service.isPopular && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Featured:</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Popular Service
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Category & Classification
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="text-sm font-medium text-gray-900">
                  {categoryLabels[service.category]?.icon}{" "}
                  {categoryLabels[service.category]?.label || service.category}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Service ID:</span>
                <span className="text-sm font-mono text-gray-700 bg-gray-200 px-2 py-1 rounded">
                  {service.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {service.tags && service.tags.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Service Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {service.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        {service.requirements && service.requirements.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Customer Requirements
            </h4>
            <ul className="space-y-2">
              {service.requirements.map((req, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-2 text-sm text-gray-700"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Special Instructions */}
        {service.instructions && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Stylist Instructions
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {service.instructions}
            </p>
          </div>
        )}

        {/* Service Image */}
        {service.image && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Service Image
            </h4>
            <div className="relative">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        )}

        {/* Service Analytics Preview */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Quick Stats
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {service.isActive ? "✅" : "❌"}
              </div>
              <div className="text-xs text-gray-600">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(service.price)}
              </div>
              <div className="text-xs text-gray-600">Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {service.duration}m
              </div>
              <div className="text-xs text-gray-600">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {service.isPopular ? "⭐" : "📊"}
              </div>
              <div className="text-xs text-gray-600">
                {service.isPopular ? "Popular" : "Standard"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(canEdit || canDelete || onToggleStatus || onTogglePopular) && (
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              {onToggleStatus && canEdit && (
                <Button
                  variant={service.isActive ? "warning" : "primary"}
                  size="sm"
                  onClick={() => onToggleStatus(service)}
                  className="flex items-center space-x-2"
                >
                  {service.isActive ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>
                    {service.isActive ? "Deactivate" : "Activate"}
                  </span>
                </Button>
              )}
              {onTogglePopular && canEdit && (
                <Button
                  variant={service.isPopular ? "secondary" : "warning"}
                  size="sm"
                  onClick={() => onTogglePopular(service)}
                  className="flex items-center space-x-2"
                >
                  <Star
                    className={`w-4 h-4 ${
                      service.isPopular ? "" : "fill-current"
                    }`}
                  />
                  <span>
                    {service.isPopular ? "Remove Popular" : "Mark Popular"}
                  </span>
                </Button>
              )}
            </div>
            <div className="flex space-x-3">
              {canDelete && onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(service)}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Delete</span>
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={onClose}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ServiceDetailsModal;
