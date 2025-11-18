import axios, { AxiosResponse } from "axios";
import { buildApiUrl } from "@/lib/urlUtils";

// Define interface types based on the models
interface UserDetails {
  _id: string;
  email: string;
  phoneNumber?: string;
  full_name: string;
  role?: "doctor" | "user";
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  _id: string;
  prescriptionText: string;
  medications: Medication[];
  diagnosis: string;
  doctor: UserDetails | string;
  patient: UserDetails | string;
  appointment?: string;
  dateIssued: string;
  notes: string;
  expiryDate: string | null;
  paymentStatus: "pending" | "paid";
  paymentDate?: string;
  paymentAmount: number | null;
  shareableId?: string;
  shareableUrl?: string;
  patientHistory?: string;
  treatmentPlan?: string;
  followUpDate?: string | null;
}

interface Patient extends UserDetails {
  appointmentCount: number;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentStatus?: string;
}

interface Booking {
  _id: string;
  doctor: string;
  date: string;
  time: string;
  user: UserDetails | string;
  issue: string;
  visitType?: "clinic" | "home";
  status: "scheduled" | "completed" | "cancelled" | "pending" | "confirmed";
  createdAt: string;
  updatedAt: string;
}

// Types for API requests and responses
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends UserDetails {
  password: string;
}

interface LoginResponse {
  token: string;
  user: UserDetails;
}

interface PrescriptionCreateData {
  patientId: string;
  prescriptionText?: string;
  medications?: Medication[];
  diagnosis?: string;
  notes?: string;
  paymentAmount?: number;
  expiryDate?: string;
  appointmentId?: string;
  patientHistory?: string;
  treatmentPlan?: string;
  followUpDate?: string;
}

interface PaymentUpdateData {
  paymentStatus: "pending" | "paid";
  paymentDate?: string;
  paymentAmount?: number;
}

interface BookingData {
  doctor: string;
  date: string;
  time: string;
  user?: string; // Make user ID optional since non-authenticated users won't have one
  issue: string;
  visitType?: "clinic" | "home";
  email: string; // Add email field for non-authenticated users
  phoneNumber: string; // Add phone number field for non-authenticated users
  full_name: string; // Add full name field for non-authenticated users
}

interface SlotAvailabilityData {
  doctorId: string;
  date: string;
  time: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL!;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or get from your auth state
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      // Redirect to login or refresh token
      localStorage.removeItem("token");
      // You might want to redirect to login page here
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (
    credentials: LoginCredentials
  ): Promise<AxiosResponse<LoginResponse>> =>
    api.post("/auth/login", credentials),
  register: (userData: RegisterData): Promise<AxiosResponse<LoginResponse>> =>
    api.post("/auth/register", userData),
  getUserDetails: (id: string): Promise<AxiosResponse<UserDetails>> =>
    api.get(`/auth/${id}`),
};

// Prescription API
export const prescriptionAPI = {
  getPrescriptions: (
    doctorId: string
  ): Promise<AxiosResponse<Prescription[]>> =>
    api.get(`/prescription/${doctorId}`),
  createPrescription: (
    doctorId: string,
    data: PrescriptionCreateData
  ): Promise<
    AxiosResponse<{
      prescription: Prescription;
      shareableUrl: string;
      message: string;
    }>
  > => api.post(`/prescription/create/${doctorId}`, data),
  getPatientsWithAppointments: (
    doctorId: string
  ): Promise<AxiosResponse<Patient[]>> =>
    api.get(`/prescription/${doctorId}/patients-with-appointments`),
  getPatientPaymentStatus: (
    doctorId: string,
    patientId: string
  ): Promise<AxiosResponse<Prescription[]>> =>
    api.get(`/prescription/${doctorId}/patient/${patientId}/payments`),
  updatePaymentStatus: (
    doctorId: string,
    prescriptionId: string,
    data: PaymentUpdateData
  ): Promise<AxiosResponse<{ prescription: Prescription; message: string }>> =>
    api.patch(`/prescription/${doctorId}/payment/${prescriptionId}`, data),
  getPrescriptionByShareableId: (
    shareableId: string
  ): Promise<AxiosResponse<Prescription>> =>
    axios.get(buildApiUrl(`prescription/share/${shareableId}`)), // Public endpoint, no auth needed
};

// Booking API
export const bookingAPI = {
  getBookings: (doctorId?: string): Promise<AxiosResponse<Booking[]>> =>
    doctorId ? api.get(`/booking/${doctorId}`) : api.get(`/booking/all`),
  getBooking: (id: string): Promise<AxiosResponse<Booking>> =>
    api.get(`/booking/single/${id}`),
  createBooking: (
    data: BookingData
  ): Promise<AxiosResponse<{ booking: Booking; message: string }>> =>
    api.post("/booking/create", data),
  updateBooking: (
    id: string,
    data: Partial<Booking>
  ): Promise<AxiosResponse<Booking>> => api.post(`/booking/update/${id}`, data),
  deleteBooking: (id: string): Promise<AxiosResponse<{ message: string }>> =>
    api.delete(`/booking/delete/${id}`),
  checkSlotAvailability: (
    data: SlotAvailabilityData
  ): Promise<AxiosResponse<{ message: string }>> =>
    api.post("/booking/time-slot", data),
  getBookingDetails: (
    doctorId: string,
    userId: string
  ): Promise<AxiosResponse<{ appointmentId: string | null }>> =>
    api.post(`/booking/${doctorId}/details/${userId}`),
};

// Role API
export const roleAPI = {
  getDoctors: (): Promise<AxiosResponse<UserDetails[]>> =>
    axios.get(buildApiUrl(`role/doctors`)), // Public endpoint
  updateRole: (data: {
    userId: string;
    role: string;
  }): Promise<AxiosResponse<{ message: string }>> =>
    api.post("/role/update", data),
  getRole: (id: string): Promise<AxiosResponse<{ role: string }>> =>
    api.get(`/role/${id}`),
};
