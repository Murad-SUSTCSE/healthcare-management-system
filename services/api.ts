import axios, { AxiosInstance } from 'axios';
import type {
  User,
  AuthResponse,
  AuthCredentials,
  RegisterCredentials,
  ApiError,
  Appointment,
  Doctor,
  Hospital,
  Medicine,
  Order,
  CartItem,
  AmbulanceRequest,
  AmbulanceService,
} from '@/types';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Auth endpoints
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/auth/login', credentials);
      const { token } = response.data;
      this.setToken(token);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/auth/register', credentials);
      // Don't auto-login after registration - user should sign in manually
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await this.api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateProfile(data: { name?: string; phone?: string; dateOfBirth?: string; bloodGroup?: string }): Promise<User> {
    try {
      const response = await this.api.put('/auth/profile', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Doctor endpoints
  async getDoctors(): Promise<Doctor[]> {
    try {
      const response = await this.api.get('/doctors');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDoctor(id: string): Promise<Doctor> {
    try {
      const response = await this.api.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Appointment endpoints
  async getAppointments(): Promise<Appointment[]> {
    try {
      const response = await this.api.get('/appointments/my');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAdminAppointments(): Promise<any[]> {
    try {
      const response = await this.api.get('/appointments/admin/all');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bookAppointment(data: {
    doctorId: string;
    date: string;
    time: string;
    slotId?: number | string;
    notes?: string;
  }): Promise<Appointment> {
    try {
      const response = await this.api.post('/appointments', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelAppointment(id: string): Promise<void> {
    try {
      await this.api.delete(`/appointments/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Hospital endpoints
  async getHospitals(): Promise<Hospital[]> {
    try {
      const response = await this.api.get('/hospitals');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getHospital(id: string): Promise<Hospital> {
    try {
      const response = await this.api.get(`/hospitals/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Medicine endpoints
  async getMedicines(query?: string): Promise<Medicine[]> {
    try {
      const params = query ? { q: query } : {};
      const response = await this.api.get('/medicines', { params });
      // Transform backend response to match frontend Medicine type
      return response.data.map((medicine: any) => ({
        ...medicine,
        id: String(medicine.id),
        description: medicine.description || '',
        category: medicine.category || 'General',
        quantity: medicine.stock || 0,
        inStock: (medicine.stock || 0) > 0,
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMedicine(id: string): Promise<Medicine> {
    try {
      const response = await this.api.get(`/medicines/${id}`);
      const medicine = response.data;
      // Transform backend response to match frontend Medicine type
      return {
        ...medicine,
        id: String(medicine.id),
        description: medicine.description || '',
        category: medicine.category || 'General',
        quantity: medicine.stock || 0,
        inStock: (medicine.stock || 0) > 0,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Medicine Order endpoints
  async createMedicineOrder(items: { medicineId: number; quantity: number }[]): Promise<Order> {
    try {
      const response = await this.api.post('/medicines/orders', { items });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMyMedicineOrders(): Promise<Order[]> {
    try {
      const response = await this.api.get('/medicines/orders/my');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Medicine Order Management
  async getAllMedicineOrders(): Promise<Order[]> {
    try {
      const response = await this.api.get('/medicines/orders/all');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateMedicineOrderStatus(orderId: number, status: string): Promise<Order> {
    try {
      const response = await this.api.patch(`/medicines/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Order endpoints
  async createOrder(items: CartItem[], deliveryAddress: string): Promise<Order> {
    try {
      const response = await this.api.post('/orders', { items, deliveryAddress });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const response = await this.api.get('/orders');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrder(id: string): Promise<Order> {
    try {
      const response = await this.api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Ambulance endpoints
  async getAmbulanceServices(): Promise<AmbulanceService[]> {
    try {
      const response = await this.api.get('/ambulance/services');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async requestAmbulance(data: {
    pickupLocation: { latitude: number; longitude: number; address: string };
    dropoffLocation?: { latitude: number; longitude: number; address: string };
    reason: string;
    priority: 'normal' | 'urgent';
  }): Promise<AmbulanceRequest> {
    try {
      const response = await this.api.post('/ambulance/request', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAmbulanceRequest(id: string): Promise<AmbulanceRequest> {
    try {
      const response = await this.api.get(`/ambulance/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin: Ambulance Service Management
  async getAmbulanceServicesAdmin(): Promise<AmbulanceService[]> {
    try {
      const response = await this.api.get('/ambulance/services/admin');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createAmbulanceService(data: {
    companyName: string;
    phone: string;
    address?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<AmbulanceService> {
    try {
      const response = await this.api.post('/ambulance/services', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAmbulanceService(id: string, data: {
    companyName?: string;
    phone?: string;
    address?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<AmbulanceService> {
    try {
      const response = await this.api.put(`/ambulance/services/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAmbulanceService(id: string): Promise<void> {
    try {
      await this.api.delete(`/ambulance/services/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin endpoints - Doctor Account Management
  async createDoctorAccount(data: { name: string; specialization?: string; specializations?: string[]; fees?: number; hospitalId?: number }): Promise<{
    message: string;
    credentials: { email: string; password: string };
    doctor: any;
  }> {
    try {
      const response = await this.api.post('/doctor/admin/create', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAdminDoctorsList(): Promise<any[]> {
    try {
      const response = await this.api.get('/doctor/admin/list');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAdminUsers(): Promise<any[]> {
    try {
      const response = await this.api.get('/auth/admin/users');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAdminUser(userId: number): Promise<{ message: string }> {
    try {
      const response = await this.api.delete(`/auth/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAdminStats(): Promise<{ totalUsers: number; totalDoctors: number; approvedDoctors: number; totalAppointments: number }> {
    try {
      const response = await this.api.get('/auth/admin/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteDoctorAccount(doctorId: number): Promise<{ message: string }> {
    try {
      const response = await this.api.delete(`/doctor/admin/${doctorId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Doctor Dashboard endpoints
  async getDoctorProfile(): Promise<any> {
    try {
      const response = await this.api.get('/doctor/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateDoctorProfile(data: { specialization?: string; specializations?: string[]; fees?: number; hospitalId?: number; visitingHours?: string }): Promise<any> {
    try {
      const response = await this.api.put('/doctor/profile', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSpecializations(): Promise<string[]> {
    try {
      const response = await this.api.get('/doctors/specializations');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addDoctorAvailability(date: string, slots: { startTime: string; endTime: string }[]): Promise<any> {
    try {
      const response = await this.api.post('/doctor/availability', { date, slots });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDoctorAvailability(startDate?: string, endDate?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const response = await this.api.get(`/doctor/availability?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteDoctorAvailability(slotId: number): Promise<any> {
    try {
      const response = await this.api.delete(`/doctor/availability/${slotId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDoctorAppointments(status?: string, date?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (date) params.append('date', date);
      const response = await this.api.get(`/doctor/appointments?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateAppointmentStatus(appointmentId: number, status: string): Promise<any> {
    try {
      const response = await this.api.put(`/doctor/appointments/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Public: Get doctor availability for patients
  async getPublicDoctorAvailability(doctorId: number, date?: string): Promise<any[]> {
    try {
      const params = date ? `?date=${date}` : '';
      const response = await this.api.get(`/doctor/${doctorId}/availability${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Weekly Availability endpoints (weekday-based)
  async addWeeklyAvailability(dayOfWeek: number, slots: { startTime: string; endTime: string }[]): Promise<any> {
    try {
      const response = await this.api.post('/doctor/weekly-availability', { dayOfWeek, slots });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWeeklyAvailability(dayOfWeek?: number): Promise<any[]> {
    try {
      const params = dayOfWeek !== undefined ? `?dayOfWeek=${dayOfWeek}` : '';
      const response = await this.api.get(`/doctor/weekly-availability${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteWeeklyAvailability(slotId: number): Promise<any> {
    try {
      const response = await this.api.delete(`/doctor/weekly-availability/${slotId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateWeeklyAvailability(slotId: number, data: { startTime?: string; endTime?: string }): Promise<any> {
    try {
      const response = await this.api.put(`/doctor/weekly-availability/${slotId}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Public: Get doctor weekly availability for patients
  async getPublicDoctorWeeklyAvailability(doctorId: number, dayOfWeek?: number): Promise<any[]> {
    try {
      const params = dayOfWeek !== undefined ? `?dayOfWeek=${dayOfWeek}` : '';
      const response = await this.api.get(`/doctor/${doctorId}/weekly-availability${params}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper method for error handling
  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message,
        code: error.code,
        details: error.response?.data?.details,
      };
    }
    return {
      message: 'An unexpected error occurred',
    };
  }
}

export const apiService = new ApiService();
