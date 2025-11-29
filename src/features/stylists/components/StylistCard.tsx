import React from 'react';
import { Edit, Trash2, MoreVertical, Star, Calendar, Phone, Award } from 'lucide-react';
import { Stylist } from '../../../lib/api';
import { Card, Badge } from '../../../shared/components';

interface StylistCardProps {
  stylist: Stylist;
  onEdit: (stylist: Stylist) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onManageSchedule: (stylist: Stylist) => void;
}

const StylistCard: React.FC<StylistCardProps> = ({
  stylist,
  onEdit,
  onDelete,
  onToggleActive,
  onManageSchedule,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const displayName = stylist.name || stylist.user?.fullName || 'Stylist';
  const displayContact = stylist.phoneNumber || stylist.user?.phone || stylist.user?.email;
  const displaySpecialization = stylist.specialization || (Array.isArray(stylist.specialties) ? stylist.specialties.join(', ') : '');

  return (
    <Card hover className="relative overflow-hidden">
      {/* Status Badge */}
      <div className="absolute top-3 left-3 z-10">
        {stylist.isActive || stylist.isAvailable ? (
          <Badge variant="success" size="sm">
            Aktif
          </Badge>
        ) : (
          <Badge variant="secondary" size="sm">
            Nonaktif
          </Badge>
        )}
      </div>

      {/* Menu Dropdown */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-30">
              <button
                onClick={() => {
                  onEdit(stylist);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2 text-blue-600" />
                Edit Profil
              </button>
              <button
                onClick={() => {
                  onManageSchedule(stylist);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
              >
                <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                Kelola Jadwal
              </button>
              <button
                onClick={() => {
                  onToggleActive(stylist.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                {stylist.isActive || stylist.isAvailable ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
              <button
                onClick={() => {
                  onDelete(stylist.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </button>
            </div>
          </>
        )}
      </div>

      {/* Profile Photo */}
      <div className="flex justify-center pt-8 pb-4">
        {stylist.photoUrl ? (
          <img
            src={stylist.photoUrl}
            alt={displayName}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center border-4 border-white shadow-lg">
            <span className="text-3xl font-bold text-white">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Stylist Info */}
      <div className="px-4 pb-4 text-center space-y-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{displayName}</h3>
          {displaySpecialization && (
            <p className="text-sm text-gray-600 mt-1">{displaySpecialization}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {typeof stylist.rating === 'number' ? stylist.rating.toFixed(1) : Number(stylist.rating || 0).toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {stylist.totalBookings || 0}
            </p>
            <p className="text-xs text-gray-500">Booking</p>
          </div>
        </div>

        {/* Contact */}
        {displayContact && (
          <div className="flex items-center justify-center text-sm text-gray-600 pt-2 border-t border-gray-100">
            <Phone className="w-4 h-4 mr-2" />
            {displayContact}
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-3">
          <button
            onClick={() => onEdit(stylist)}
            className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onManageSchedule(stylist)}
            className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Jadwal
          </button>
        </div>
      </div>
    </Card>
  );
};

export default StylistCard;
