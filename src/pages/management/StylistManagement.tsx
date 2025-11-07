import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Star,
  Calendar,
  DollarSign,
  Eye,
  MoreVertical,
  Filter,
  Download,
  UserCheck,
  UserX,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { usePermissions } from "../../hooks/useAuth";
import { stylistService } from "../../services/stylistService";
import { userService } from "../../services/userService";
import type { Stylist, User, UserRole } from "../../types";

interface StylistFormData {
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  specialties: string[];
  experience: number;
  commissionRate: number;
  isAvailable: boolean;
  schedule: {
    [key: string]: {
      isWorking: boolean;
      startTime: string;
      endTime: string;
    };
  };
  bio?: string;
  avatar?: string;
}

const StylistManagement: React.FC = () => {
  const { canManageStylists, isAdmin } = usePermissions();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [formData, setFormData] = useState<StylistFormData>({
    fullName: "",
    email: "",
    phone: "",
    specialties: [],
    experience: 0,
    commissionRate: 15,
    isAvailable: true,
    schedule: {
      monday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      tuesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      wednesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      thursday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      friday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
      saturday: { isWorking: true, startTime: "09:00", endTime: "17:00" },
      sunday: { isWorking: false, startTime: "09:00", endTime: "17:00" },
    },
    bio: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const specialtyOptions = [
    "Haircut",
    "Beard Trim",
    "Hair Wash",
    "Hair Styling",
    "Hair Coloring",
    "Hair Treatment",
    "Wedding Package",
  ];

  useEffect(() => {
    if (canManageStylists) {
      loadStylists();
      loadAvailableUsers();
    }
  }, [canManageStylists]);

  const loadStylists = async () => {
    try {
      setLoading(true);
      const data = await stylistService.getAllStylists();
      setStylists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stylists");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const data = await userService.getUsers({ role: "USER" });
      setUsers(data.filter((user) => !user.role || user.role === "USER"));
    } catch (err) {
      console.error("Failed to load available users:", err);
    }
  };

  const filteredStylists = stylists.filter((stylist) => {
    const matchesSearch =
      stylist.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stylist.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && stylist.isAvailable) ||
      (filterStatus === "inactive" && !stylist.isAvailable);

    return matchesSearch && matchesFilter;
  });

  const handleCreateStylist = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      specialties: [],
      experience: 0,
      commissionRate: 15,
      isAvailable: true,
      schedule: {
        monday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
        tuesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
        wednesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
        thursday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
        friday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
        saturday: { isWorking: true, startTime: "09:00", endTime: "17:00" },
        sunday: { isWorking: false, startTime: "09:00", endTime: "17:00" },
      },
      bio: "",
    });
    setSelectedStylist(null);
    setShowCreateModal(true);
  };

  const handleEditStylist = (stylist: Stylist) => {
    setFormData({
      userId: stylist.userId,
      fullName: stylist.user.fullName,
      email: stylist.user.email,
      phone: stylist.user.phone,
      specialties: stylist.specialties || [],
      experience: stylist.experience || 0,
      commissionRate: stylist.commissionRate || 15,
      isAvailable: stylist.isAvailable,
      schedule: stylist.schedule || {
        monday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
        tuesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
        wednesday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
        thursday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
        friday: { isWorking: true, startTime: "09:00", endTime: "18:00" },
        saturday: { isWorking: true, startTime: "09:00", endTime: "17:00" },
        sunday: { isWorking: false, startTime: "09:00", endTime: "17:00" },
      },
      bio: stylist.bio || "",
      avatar: stylist.user.avatar,
    });
    setSelectedStylist(stylist);
    setShowEditModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      if (selectedStylist) {
        // Update existing stylist
        await stylistService.updateStylist(selectedStylist.id, {
          specialties: formData.specialties,
          experience: formData.experience,
          commissionRate: formData.commissionRate,
          isAvailable: formData.isAvailable,
          schedule: formData.schedule,
          bio: formData.bio,
        });

        // Update user info
        await userService.updateUser(selectedStylist.userId, {
          fullName: formData.fullName,
          phone: formData.phone,
          avatar: formData.avatar,
        });

        setShowEditModal(false);
      } else {
        // Create new stylist
        let userId = formData.userId;

        if (!userId) {
          // Create new user first
          const newUser = await userService.createUser({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            role: "STYLIST" as UserRole,
            password: "defaultpass123", // Should be changed on first login
          });
          userId = newUser.id;
        }

        // Create stylist profile
        await stylistService.createStylist({
          userId: userId!,
          specialties: formData.specialties,
          experience: formData.experience,
          commissionRate: formData.commissionRate,
          isAvailable: formData.isAvailable,
          schedule: formData.schedule,
          bio: formData.bio,
        });

        setShowCreateModal(false);
      }

      await loadStylists();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save stylist");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (stylist: Stylist) => {
    try {
      await stylistService.updateStylist(stylist.id, {
        isAvailable: !stylist.isAvailable,
      });
      await loadStylists();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update availability",
      );
    }
  };

  const handleDeleteStylist = async (stylist: Stylist) => {
    if (!isAdmin) {
      setError("Only administrators can delete stylists");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${stylist.user.fullName}?`,
      )
    ) {
      try {
        await stylistService.deleteStylist(stylist.id);
        await loadStylists();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete stylist",
        );
      }
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const renderStylistModal = (isEdit: boolean) => (
    <Modal
      isOpen={isEdit ? showEditModal : showCreateModal}
      onClose={() =>
        isEdit ? setShowEditModal(false) : setShowCreateModal(false)
      }
      title={isEdit ? "Edit Stylist" : "Create New Stylist"}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              disabled={isEdit}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience (years)
            </label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  experience: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
            />
          </div>
        </div>

        {/* Specialties */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialties
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {specialtyOptions.map((specialty) => (
              <label key={specialty} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.specialties.includes(specialty)}
                  onChange={() => handleSpecialtyToggle(specialty)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{specialty}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Commission Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              value={formData.commissionRate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  commissionRate: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="0"
              max="100"
              step="0.5"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) =>
                setFormData({ ...formData, isAvailable: e.target.checked })
              }
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="isAvailable"
              className="text-sm font-medium text-gray-700"
            >
              Available for Bookings
            </label>
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="Brief description about the stylist..."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
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
            {isEdit ? "Update Stylist" : "Create Stylist"}
          </Button>
        </div>
      </form>
    </Modal>
  );

  if (!canManageStylists) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to manage stylists.
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
            Stylist Management
          </h1>
          <p className="text-gray-600">
            Manage stylists, schedules, and performance
          </p>
        </div>
        <Button
          onClick={handleCreateStylist}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stylist</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search stylists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
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

      {/* Stylists Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <Card.Body>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : filteredStylists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStylists.map((stylist) => (
            <Card
              key={stylist.id}
              className="hover:shadow-md transition-shadow"
            >
              <Card.Body>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {stylist.user.avatar ? (
                        <img
                          src={stylist.user.avatar}
                          alt={stylist.user.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        stylist.user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {stylist.user.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {stylist.user.email}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {Number(stylist.rating || 0).toFixed(1)} (
                          {stylist.totalBookings || 0} bookings)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 rounded-md">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        stylist.isAvailable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {stylist.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">
                      {stylist.experience || 0} years
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Commission</span>
                    <span className="font-medium">
                      {stylist.commissionRate || 15}%
                    </span>
                  </div>

                  {Array.isArray(stylist.specialties) &&
                    stylist.specialties.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">
                          Specialties:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {stylist.specialties.slice(0, 3).map((specialty) => (
                            <span
                              key={specialty}
                              className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                          {stylist.specialties.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{stylist.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditStylist(stylist)}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>

                  <Button
                    variant={stylist.isAvailable ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleToggleAvailability(stylist)}
                  >
                    {stylist.isAvailable ? (
                      <UserX className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </Button>

                  {isAdmin && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteStylist(stylist)}
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
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Stylists Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== "all"
                  ? "No stylists match your current search and filters."
                  : "Get started by adding your first stylist."}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button onClick={handleCreateStylist}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Stylist
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Modals */}
      {renderStylistModal(false)}
      {renderStylistModal(true)}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md shadow-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
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

export default StylistManagement;
