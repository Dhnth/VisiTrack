// types/index.ts

// ==============================================
// INSTANCE
// ==============================================
export interface Instance {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  logo: string | null;
  plan: 'starter' | 'business' | 'enterprise';
  subscription_start: Date;
  subscription_end: Date;
  subscription_status: 'active' | 'expired' | 'trial';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ==============================================
// USER
// ==============================================
export interface User {
  id: number;
  instance_id: number | null;
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'ppid' | 'petugas';
  created_at: Date;
  updated_at: Date;
}

// User dengan data tambahan (untuk login response)
export interface UserWithSlug extends User {
  slug: string | null;
}

// User untuk session
export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
  instance_id: number | null;
  slug: string | null;
}

// ==============================================
// GUEST
// ==============================================
export interface Guest {
  id: number;
  instance_id: number;
  employee_id: number;
  created_by: number | null;
  name: string;
  institution: string | null;
  purpose: string;
  photo_url: string;
  status: 'pending' | 'active' | 'done' | 'rejected';
  check_in_at: Date | null;
  check_out_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Guest dengan data relasi (untuk ditampilkan di dashboard)
export interface GuestWithRelations extends Guest {
  employee_name?: string;
  employee_nip?: string;
  employee_department?: string;
  created_by_name?: string;
  instance_name?: string;
  instance_slug?: string;
}

// ==============================================
// EMPLOYEE
// ==============================================
export interface Employee {
  id: number;
  instance_id: number;
  nip: string | null;
  name: string;
  department: string;
  phone: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Employee dengan data instansi
export interface EmployeeWithInstance extends Employee {
  instance_name?: string;
  instance_slug?: string;
}

// ==============================================
// SETTINGS
// ==============================================
export interface Settings {
  id: number;
  instance_id: number;
  qr_mode: 'static' | 'dynamic';
  token_interval: number | null;
  created_at: Date;
  updated_at: Date;
}

// ==============================================
// ACCESS TOKEN
// ==============================================
export interface AccessToken {
  id: number;
  instance_id: number;
  token: string;
  expired_at: Date | null;
  usage_count: number;
  created_at: Date;
}

// ==============================================
// ACTIVITY LOG
// ==============================================
export interface ActivityLog {
  id: number;
  instance_id: number | null;
  user_id: number | null;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  table_name: string | null;
  record_id: number | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  old_data: unknown;
  new_data: unknown;
  created_at: Date;
}

// Activity log dengan data user (untuk ditampilkan)
export interface ActivityLogWithUser extends ActivityLog {
  user_name?: string;
  user_email?: string;
  user_role?: string;
  instance_name?: string;
}

// ==============================================
// DASHBOARD STATS
// ==============================================
export interface DashboardStats {
  total_instances: number;
  total_users: number;
  total_guests_today: number;
  total_pending_guests: number;
  total_active_guests: number;
  active_instances: number;
  expired_instances: number;
}

// ==============================================
// EXPIRING INSTANCE
// ==============================================
export interface ExpiringInstance {
  id: number;
  name: string;
  slug: string;
  subscription_end: Date;
  subscription_status: 'active' | 'expired' | 'trial';
  days_left: number;
  is_expired: boolean;
}

// ==============================================
// AUTH
// ==============================================
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  success: boolean;
  user: SessionUser;
  error?: string;
}

// ==============================================
// API RESPONSE
// ==============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==============================================
// PAGINATION
// ==============================================
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==============================================
// GUEST STATS (untuk dashboard petugas/ppid)
// ==============================================
export interface GuestStats {
  today: number;
  pending: number;
  active: number;
  done: number;
  rejected: number;
  total: number;
}

// ==============================================
// EMPLOYEE RANKING (untuk PPID)
// ==============================================
export interface EmployeeRanking {
  employee_id: number;
  employee_name: string;
  employee_nip: string | null;
  employee_department: string;
  total_visits: number;
  rank: number;
}

// ==============================================
// CHART DATA
// ==============================================
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: Date;
}

export interface DailyVisitsChart {
  date: string;
  count: number;
}

export interface MonthlyVisitsChart {
  month: string;
  count: number;
}

// ==============================================
// NOTIFICATION
// ==============================================
export interface Notification {
  id: number;
  instance_id: number;
  guest_id: number;
  title: string;
  message: string;
  type: 'new_guest' | 'guest_validated' | 'guest_rejected' | 'guest_checkout' | 'system';
  is_read: boolean;
  created_at: Date;
}

// ==============================================
// FORM TYPES
// ==============================================
export interface GuestFormData {
  name: string;
  institution?: string;
  purpose: string;
  employee_id: number;
  photo_url?: string;
}

export interface EmployeeFormData {
  nip?: string;
  name: string;
  department: string;
  phone?: string;
  is_active: boolean;
}

export interface InstanceFormData {
  name: string;
  slug: string;
  address: string;
  phone: string;
  logo?: string;
  plan: 'starter' | 'business' | 'enterprise';
  subscription_start: Date;
  subscription_end: Date;
}

export interface UserFormData {
  instance_id?: number;
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'admin' | 'ppid' | 'petugas';
}

// ==============================================
// SETTINGS FORM
// ==============================================
export interface SettingsFormData {
  qr_mode: 'static' | 'dynamic';
  token_interval?: number;
}

// Activity log dengan data user (untuk ditampilkan)
export interface ActivityLogWithUser extends ActivityLog {
  user_name?: string;
  user_email?: string;
  user_role?: string;
  instance_name?: string;
}