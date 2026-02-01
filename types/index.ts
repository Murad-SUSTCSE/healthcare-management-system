// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'DOCTOR';
  createdAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Appointment Types
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  specializations?: string[];
  hospital: string;
  hospitalAddress?: string;
  fees?: number;
  visitingHours?: string;
  avatar?: string;
  rating: number;
  availableSlots?: string[];
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctor?: Doctor;
  doctorName?: string;
  specialty?: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
}

// Hospital Types
export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  departments: string[];
  emergencyService: boolean;
  rating: number;
  image?: string;
}

// Medicine Types
export interface Medicine {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
  inStock: boolean;
}

export interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  deliveryAddress: string;
  createdAt: Date;
}

// Ambulance Types
export interface AmbulanceService {
  id: string;
  companyName: string;
  phone: string;
  address?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AmbulanceRequest {
  id: string;
  userId: string;
  status: 'requested' | 'accepted' | 'arrived' | 'completed';
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  reason: string;
  priority: 'normal' | 'urgent';
  driverDetails?: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
  estimatedArrival?: number; // in minutes
  createdAt: Date;
  completedAt?: Date;
}

// Error Type
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
