const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

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

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  setTokens(access: string, refresh: string) {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  }

  clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
    const url = new URL(`${this.baseUrl}/api${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  async request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, params } = options;
    const token = this.getToken();

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    let res = await fetch(this.buildUrl(path, params), config);

    if (res.status === 401 && token) {
      const refreshed = await this.tryRefresh();
      if (refreshed) {
        config.headers = {
          ...config.headers as Record<string, string>,
          Authorization: `Bearer ${this.getToken()}`,
        };
        res = await fetch(this.buildUrl(path, params), config);
      }
    }

    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(data.message || "Something went wrong", res.status, data.errors);
    }

    return data.data as T;
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(this.buildUrl("/auth/refresh-token"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        this.clearTokens();
        return false;
      }

      const data = await res.json();
      this.setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  // ── Auth ──

  register(body: { email: string; password: string; firstName: string; lastName: string }) {
    return this.request<{ user: User; tokens: Tokens; otpSent: boolean }>("/auth/register", { method: "POST", body });
  }

  login(body: { email: string; password: string }) {
    return this.request<{ user: User; tokens: Tokens }>("/auth/login", { method: "POST", body });
  }

  verifyEmail(body: { email: string; code: string }) {
    return this.request<{ verified: boolean }>("/auth/verify-email", { method: "POST", body });
  }

  resendVerification(email: string) {
    return this.request("/auth/resend-verification", { method: "POST", body: { email } });
  }

  forgotPassword(email: string) {
    return this.request("/auth/forgot-password", { method: "POST", body: { email } });
  }

  resetPassword(body: { email: string; code: string; newPassword: string }) {
    return this.request("/auth/reset-password", { method: "POST", body });
  }

  logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  getMe() {
    return this.request<User>("/auth/me");
  }

  // ── User ──

  getMyProfile() {
    return this.request<UserProfile>("/users/me");
  }

  updateProfile(body: Partial<{ firstName: string; lastName: string; phone: string; gender: string; bio: string }>) {
    return this.request<UserProfile>("/users/me", { method: "PATCH", body });
  }

  setCollege(college: string) {
    return this.request<UserProfile>("/users/me/college", { method: "PATCH", body: { college } });
  }

  getPublicProfile(id: string) {
    return this.request<PublicProfile>(`/users/${id}`);
  }

  // ── Rides ──

  searchRides(params: RideSearchParams) {
    return this.request<PaginatedResponse<Ride>>("/rides/search", { params: params as Record<string, string> });
  }

  getMyRides(params?: { status?: string; page?: number; limit?: number }) {
    return this.request<PaginatedResponse<Ride>>("/rides/mine", { params: params as Record<string, string> });
  }

  getRide(id: string) {
    return this.request<RideDetail>(`/rides/${id}`);
  }

  createRide(body: CreateRideBody) {
    return this.request<Ride>("/rides", { method: "POST", body });
  }

  updateRide(id: string, body: Partial<CreateRideBody>) {
    return this.request<Ride>(`/rides/${id}`, { method: "PATCH", body });
  }

  cancelRide(id: string) {
    return this.request(`/rides/${id}/cancel`, { method: "POST" });
  }

  departRide(id: string) {
    return this.request<Ride>(`/rides/${id}/depart`, { method: "POST" });
  }

  completeRide(id: string) {
    return this.request(`/rides/${id}/complete`, { method: "POST" });
  }

  // ── Bookings ──

  requestBooking(body: { rideId: string; seatsBooked?: number; message?: string }) {
    return this.request<Booking>("/bookings", { method: "POST", body });
  }

  getMyBookings(params?: { status?: string; page?: number; limit?: number }) {
    return this.request<PaginatedResponse<Booking>>("/bookings/mine", { params: params as Record<string, string> });
  }

  getRideBookings(rideId: string, params?: { status?: string; page?: number }) {
    return this.request<PaginatedResponse<Booking>>(`/bookings/ride/${rideId}`, { params: params as Record<string, string> });
  }

  confirmBooking(id: string) {
    return this.request<Booking>(`/bookings/${id}/confirm`, { method: "POST" });
  }

  rejectBooking(id: string) {
    return this.request<Booking>(`/bookings/${id}/reject`, { method: "POST" });
  }

  cancelBooking(id: string) {
    return this.request<Booking>(`/bookings/${id}/cancel`, { method: "POST" });
  }

  // ── Reviews ──

  createReview(body: { targetId: string; rideId: string; rating: number; comment?: string }) {
    return this.request<Review>("/reviews", { method: "POST", body });
  }

  getUserReviews(userId: string, params?: { page?: number }) {
    return this.request<PaginatedResponse<Review>>(`/reviews/user/${userId}`, { params: params as Record<string, string> });
  }

  // ── Notifications ──

  getNotifications(params?: { unreadOnly?: string; page?: number }) {
    return this.request<PaginatedResponse<Notification> & { unreadCount: number }>("/notifications", { params: params as Record<string, string> });
  }

  getUnreadCount() {
    return this.request<{ count: number }>("/notifications/unread-count");
  }

  markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: "PATCH" });
  }

  markAllNotificationsRead() {
    return this.request("/notifications/read-all", { method: "PATCH" });
  }
}

// ── Error class ──

export class ApiError extends Error {
  status: number;
  errors?: { field: string; message: string }[];

  constructor(message: string, status: number, errors?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// ── Types ──

export type Tokens = { accessToken: string; refreshToken: string };

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
};

export type UserProfile = User & {
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
};

export type PublicProfile = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  college?: string | null;
  collegeVerified?: boolean;
  gender?: string | null;
  createdAt: string;
  stats: { ridesCreated: number; ridesJoined: number; reviewCount: number; avgRating: number | null };
};

export type RideCreator = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  college?: string | null;
  collegeVerified?: boolean;
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
  createdAt: string;
  creator: RideCreator;
};

export type RideDetail = Ride & {
  bookings: {
    id: string;
    seatsBooked: number;
    status: string;
    passenger: { id: string; firstName: string; lastName: string; avatarUrl?: string | null; college?: string | null };
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
    creator: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  };
  passenger: { id: string; firstName: string; lastName: string; avatarUrl?: string | null; college?: string | null };
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  rideId: string;
  author: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  target: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
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
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
};

export type RideSearchParams = {
  fromCity?: string;
  toCity?: string;
  date?: string;
  minSeats?: string;
  maxPrice?: string;
  college?: string;
  sortBy?: string;
  page?: string;
  limit?: string;
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
  estimatedArrival?: string;
  allowedGenders?: string[];
};

const api = new ApiClient(API_URL);
export default api;
