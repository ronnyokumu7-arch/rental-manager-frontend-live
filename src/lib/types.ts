// src/lib/types.ts

// ─── Users & Auth ───────────────────────────────────────────────────────────
export type UserRole = "super_admin" | "tenant_admin" | "tenant_staff";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  tenant_id?: number | null;
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason?: string | null;
  phone_number?: string | null;
  department?: string | null;
  job_title?: string | null;
  permissions?: string[];
  two_factor_enabled?: boolean;
  last_login_at?: string | null;
  id_number?: string | null;
  dl_number?: string | null;
  dl_expiry?: string | null;
  
  // ✅ ADDED: Invite & Onboarding Lifecycle Fields
  invite_token?: string | null;
  invite_expires_at?: string | null;
  is_onboarded?: boolean;

  // ✅ NEW: Recovery & Security Audit Fields (Synced with backend UserOut)
  phone_verified?: boolean;
  failed_login_attempts?: number;
  account_locked_until?: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}

// ── Clients ─────────────────────────────────────────────────────────────────
export type ClientStatus = "pending" | "active" | "inactive" | "suspended";

export interface Client {
  id: number;
  tenant_id: number;
  full_name: string;
  email: string | null;
  phone: string;
  id_number: string | null;
  dl_number: string | null;
  dl_expiry: string | null;
  status: ClientStatus;
  residential_address: string | null;
  work_address: string | null;
  id_image_front: string | null;
  id_image_back: string | null;
  dl_image_front: string | null;
  avatar_image: string | null;
  next_of_kin_name: string | null;
  next_of_kin_phone: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ClientCreate = Omit<
  Client,
  | "id"
  | "tenant_id"
  | "created_at"
  | "updated_at"
  | "is_archived"
  | "archived_at"
  | "avatar_image"
  | "id_image_front"
  | "id_image_back"
  | "dl_image_front"
>;

export type ClientUpdate = Partial<
  Omit<Client, "id" | "tenant_id" | "created_at" | "updated_at">
>;

// ─── Vehicles ────────────────────────────────────────────────────────────────
export type VehicleStatus =
  | "pending_activation"
  | "available"
  | "rented"
  | "maintenance"
  | "retired";

export interface Vehicle {
  id: number;
  tenant_id: number;
  make: string;
  model: string;
  year: number;
  plate_number: string;
  vin: string | null;
  status: VehicleStatus;
  daily_rate: number;
  current_mileage: number;
  next_service_km: number | null;
  insurance_number: string | null;
  insurance_expiry: string | null;
  insurance_doc: string | null;
  registration_doc: string | null;
  inspection_doc: string | null;
  notes: string | null;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreate {
  make: string;
  model: string;
  year: number;
  plate_number: string;
  vin?: string | null;
  daily_rate: number;
  current_mileage?: number;
  next_service_km?: number | null;
  insurance_number?: string | null;
  insurance_expiry?: string | null;
  notes?: string | null;
}

export interface VehicleUpdate {
  make?: string;
  model?: string;
  year?: number;
  plate_number?: string;
  vin?: string | null;
  daily_rate?: number;
  status?: VehicleStatus;
  current_mileage?: number;
  next_service_km?: number | null;
  insurance_number?: string | null;
  insurance_expiry?: string | null;
  insurance_doc?: string | null;
  registration_doc?: string | null;
  inspection_doc?: string | null;
  notes?: string | null;
}

// ─── Bookings ────────────────────────────────────────────────────────────────
export type BookingStatus = 
  | "pending" 
  | "confirmed" 
  | "active" 
  | "awaiting_mileage"
  | "completed" 
  | "cancelled" 
  | "no_show";

export interface Booking {
  id: number;
  booking_number: string;
  tenant_id: number;
  client_id: number;
  vehicle_id: number;
  destination?: string | null;
  pickup_location?: string | null;
  return_location?: string | null;
  start_date: string;
  end_date: string;
  total_amount: number;
  currency_code: string;
  status: BookingStatus;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingCreate {
  client_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  destination?: string;
  pickup_location?: string;
  return_location?: string;
  total_amount: number;
  currency_code?: string;
}

export interface BookingUpdate {
  destination?: string;
  start_date?: string;
  end_date?: string;
  pickup_location?: string;
  return_location?: string;
  total_amount?: number;
  currency_code?: string;
  status?: BookingStatus;
}

// ─── Contracts ───────────────────────────────────────────────────────────────
export type ContractStatus = "draft" | "sent" | "signed" | "void";

export interface Contract {
  id: number;
  booking_id: number;
  tenant_id: number;
  contract_number: string;
  status: ContractStatus;
  pdf_path: string | null;
  signed_at: string | null;
  share_token: string | null;
  share_token_expires_at: string | null;
  signed_by_client: boolean;
  client_signed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Invoices ────────────────────────────────────────────────────────────────
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export interface Invoice {
  id: number;
  tenant_id: number;
  subscription_id: number | null;
  booking_id: number | null;
  invoice_number: string;
  status: InvoiceStatus;
  amount_due: number;
  amount_paid: number;
  currency_code: string;
  due_date: string;
  paid_at: string | null;
  pdf_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceCreate {
  booking_id?: number;
  subscription_id?: number;
  amount_due: number;
  currency_code?: string;
  due_date: string;
  notes?: string;
}

export interface InvoiceUpdate {
  amount_due?: number;
  currency_code?: string;
  due_date?: string;
  notes?: string;
  status?: InvoiceStatus;
}

// ─── Payments ────────────────────────────────────────────────────────────────
// ✅ UPDATED: Synced with backend unified PaymentMethod enum
export type PaymentMethod = "mpesa" | "airtel_money" | "card" | "paypal" | "bank" | "manual";
export type PaymentStatus = "pending" | "completed" | "failed";

export interface Payment {
  id: number;
  invoice_id: number;
  tenant_id: number;
  amount: number;
  currency_code: string;
  method: PaymentMethod;
  reference: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  recorded_by: number | null;
  notes: string | null;
  created_at: string;
}

export interface PaymentCreate {
  invoice_id: number;
  amount: number;
  currency_code?: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

// ─── Dashboard List Enrichments ──────────────────────────────────────────────
export interface BookingListItem extends Booking {
  client_name: string;
  vehicle_details: string;
}

export interface InvoiceListItem extends Invoice {
  client_name: string;
  booking_ref: string | null;
}

export interface ContractListItem extends Contract {
  client_name: string;
  booking_ref: string | null;
}

// ─── Roles & Permissions ─────────────────────────────────────────────────────
export interface Permission {
  key: string;
  label: string;
}

export interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

export interface RoleTemplate {
  id: number;
  tenant_id: number;
  job_title: string;
  permissions: string[];
}

// ─── Tasks & Action Center ──────────────────────────────────────────────────
export type TaskStatus = "unassigned" | "pending" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskCategory = "fleet" | "finance" | "hr" | "booking" | "compliance";

export interface Task {
  id: number;
  tenant_id: number;
  user_id: number | null;
  title: string;
  description: string | null;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  is_system_generated: boolean;
  is_archived: boolean;
  requires_role: string | null;
  target_type: string | null;
  target_id: number | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskUpdate {
  status?: TaskStatus;
  completed_at?: string;
}

// ─── Tenants & Subscriptions ─────────────────────────────────────────────────
export type SubscriptionStatus =
  | "trial"
  | "starter_trial"
  | "active"
  | "past_due"
  | "suspended"
  | "cancelled";

// ✅ UPDATED: Added airtel_money to match backend PaymentMethodType enum
export type PaymentMethodType = "mpesa" | "airtel_money" | "card" | "paypal" | "bank";

export interface TenantProfile {
  id: number;
  tenant_id: number;
  company_name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  tax_number?: string | null; // KRA PIN
  logo_url?: string | null;
  contract_prefix: string;
  contract_footer?: string | null;
}

export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone_number?: string | null;
  
  // Denormalized Admin Snapshot
  admin_name?: string | null;
  admin_email?: string | null;
  admin_phone?: string | null;
  
  // Lifecycle & Multi-Tenancy
  is_active: boolean;
  is_archived: boolean;
  suspended_at?: string | null;
  suspension_reason?: string | null;
  
  // ✅ NEW: Recovery & Audit Trail (Synced with backend Tenant model)
  last_reset_request_at?: string | null;
  email_change_cooldown_until?: string | null;
  admin_email_changed_at?: string | null;
  admin_changed_by_user_id?: number | null;
  
  // Subscription & Billing
  plan: string;
  subscription_status: SubscriptionStatus;
  trial_ends_at?: string | null;
  subscription_ends_at?: string | null;
  grace_period_ends_at?: string | null;
  
  // Payment Gateway Readiness
  default_payment_method?: PaymentMethodType | null;
  stripe_customer_id?: string | null;
  paypal_payer_id?: string | null;
  payment_metadata?: Record<string, any> | null;
  
  // Nested Profile Data
  profile?: TenantProfile | null;
  
  created_at: string;
  updated_at: string;
}

export interface CreateTenantPayload {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  plan?: string;
  admin_name?: string;
  admin_email?: string;
  admin_phone?: string;
  business_location?: string;
  kra_pin?: string;
  currency?: string;
  time_zone?: string;
  is_corporate?: boolean;
  billing_cycle?: string;
}

export interface UpdateTenantPayload {
  name?: string;
  email?: string;
  phone_number?: string;
  admin_name?: string;
  admin_email?: string;
  admin_phone?: string;
  is_active?: boolean;
  is_archived?: boolean;
  plan?: string;
  subscription_status?: SubscriptionStatus;
  default_payment_method?: PaymentMethodType;
  stripe_customer_id?: string;
  paypal_payer_id?: string;
  payment_metadata?: Record<string, any>;
}


// src/lib/types.ts

// ... existing types ...

// ---------------------------------------------------------------------------
// Agency Health Dashboard Types (Privacy-First Aggregates)
// ---------------------------------------------------------------------------

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface HealthScore {
  score: number; // 0 to 100
  riskLevel: RiskLevel;
  trend: TrendDirection;
  lastCalculatedAt: string; // ISO date
}

export interface ActivityPulse {
  loginsLast7Days: number;
  loginsLast30Days: number;
  activeDaysThisMonth: number;
  lastActiveAt: string | null; // ISO date
  avgSessionDurationMinutes: number;
}

export interface FleetUtilization {
  totalVehicles: number;
  activeVehicles: number; // Vehicles with at least one booking in current month
  utilizationPercentage: number; // 0 to 100
  idleVehiclesCount: number;
}

export interface RevenueVelocity {
  bookingsThisWeek: number;
  bookingsLastWeek: number;
  bookingsThisMonth: number;
  trend: TrendDirection;
  weeklyData: number[]; // Last 8 weeks of booking counts for sparkline
}

export interface PaymentReliability {
  currentStreak: number; // Consecutive on-time payments
  onTimePaymentRate: number; // 0 to 100
  totalInvoicesPaid: number;
  overdueInvoicesCount: number;
}

export interface FeatureAdoption {
  modulesUsed: string[]; // e.g., ['bookings', 'contracts', 'invoices']
  totalAvailableModules: number;
  adoptionPercentage: number; // 0 to 100
  mostUsedModule: string;
  leastUsedModule: string | null;
}

export interface SupportTicketTrend {
  openTickets: number;
  closedThisMonth: number;
  avgResolutionTimeHours: number;
  trend: TrendDirection;
}

// The master object returned by the useAgencyHealth hook
export interface AgencyHealthData {
  score: HealthScore;
  activity: ActivityPulse;
  utilization: FleetUtilization;
  revenueVelocity: RevenueVelocity;
  paymentReliability: PaymentReliability;
  featureAdoption: FeatureAdoption;
  supportTickets: SupportTicketTrend;
}


export interface SupportTicketTrend {
  openTickets: number;
  closedThisMonth: number;
  avgResolutionTimeHours: number;
  trend: TrendDirection; // 'up' | 'down' | 'stable'
}

// Ensure AgencyHealthData includes it (it should already be there from our earlier draft)
export interface AgencyHealthData {
  score: HealthScore;
  activity: ActivityPulse;
  utilization: FleetUtilization;
  revenueVelocity: RevenueVelocity;
  paymentReliability: PaymentReliability;
  featureAdoption: FeatureAdoption;
  supportTickets: SupportTicketTrend; // ✅ Now properly typed
}
