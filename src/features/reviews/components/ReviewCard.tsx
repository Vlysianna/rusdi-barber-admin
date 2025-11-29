import React from 'react';
import { Review } from '../../../lib/api';
import { Card, Badge } from '../../../shared/components';
import { formatDate } from '../../../lib/utils/format';
import { Star, Eye, EyeOff, Trash2, User } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onToggleVisibility,
  onDelete,
}) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                Customer ID: {review.customerId.substring(0, 8)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-600">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {review.isVisible ? (
              <Badge variant="success" size="sm">
                <Eye className="w-3 h-3 mr-1" />
                Tampil
              </Badge>
            ) : (
              <Badge variant="secondary" size="sm">
                <EyeOff className="w-3 h-3 mr-1" />
                Sembunyi
              </Badge>
            )}
          </div>
        </div>

        {/* Review Content */}
        {review.comment && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              "{review.comment}"
            </p>
          </div>
        )}

        {/* Booking Info */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Booking ID: {review.bookingId.substring(0, 16)}...
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => onToggleVisibility(review.id)}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
          >
            {review.isVisible ? (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Sembunyikan
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Tampilkan
              </>
            )}
          </button>
          <button
            onClick={() => onDelete(review.id)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Hapus
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ReviewCard;
