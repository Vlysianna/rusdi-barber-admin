// User Role enum
export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  STYLIST = "STYLIST",
  CUSTOMER = "CUSTOMER",
}

// User and Authentication types
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phone: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Stylist types
export interface Stylist {
  id: string;
  userId: string;
  user: User;
  bio?: string;
  profileImage?: string;
  specialties?: string[];
  specializations?: string[];
  experience?: number;
  rating?: number;
  totalReviews?: number;
  totalBookings?: number;
  revenue?: string;
  commissionRate?: number;
  isActive: boolean;
  isAvailable: boolean;
  workingHours?: WorkingHours[];
  schedule?: {
    [key: string]: {
      isWorking: boolean;
      startTime: string;
      endTime: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  id: string;
  stylistId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:mm format
  endTime: string;
  isActive: boolean;
}

// Service types
export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: number;
  category: string;
  isActive: boolean;
  isPopular?: boolean;
  requirements?: string[];
  instructions?: string;
  image?: string;
  tags?: string[];
  bookingCount?: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

// Booking types
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Booking {
  id: string;
  customerId: string;
  stylistId: string;
  serviceId: string;
  customer: User;
  stylist: Stylist;
  service: Service;
  appointmentDate: string;
  appointmentTime: string;
  status: BookingStatus;
  notes?: string;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: string;
  method: string;
  status: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Additional Service types
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  category: ServiceCategory;
  name: string;
  description?: string;
  price: string; // decimal as string
  duration: number; // minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking types
export interface Booking {
  id: string;
  customerId: string;
  customer: User;
  stylistId: string;
  stylist: Stylist;
  serviceId: string;
  service: Service;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  totalPrice: string; // decimal as string
  createdAt: string;
  updatedAt: string;
  payment?: Payment;
  review?: Review;
}

export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
} as const;

export type BookingStatusType =
  (typeof BookingStatus)[keyof typeof BookingStatus];

// Payment types
export interface Payment {
  id: string;
  bookingId: string;
  booking: Booking;
  amount: string; // decimal as string
  paymentMethod: string;
  status: string;
  transactionId?: string;
  paymentGatewayResponse?: Record<string, unknown>;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const PaymentMethod = {
  CASH: "CASH",
  CREDIT_CARD: "CREDIT_CARD",
  DEBIT_CARD: "DEBIT_CARD",
  DIGITAL_WALLET: "DIGITAL_WALLET",
  BANK_TRANSFER: "BANK_TRANSFER",
} as const;

export type PaymentMethodType =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
} as const;

export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

// Review types
export interface Review {
  id: string;
  bookingId: string;
  booking: Booking;
  customerId: string;
  customer: User;
  stylistId: string;
  stylist: Stylist;
  rating: number; // 1-5
  comment?: string;
  isModerated: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Promo and Loyalty types
export interface PromoCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: string; // decimal as string or percentage
  minOrderAmount?: string; // decimal as string
  maxDiscount?: string; // decimal as string
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validTo: string;
  createdAt: string;
  updatedAt: string;
}

export const DiscountType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED_AMOUNT: "FIXED_AMOUNT",
} as const;

export type DiscountTypeType = (typeof DiscountType)[keyof typeof DiscountType];

export interface LoyaltyPoints {
  id: string;
  customerId: string;
  customer: User;
  points: number;
  totalEarned: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Statistics types
export interface DashboardStats {
  totalCustomers: number;
  totalBookings: number;
  totalRevenue: string; // decimal as string
  averageRating: number;
  todayBookings: number;
  monthlyBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  topStylists: TopStylist[];
  recentBookings: Booking[];
  monthlyRevenue: MonthlyRevenue[];
  bookingsByStatus: BookingStatusCount[];
}

export interface TopStylist {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  totalBookings: number;
  revenue: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: string;
  bookings: number;
}

export interface BookingStatusCount {
  status: string;
  count: number;
  percentage: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface StylistForm {
  userId?: string;
  bio?: string;
  profileImage?: File | string;
  specializations: string[];
  experience: number;
  workingHours: WorkingHoursForm[];
}

export interface WorkingHoursForm {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ServiceForm {
  categoryId: string;
  name: string;
  description?: string;
  price: string;
  duration: number;
  isActive: boolean;
}

export interface ServiceCategoryForm {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface PromoCodeForm {
  code: string;
  name: string;
  description?: string;
  discountType: string;
  discountValue: string;
  minOrderAmount?: string;
  maxDiscount?: string;
  usageLimit?: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

// Filter and Search types
export interface BookingFilters {
  status?: string[];
  stylistId?: string;
  serviceId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface StylistFilters {
  specialization?: string;
  minRating?: number;
  isActive?: boolean;
  search?: string;
}

export interface ServiceFilters {
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  isActive?: boolean;
  search?: string;
}

export interface ReviewFilters {
  stylistId?: string;
  minRating?: number;
  maxRating?: number;
  isModerated?: boolean;
  isVisible?: boolean;
  search?: string;
}

// UI Component types
export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  resource?: Record<string, unknown>;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

// Toast types
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

// Common utility types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
