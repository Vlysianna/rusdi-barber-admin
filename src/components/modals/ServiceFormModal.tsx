import React from "react";
import {
  Package,
  Plus,
  Edit3,
  Tag,
  Filter,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  BarChart3,
  XCircle,
  Star,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import type { Service } from "../../types";

export interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  isActive: boolean;
  isPopular: boolean;
  requirements?: string[];
  instructions?: string;
  image?: string;
  tags?: string[];
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => void;
  service?: Service | null;
  loading?: boolean;
  error?: string | null;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  service,
  loading = false,
  error = null,
}) => {
  const isEdit = !!service;
  const [formData, setFormData] = React.useState<ServiceFormData>({
    name: "",
    description: "",
    price: 0,
    duration: 30,
    category: "haircut",
    isActive: true,
    isPopular: false,
    requirements: [],
    instructions: "",
    tags: [],
  });

  const categories = [
    { value: "haircut", label: "Haircut", icon: "✂️" },
    { value: "beard_trim", label: "Beard Trim", icon: "🧔" },
    { value: "hair_wash", label: "Hair Wash", icon: "🧴" },
    { value: "styling", label: "Hair Styling", icon: "💇" },
    { value: "coloring", label: "Hair Coloring", icon: "🎨" },
    { value: "treatment", label: "Hair Treatment", icon: "💆" },
    { value: "package", label: "Package Deal", icon: "📦" },
  ];

  const commonTags = [
    "Premium",
    "Quick Service",
    "Popular",
    "Men's Special",
    "Wedding Package",
    "Student Discount",
    "Senior Friendly",
    "Trendy",
    "Classic",
    "Modern",
  ];

  // Reset form when modal opens/closes or service changes
  React.useEffect(() => {
    if (isOpen) {
      if (service) {
        setFormData({
          name: service.name,
          description: service.description,
          price: parseFloat(service.price),
          duration: service.duration,
          category: service.category,
          isActive: service.isActive,
          isPopular: service.isPopular || false,
          requirements: service.requirements || [],
          instructions: service.instructions || "",
          image: service.image,
          tags: service.tags || [],
        });
      } else {
        setFormData({
          name: "",
          description: "",
          price: 0,
          duration: 30,
          category: "haircut",
          isActive: true,
          isPopular: false,
          requirements: [],
          instructions: "",
          tags: [],
        });
      }
    }
  }, [isOpen, service]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...(prev.tags || []), tag],
    }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...(prev.requirements || []), ""],
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements?.map((req, i) =>
        i === index ? value : req
      ),
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            {isEdit ? (
              <Edit3 className="w-6 h-6 text-primary-600" />
            ) : (
              <Plus className="w-6 h-6 text-primary-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Service" : "Create New Service"}
            </h3>
            <p className="text-sm text-gray-500">
              {isEdit
                ? "Update service information and settings"
                : "Add a new service to your offerings"}
            </p>
          </div>
        </div>
      }
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-medium text-gray-900">
              Basic Information
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-gray-500" />
                Service Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                required
                placeholder="e.g., Classic Haircut"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Filter className="w-4 h-4 mr-2 text-gray-500" />
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                required
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                Price (IDR) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 pl-12"
                  required
                  min="0"
                  step="1000"
                  placeholder="50000"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  Rp
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                required
                min="15"
                step="15"
                placeholder="30"
              />
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-blue-50 p-6 rounded-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-medium text-gray-900">Description</h4>
          </div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Service Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={4}
            required
            placeholder="Describe what this service includes, techniques used, and what customers can expect..."
          />
        </div>

        {/* Tags Section */}
        <div className="bg-yellow-50 p-6 rounded-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="w-5 h-5 text-yellow-600" />
            <h4 className="text-lg font-medium text-gray-900">Service Tags</h4>
          </div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Tags (Optional) - Help customers find your service
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonTags.map((tag) => (
              <label
                key={tag}
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  formData.tags?.includes(tag)
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.tags?.includes(tag) || false}
                  onChange={() => handleTagToggle(tag)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span
                  className={`text-sm font-medium ${
                    formData.tags?.includes(tag)
                      ? "text-primary-700"
                      : "text-gray-700"
                  }`}
                >
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Requirements Section */}
        <div className="bg-green-50 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-medium text-gray-900">
                Customer Requirements
              </h4>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addRequirement}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Requirement</span>
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Specify any preparations or requirements customers should know about
          </p>
          <div className="space-y-3">
            {formData.requirements?.map((req, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200"
              >
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <input
                  type="text"
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Hair should be clean and dry"
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeRequirement(index)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {(!formData.requirements || formData.requirements.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No requirements added yet</p>
                <p className="text-sm">
                  Click "Add Requirement" to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Special Instructions Section */}
        <div className="bg-purple-50 p-6 rounded-xl">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h4 className="text-lg font-medium text-gray-900">
              Stylist Instructions
            </h4>
          </div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Special Instructions for Stylists (Optional)
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) =>
              setFormData({ ...formData, instructions: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={4}
            placeholder="Any special notes, techniques, or important details that stylists should know when providing this service..."
          />
        </div>

        {/* Service Options Section */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h4 className="text-lg font-medium text-gray-900">
              Service Options
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-5 w-5"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="isActive"
                  className="text-sm font-semibold text-gray-900 cursor-pointer"
                >
                  Active Service
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Make this service available for customer booking
                </p>
              </div>
              <div className="flex-shrink-0">
                {formData.isActive ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={(e) =>
                    setFormData({ ...formData, isPopular: e.target.checked })
                  }
                  className="mt-1 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 h-5 w-5"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="isPopular"
                  className="text-sm font-semibold text-gray-900 cursor-pointer"
                >
                  Popular Service
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Feature this service in popular recommendations
                </p>
              </div>
              <div className="flex-shrink-0">
                {formData.isPopular ? (
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                ) : (
                  <Star className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-6 py-2.5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="px-6 py-2.5 flex items-center space-x-2"
          >
            {isEdit ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Update Service</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Create Service</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ServiceFormModal;
