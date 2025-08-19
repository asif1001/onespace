// User and Authentication Types
export interface User {
  uid: string;
  email: string;
  role: 'driver' | 'admin';
  name: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Delivery Types
export interface Delivery {
  id: string;
  transactionId: string;
  driverId: string;
  driverName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  oilType: string;
  quantity: number;
  scheduledDate: Date;
  deliveredDate?: Date;
  status: 'pending' | 'in_progress' | 'delivered' | 'cancelled';
  photos: DeliveryPhoto[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryPhoto {
  id: string;
  url: string;
  type: 'before' | 'during' | 'after' | 'receipt';
  timestamp: Date;
  description?: string;
}

// Complaint Types
export interface Complaint {
  id: string;
  deliveryId: string;
  transactionId: string;
  customerName: string;
  customerPhone: string;
  complaintType: 'quality' | 'quantity' | 'service' | 'damage' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Form Types
export interface DeliveryFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  oilType: string;
  quantity: number;
  scheduledDate: string;
  notes?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Dashboard Types
export interface DashboardStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  activeDrivers: number;
  openComplaints: number;
  todaysDeliveries: number;
}

// Filter Types
export interface DeliveryFilters {
  status?: string;
  driverId?: string;
  dateFrom?: string;
  dateTo?: string;
  customerName?: string;
}

export interface ComplaintFilters {
  status?: string;
  type?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (uid: string, role: 'driver' | 'admin') => Promise<void>;
}

export interface DeliveryContextType {
  deliveries: Delivery[];
  loading: boolean;
  createDelivery: (delivery: DeliveryFormData) => Promise<string>;
  updateDelivery: (id: string, updates: Partial<Delivery>) => Promise<void>;
  deleteDelivery: (id: string) => Promise<void>;
  uploadPhoto: (deliveryId: string, file: File, type: DeliveryPhoto['type']) => Promise<void>;
}