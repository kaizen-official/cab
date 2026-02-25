import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://backend.cab.kaizen.org.in';

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | undefined>;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('accessToken');
  }

  private async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem('refreshToken');
  }

  async setTokens(access: string, refresh: string) {
    await AsyncStorage.setItem('accessToken', access);
    await AsyncStorage.setItem('refreshToken', refresh);
  }

  async clearTokens() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | undefined>,
  ): string {
    let url = `${this.baseUrl}/api${path}`;
    if (params) {
      const qs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
        )
        .join('&');
      if (qs) {
        url += `?${qs}`;
      }
    }
    return url;
  }

  async request<T = unknown>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const {method = 'GET', body, headers = {}, params} = options;
    const token = await this.getToken();

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    let res: Response;
    try {
      res = await fetch(this.buildUrl(path, params), config);
    } catch {
      throw new ApiError('Could not reach server.', 0, undefined);
    }

    if (res.status === 401 && token) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        const newToken = await this.getToken();
        (config.headers as Record<string, string>).Authorization =
          `Bearer ${newToken}`;
        res = await fetch(this.buildUrl(path, params), config);
      }
    }

    let data: {message?: string; data?: T; errors?: unknown};
    try {
      data = await res.json();
    } catch {
      throw new ApiError(
        res.ok
          ? 'Invalid response from server'
          : `Request failed (${res.status})`,
        res.status,
        undefined,
      );
    }

    if (!res.ok) {
      throw new ApiError(
        data.message || 'Something went wrong',
        res.status,
        data.errors as {field: string; message: string}[] | undefined,
      );
    }

    return data.data as T;
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const res = await fetch(this.buildUrl('/auth/refresh-token'), {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refreshToken}),
      });

      if (!res.ok) {
        await this.clearTokens();
        return false;
      }

      const data = await res.json();
      await this.setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    } catch {
      await this.clearTokens();
      return false;
    }
  }

  // ── Auth ──

  register(body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    return this.request<{user: User; tokens: Tokens; otpSent: boolean}>(
      '/auth/register',
      {method: 'POST', body},
    );
  }

  login(body: {email: string; password: string}) {
    return this.request<{user: User; tokens: Tokens}>('/auth/login', {
      method: 'POST',
      body,
    });
  }

  verifyEmail(body: {email: string; code: string}) {
    return this.request<{verified: boolean}>('/auth/verify-email', {
      method: 'POST',
      body,
    });
  }

  resendVerification(email: string) {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: {email},
    });
  }

  forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: {email},
    });
  }

  resetPassword(body: {email: string; code: string; newPassword: string}) {
    return this.request('/auth/reset-password', {method: 'POST', body});
  }

  logout() {
    return this.request('/auth/logout', {method: 'POST'});
  }

  getMe() {
    return this.request<User>('/auth/me');
  }

  // ── User ──

  getMyProfile() {
    return this.request<UserProfile>('/users/me');
  }

  updateProfile(
    body: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
      gender: string;
      bio: string;
      whatsappNumber: string;
      program: string;
      academicYear: string;
      whatsappVisible: boolean;
    }>,
  ) {
    return this.request<UserProfile>('/users/me', {method: 'PATCH', body});
  }

  setCollege(college: string) {
    return this.request<UserProfile>('/users/me/college', {
      method: 'PATCH',
      body: {college},
    });
  }

  // ── Uploads (URL saved via backend, file uploaded client-side to Supabase) ──

  saveAvatarUrl(url: string) {
    return this.request<{id: string; avatarUrl: string}>('/uploads/avatar', {
      method: 'PATCH',
      body: {url},
    });
  }

  saveStudentIdUrl(url: string) {
    return this.request<{id: string; studentIdUrl: string; studentIdStatus: string}>(
      '/uploads/student-id',
      {method: 'PATCH', body: {url}},
    );
  }

  // ── Rides ──

  getSuggestions(params?: {fromCity?: string; toCity?: string}) {
    return this.request<Ride[]>('/rides/suggestions', {
      params: params as Record<string, string>,
    });
  }

  searchRides(params: RideSearchParams) {
    return this.request<PaginatedResponse<Ride>>('/rides/search', {
      params: params as Record<string, string>,
    });
  }

  getMyRides(params?: {status?: string; page?: number; limit?: number}) {
    return this.request<PaginatedResponse<Ride>>('/rides/mine', {
      params: params as Record<string, string>,
    });
  }

  getRide(id: string) {
    return this.request<RideDetail>(`/rides/${id}`);
  }

  createRide(body: CreateRideBody) {
    return this.request<Ride>('/rides', {method: 'POST', body});
  }

  cancelRide(id: string) {
    return this.request(`/rides/${id}/cancel`, {method: 'POST'});
  }

  departRide(id: string) {
    return this.request<Ride>(`/rides/${id}/depart`, {method: 'POST'});
  }

  completeRide(id: string) {
    return this.request(`/rides/${id}/complete`, {method: 'POST'});
  }

  // ── Bookings ──

  requestBooking(body: {
    rideId: string;
    seatsBooked?: number;
    message?: string;
  }) {
    return this.request<Booking>('/bookings', {method: 'POST', body});
  }

  getMyBookings(params?: {status?: string; page?: number; limit?: number}) {
    return this.request<PaginatedResponse<Booking>>('/bookings/mine', {
      params: params as Record<string, string>,
    });
  }

  confirmBooking(id: string) {
    return this.request<Booking>(`/bookings/${id}/confirm`, {method: 'POST'});
  }

  rejectBooking(id: string) {
    return this.request<Booking>(`/bookings/${id}/reject`, {method: 'POST'});
  }

  cancelBooking(id: string) {
    return this.request<Booking>(`/bookings/${id}/cancel`, {method: 'POST'});
  }

  // ── Notifications ──

  getNotifications(params?: {unreadOnly?: string; page?: number}) {
    return this.request<PaginatedResponse<Notification> & {unreadCount: number}>(
      '/notifications',
      {params: params as Record<string, string>},
    );
  }

  markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, {method: 'PATCH'});
  }

  markAllNotificationsRead() {
    return this.request('/notifications/read-all', {method: 'PATCH'});
  }
}

// ── Error class ──

export class ApiError extends Error {
  status: number;
  errors?: {field: string; message: string}[];

  constructor(
    message: string,
    status: number,
    errors?: {field: string; message: string}[],
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// ── Types ──

export type Tokens = {accessToken: string; refreshToken: string};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified?: boolean;
  college?: string | null;
  collegeVerified?: boolean;
  gender?: string | null;
  isActive?: boolean;
  avatarUrl?: string | null;
};

export type UserProfile = User & {
  phone?: string | null;
  bio?: string | null;
  whatsappNumber?: string | null;
  whatsappVisible?: boolean;
  program?: string | null;
  academicYear?: string | null;
  studentIdUrl?: string | null;
  studentIdStatus?: string;
  createdAt: string;
};

export type RideCreator = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  college?: string | null;
  collegeVerified?: boolean;
  whatsappNumber?: string | null;
  phone?: string | null;
};

export type Ride = {
  id: string;
  fromCity: string;
  fromAddress: string;
  toCity: string;
  toAddress: string;
  departureTime: string;
  estimatedArrival?: string | null;
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  vehicle?: string | null;
  vehicleNumber?: string | null;
  notes?: string | null;
  allowedGenders: string[];
  status: string;
  urgencyLabel?: string;
  confirmedCount?: number;
  createdAt: string;
  creator: RideCreator;
};

export type RideDetail = Ride & {
  bookings: {
    id: string;
    seatsBooked: number;
    status: string;
    passenger: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
      college?: string | null;
    };
  }[];
};

export type Booking = {
  id: string;
  seatsBooked: number;
  status: string;
  message?: string | null;
  createdAt: string;
  ride: {
    id: string;
    fromCity: string;
    fromAddress: string;
    toCity: string;
    toAddress: string;
    departureTime: string;
    pricePerSeat: number;
    status: string;
    creator: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
    };
  };
  passenger: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    college?: string | null;
  };
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, string> | null;
  read: boolean;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type RideSearchParams = {
  fromCity?: string;
  toCity?: string;
  date?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
  college?: string;
};

export type CreateRideBody = {
  fromCity: string;
  fromAddress: string;
  toCity: string;
  toAddress: string;
  departureTime: string;
  totalSeats: number;
  pricePerSeat: number;
  vehicle?: string;
  vehicleNumber?: string;
  notes?: string;
};

const api = new ApiClient(API_URL);
export default api;
