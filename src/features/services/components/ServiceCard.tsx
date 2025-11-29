import React from 'react';
import { Edit, Trash2, MoreVertical, Star, Clock } from 'lucide-react';
import { Service } from '../../../lib/api';
import { Card, Badge } from '../../../shared/components';
import { formatCurrency } from '../../../lib/utils/format';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      haircut: 'Potong Rambut',
      beard_trim: 'Cukur Jenggot',
      hair_wash: 'Keramas',
      styling: 'Styling',
      coloring: 'Pewarnaan',
      treatment: 'Perawatan',
      package: 'Paket',
    };
    return labels[category] || category;
  };

  return (
    <Card hover className="relative overflow-hidden">
      {/* Popular Badge */}
      {service.isPopular && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="warning">
            <Star className="w-3 h-3 mr-1" />
            Populer
          </Badge>
        </div>
      )}

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
                  onEdit(service);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2 text-blue-600" />
                Edit
              </button>
              <button
                onClick={() => {
                  onToggleActive(service.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                {service.isActive ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
              <button
                onClick={() => {
                  onDelete(service.id);
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

      {/* Service Image */}
      <div className="h-40 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        {service.image ? (
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">✂️</div>
        )}
      </div>

      {/* Service Info */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {service.name}
            </h3>
            {!service.isActive && (
              <Badge variant="secondary" size="sm">
                Nonaktif
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {service.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <Badge variant="info" size="sm">
              {getCategoryLabel(service.category)}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            {service.duration} min
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs text-gray-500">Harga</p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(service.price)}
            </p>
          </div>
          <button
            onClick={() => onEdit(service)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
