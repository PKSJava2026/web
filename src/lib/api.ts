import { ofetch, type FetchOptions } from "ofetch";
import type {
  AmendmentRequest,
  ChangeRequestResponse,
  ContractRequest,
  ContractResponse,
  ContractSearchParams,
  CooperationRequestResponse,
  CooperationRequestStatus,
  CreateCooperationRequest,
  CreateForwarderRequest,
  HealthResponse,
  LoginRequest,
  LoginResponse,
  MarkAllReadResponse,
  MyRatingsResponse,
  NotificationResponse,
  OrderRequest,
  OrderResponse,
  OrderSearchParams,
  OrderStatus,
  RatingRequest,
  RatingResponse,
  RatingSummaryResponse,
  RegisterRequest,
  Role,
  StatItem,
  TableDataResponse,
  UnreadCountResponse,
  UserResponse,
} from "./types";

export * from "./types";

let baseUrl =
  (typeof import.meta !== "undefined" &&
    (import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL)) ||
  "";

let authToken: string | null = null;

export const setAuthToken = (token: string | null): void => {
  authToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) {
    return authToken;
  }
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

export const setBaseUrl = (url: string): void => {
  baseUrl = url.replace(/\/+$/, "");
};

export const getBaseUrl = (): string => baseUrl;

export const client = ofetch.create({
  onRequest({ request, options }) {
    if (
      baseUrl &&
      typeof request === "string" &&
      !/^https?:\/\//i.test(request)
    ) {
      options.baseURL = baseUrl;
    }

    const token = getAuthToken();
    if (token) {
      const headers = new Headers(options.headers);
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      options.headers = headers;
    }
  },
});

const request = <T>(url: string, options?: FetchOptions<any>): Promise<T> => {
  return client(url, options) as Promise<T>;
};

const createContractClient = (kind: "customer" | "carrier") => {
  const base = `/api/${kind}-contracts`;
  return {
    create: (data: ContractRequest) =>
      request<ContractResponse>(base, { method: "POST", body: data }),
    search: (params?: ContractSearchParams) =>
      request<ContractResponse[]>(base, { method: "GET", query: params }),
    my: () => request<ContractResponse[]>(`${base}/my`, { method: "GET" }),
    get: (id: number) =>
      request<ContractResponse>(`${base}/${id}`, { method: "GET" }),
    accept: (id: number) =>
      request<void>(`${base}/${id}/accept`, { method: "POST" }),
    reject: (id: number) =>
      request<void>(`${base}/${id}/reject`, { method: "POST" }),

    // Change requests
    amend: (id: number, data: AmendmentRequest) =>
      request<ChangeRequestResponse>(`${base}/${id}/amendments`, {
        method: "POST",
        body: data,
      }),
    terminate: (id: number) =>
      request<ChangeRequestResponse>(`${base}/${id}/terminations`, {
        method: "POST",
      }),
    openRequests: () =>
      request<ChangeRequestResponse[]>(`${base}/requests`, { method: "GET" }),
    acceptRequest: (requestId: number) =>
      request<void>(`${base}/requests/${requestId}/accept`, { method: "POST" }),
    rejectRequest: (requestId: number) =>
      request<void>(`${base}/requests/${requestId}/reject`, { method: "POST" }),
    cancelRequest: (requestId: number) =>
      request<void>(`${base}/requests/${requestId}/cancel`, { method: "POST" }),
  };
};

const customerContracts = createContractClient("customer");
const carrierContracts = createContractClient("carrier");

export const api = {
  auth: {
    register: (data: RegisterRequest) =>
      request<UserResponse>("/api/auth/register", {
        method: "POST",
        body: data,
      }),
    login: (data: LoginRequest) =>
      request<LoginResponse>("/api/auth/login", { method: "POST", body: data }),
    logout: () => {
      setAuthToken(null);
    },
  },

  users: {
    me: () => request<UserResponse>("/api/users/me", { method: "GET" }),
    byRole: (role: Role) =>
      request<UserResponse[]>("/api/users", { method: "GET", query: { role } }),
  },

  forwarders: {
    list: () => request<UserResponse[]>("/api/forwarders", { method: "GET" }),
    create: (data: CreateForwarderRequest) =>
      request<UserResponse>("/api/forwarders", { method: "POST", body: data }),
    delete: (id: number) =>
      request<void>(`/api/forwarders/${id}`, { method: "DELETE" }),
  },

  orders: {
    create: (data: OrderRequest) =>
      request<OrderResponse>("/api/orders", { method: "POST", body: data }),
    my: () => request<OrderResponse[]>("/api/orders/my", { method: "GET" }),
    get: (id: number) =>
      request<OrderResponse>(`/api/orders/${id}`, { method: "GET" }),
    update: (id: number, data: OrderRequest) =>
      request<OrderResponse>(`/api/orders/${id}`, {
        method: "PUT",
        body: data,
      }),
    cancel: (id: number) =>
      request<void>(`/api/orders/${id}/cancel`, { method: "POST" }),
    delete: (id: number) =>
      request<void>(`/api/orders/${id}`, { method: "DELETE" }),
    search: (params?: OrderSearchParams) =>
      request<OrderResponse[]>("/api/orders", { method: "GET", query: params }),
    changeStatus: (id: number, status: OrderStatus) =>
      request<void>(`/api/orders/${id}/status`, {
        method: "POST",
        body: { status },
      }),
  },

  contracts: {
    customer: customerContracts,
    carrier: carrierContracts,
  },

  customerContracts,
  carrierContracts,

  changeRequests: {
    customer: {
      amend: (id: number, data: AmendmentRequest) =>
        customerContracts.amend(id, data),
      terminate: (id: number) => customerContracts.terminate(id),
      open: () => customerContracts.openRequests(),
      accept: (requestId: number) => customerContracts.acceptRequest(requestId),
      reject: (requestId: number) => customerContracts.rejectRequest(requestId),
      cancel: (requestId: number) => customerContracts.cancelRequest(requestId),
    },
    carrier: {
      amend: (id: number, data: AmendmentRequest) =>
        carrierContracts.amend(id, data),
      terminate: (id: number) => carrierContracts.terminate(id),
      open: () => carrierContracts.openRequests(),
      accept: (requestId: number) => carrierContracts.acceptRequest(requestId),
      reject: (requestId: number) => carrierContracts.rejectRequest(requestId),
      cancel: (requestId: number) => carrierContracts.cancelRequest(requestId),
    },
  },

  cooperation: {
    create: (data: CreateCooperationRequest) =>
      request<CooperationRequestResponse>("/api/cooperation-requests", {
        method: "POST",
        body: data,
      }),
    my: () =>
      request<CooperationRequestResponse[]>("/api/cooperation-requests/my", {
        method: "GET",
      }),
    cancel: (id: number) =>
      request<void>(`/api/cooperation-requests/${id}/cancel`, {
        method: "POST",
      }),
    list: (status?: CooperationRequestStatus) =>
      request<CooperationRequestResponse[]>("/api/cooperation-requests", {
        method: "GET",
        query: status ? { status } : undefined,
      }),
    createContract: (id: number, data: ContractRequest) =>
      request<ContractResponse>(`/api/cooperation-requests/${id}/contract`, {
        method: "POST",
        body: data,
      }),
  },

  notifications: {
    list: () =>
      request<NotificationResponse[]>("/api/notifications", { method: "GET" }),
    unreadCount: () =>
      request<UnreadCountResponse>("/api/notifications/unread-count", {
        method: "GET",
      }),
    markRead: (id: number) =>
      request<void>(`/api/notifications/${id}/read`, { method: "POST" }),
    markAllRead: () =>
      request<MarkAllReadResponse>("/api/notifications/read-all", {
        method: "POST",
      }),
  },

  ratings: {
    rate: (orderId: number, data: RatingRequest) =>
      request<RatingResponse>(`/api/orders/${orderId}/ratings`, {
        method: "POST",
        body: data,
      }),
    unrated: () =>
      request<OrderResponse[]>("/api/orders/unrated", { method: "GET" }),
    my: () => request<MyRatingsResponse>("/api/ratings/my", { method: "GET" }),
    overall: () =>
      request<RatingSummaryResponse>("/api/ratings/overall", { method: "GET" }),
  },

  reports: {
    stats: () => request<StatItem[]>("/api/stats", { method: "GET" }),
    tables: () => request<string[]>("/api/tables", { method: "GET" }),
    table: (name: string) =>
      request<TableDataResponse>(`/api/tables/${name}`, { method: "GET" }),
  },

  export: {
    xlsx: () =>
      request<Blob>("/api/export/xlsx", {
        method: "GET",
        responseType: "blob",
      }),
    csv: () =>
      request<Blob>("/api/export/csv", {
        method: "GET",
        responseType: "blob",
      }),
  },

  health: {
    check: () => request<HealthResponse>("/api/health", { method: "GET" }),
  },
};

export default api;
