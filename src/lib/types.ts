// Enums / Domain types
export type Role = "CUSTOMER" | "FORWARDER" | "CARRIER" | "ADMIN";

export type OrderStatus =
  | "NEW"
  | "CONTRACTED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export type OrderSort = "DATE" | "STATUS" | "WEIGHT";

export type ContractKind = "CUSTOMER" | "CARRIER";

export type ContractStatus =
  | "PENDING"
  | "ACTIVE"
  | "TERMINATED"
  | "COMPLETED"
  | "REJECTED";

export type ChangeRequestType = "AMEND" | "TERMINATE";

export type ChangeRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export type CooperationRequestStatus = "NEW" | "PROCESSED" | "CANCELLED";

// Auth & Users
export interface UserResponse {
  id: number;
  nickname: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface RegisterRequest {
  nickname: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginRequest {
  nickname: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface CreateForwarderRequest {
  nickname: string;
  email: string;
  password: string;
}

// Orders
export interface OrderRequest {
  cargoDescription: string;
  weightKg: number;
  volumeM3: number;
  origin: string;
  destination: string;
  desiredDate?: string | null;
}

export interface OrderResponse {
  id: number;
  customerId: number;
  customerNickname: string;
  cargoDescription: string;
  weightKg: number;
  volumeM3: number;
  origin: string;
  destination: string;
  desiredDate?: string | null;
  status: OrderStatus;
  createdAt: string;
}

export interface StatusRequest {
  status: OrderStatus;
}

export interface OrderSearchParams {
  q?: string;
  status?: OrderStatus;
  from?: string;
  to?: string;
  customerId?: number;
  active?: boolean;
  sort?: OrderSort;
  desc?: boolean;
}

// Contracts
export interface ContractRequest {
  orderId: number;
  counterpartyId: number;
  price: number;
  terms?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ContractResponse {
  id: number;
  kind: ContractKind;
  orderId: number;
  orderStatus: OrderStatus;
  counterpartyId: number;
  counterpartyNickname: string;
  forwarderId: number;
  forwarderNickname: string;
  price: number;
  terms?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: ContractStatus;
  createdAt: string;
}

export interface ContractSearchParams {
  status?: ContractStatus;
  from?: string;
  to?: string;
  date?: string;
  orderId?: number;
  sort?: string;
  desc?: boolean;
}

// Change Requests
export interface AmendmentRequest {
  price?: number | null;
  terms?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ChangeRequestResponse {
  id: number;
  kind: ContractKind;
  contractId: number;
  type: ChangeRequestType;
  initiatedBy: number;
  initiatorNickname: string;
  proposedPrice?: number | null;
  proposedTerms?: string | null;
  proposedStartDate?: string | null;
  proposedEndDate?: string | null;
  status: ChangeRequestStatus;
  createdAt: string;
  resolvedAt?: string | null;
}

// Cooperation Requests
export interface CreateCooperationRequest {
  description: string;
  vehicleInfo: string;
}

export interface CooperationRequestResponse {
  id: number;
  carrierId: number;
  carrierNickname: string;
  description: string;
  vehicleInfo: string;
  status: CooperationRequestStatus;
  createdAt: string;
}

// Notifications
export interface NotificationResponse {
  id: number;
  message: string;
  changeRequestId?: number | null;
  read: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkAllReadResponse {
  updated: number;
}

// Ratings
export interface RatingRequest {
  score: number;
  comment?: string | null;
}

export interface RatingResponse {
  id: number;
  orderId: number;
  fromUserId: number;
  fromNickname: string;
  toUserId: number;
  score: number;
  comment?: string | null;
  createdAt: string;
}

export interface RatingSummaryResponse {
  count: number;
  average: number;
}

export interface MyRatingsResponse {
  summary: RatingSummaryResponse;
  ratings: RatingResponse[];
}

// Reports & Statistics
export interface StatItem {
  name: string;
  value: unknown;
}

export interface TableDataResponse {
  name: string;
  columns: string[];
  rows: unknown[][];
}

// Health
export interface HealthResponse {
  status: string;
}

