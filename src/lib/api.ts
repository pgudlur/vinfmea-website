/**
 * API client for vinFMEA SaaS backend.
 * Handles JWT token injection, error handling, and typed responses.
 */

import type {
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserInfo,
  LicenseStatus,
  Project,
  ProjectCreate,
  ProjectUpdate,
  Assembly,
  AssemblyCreate,
  AssemblyUpdate,
  Part,
  PartCreate,
  PartUpdate,
  SfmeaEntry,
  SfmeaCreate,
  SfmeaUpdate,
  DfmeaEntry,
  DfmeaCreate,
  DfmeaUpdate,
  PfmeaEntry,
  PfmeaCreate,
  PfmeaUpdate,
  ControlPlanEntry,
  ControlPlanCreate,
  ControlPlanUpdate,
  DashboardSummary,
  RiskMatrixData,
  TopRisk,
  ProjectStats,
  FailureCause,
  SyncSummary,
  TraceabilityChain,
  AuditEntry,
  AdminDashboardSummary,
  SaasLicense,
  SaasLicenseCreate,
  SaasLicenseUpdate,
  UserWithSession,
  AdminUserCreate,
  AdminUserUpdate,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  PaginatedResponse,
  DrbfmEntry,
  DrbfmCreate,
  DrbfmUpdate,
  DvprEntry,
  DvprCreate,
  DvprUpdate,
  FmeaMsrEntry,
  FmeaMsrCreate,
  FmeaMsrUpdate,
  NotificationEntry,
  NotificationSummary,
  ApprovalWorkflow,
  ApprovalStep,
} from "./types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://vinfmea-api-production.up.railway.app";
const TOKEN_KEY = "vinfmea_token";

// ── Error class ─────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Core request function ───────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    let message = "Request failed";
    if (typeof body.detail === "string") {
      message = body.detail;
    } else if (Array.isArray(body.detail)) {
      message = body.detail
        .map((e: { msg?: string }) => e.msg || JSON.stringify(e))
        .join("; ");
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────

export const auth = {
  login: (username: string, password: string) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    request<{ message: string }>("/api/auth/logout", { method: "POST" }),

  me: () => request<UserInfo>("/api/auth/me"),

  changePassword: (old_password: string, new_password: string) =>
    request<{ message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ old_password, new_password }),
    }),

  register: (data: RegisterRequest) =>
    request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  users: () => request<UserInfo[]>("/api/auth/users"),
};

// ── License ─────────────────────────────────────────────────

export const license = {
  heartbeat: () =>
    request<{ message: string }>("/api/licenses/heartbeat", {
      method: "POST",
    }),

  status: () => request<LicenseStatus>("/api/licenses/status"),
};

// ── Projects ────────────────────────────────────────────────

export const projects = {
  list: () => request<Project[]>("/api/projects"),

  get: (id: number) => request<Project>(`/api/projects/${id}`),

  create: (data: ProjectCreate) =>
    request<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ProjectUpdate) =>
    request<Project>(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ detail: string }>(`/api/projects/${id}`, { method: "DELETE" }),
};

// ── Assemblies ──────────────────────────────────────────────

export const assemblies = {
  list: (params?: { project_id?: number; parent_id?: number }) => {
    const sp = new URLSearchParams();
    if (params?.project_id) sp.set("project_id", String(params.project_id));
    if (params?.parent_id) sp.set("parent_id", String(params.parent_id));
    const qs = sp.toString();
    return request<Assembly[]>(`/api/assemblies${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => request<Assembly>(`/api/assemblies/${id}`),

  create: (data: AssemblyCreate) =>
    request<Assembly>("/api/assemblies", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: AssemblyUpdate) =>
    request<Assembly>(`/api/assemblies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ detail: string }>(`/api/assemblies/${id}`, { method: "DELETE" }),
};

// ── Parts ───────────────────────────────────────────────────

export const parts = {
  list: (params?: { assembly_id?: number; project_id?: number }) => {
    const sp = new URLSearchParams();
    if (params?.assembly_id) sp.set("assembly_id", String(params.assembly_id));
    if (params?.project_id) sp.set("project_id", String(params.project_id));
    const qs = sp.toString();
    return request<Part[]>(`/api/parts${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => request<Part>(`/api/parts/${id}`),

  create: (data: PartCreate) =>
    request<Part>("/api/parts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: PartUpdate) =>
    request<Part>(`/api/parts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ detail: string }>(`/api/parts/${id}`, { method: "DELETE" }),
};

// ── SFMEA ───────────────────────────────────────────────────

export const sfmea = {
  list: (params?: { part_id?: number; project_id?: number }) => {
    const sp = new URLSearchParams();
    if (params?.part_id) sp.set("part_id", String(params.part_id));
    if (params?.project_id) sp.set("project_id", String(params.project_id));
    const qs = sp.toString();
    return request<SfmeaEntry[]>(`/api/sfmea${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => request<SfmeaEntry>(`/api/sfmea/${id}`),

  create: (data: SfmeaCreate) =>
    request<SfmeaEntry>("/api/sfmea", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: SfmeaUpdate) =>
    request<SfmeaEntry>(`/api/sfmea/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/api/sfmea/${id}`, { method: "DELETE" }),
};

// ── DFMEA ───────────────────────────────────────────────────

export const dfmea = {
  list: (params?: { part_id?: number; project_id?: number }) => {
    const sp = new URLSearchParams();
    if (params?.part_id) sp.set("part_id", String(params.part_id));
    if (params?.project_id) sp.set("project_id", String(params.project_id));
    const qs = sp.toString();
    return request<DfmeaEntry[]>(`/api/dfmea${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => request<DfmeaEntry>(`/api/dfmea/${id}`),

  create: (data: DfmeaCreate) =>
    request<DfmeaEntry>("/api/dfmea", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: DfmeaUpdate) =>
    request<DfmeaEntry>(`/api/dfmea/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/api/dfmea/${id}`, { method: "DELETE" }),
};

// ── PFMEA ───────────────────────────────────────────────────

export const pfmea = {
  list: (params?: { part_id?: number; project_id?: number }) => {
    const sp = new URLSearchParams();
    if (params?.part_id) sp.set("part_id", String(params.part_id));
    if (params?.project_id) sp.set("project_id", String(params.project_id));
    const qs = sp.toString();
    return request<PfmeaEntry[]>(`/api/pfmea${qs ? `?${qs}` : ""}`);
  },

  get: (id: number) => request<PfmeaEntry>(`/api/pfmea/${id}`),

  create: (data: PfmeaCreate) =>
    request<PfmeaEntry>("/api/pfmea", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: PfmeaUpdate) =>
    request<PfmeaEntry>(`/api/pfmea/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/api/pfmea/${id}`, { method: "DELETE" }),
};

// ── Control Plans ───────────────────────────────────────────

export const controlPlans = {
  list: (params?: { part_id?: number; project_id?: number }) => {
    const sp = new URLSearchParams();
    if (params?.part_id) sp.set("part_id", String(params.part_id));
    if (params?.project_id) sp.set("project_id", String(params.project_id));
    const qs = sp.toString();
    return request<ControlPlanEntry[]>(
      `/api/control-plans${qs ? `?${qs}` : ""}`
    );
  },

  get: (id: number) => request<ControlPlanEntry>(`/api/control-plans/${id}`),

  create: (data: ControlPlanCreate) =>
    request<ControlPlanEntry>("/api/control-plans", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: ControlPlanUpdate) =>
    request<ControlPlanEntry>(`/api/control-plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/api/control-plans/${id}`, {
      method: "DELETE",
    }),
};

// ── Analytics ───────────────────────────────────────────────

export const analytics = {
  dashboardSummary: (projectId?: number) => {
    const qs = projectId ? `?project_id=${projectId}` : "";
    return request<DashboardSummary>(`/api/analytics/dashboard-summary${qs}`);
  },

  riskMatrix: (params?: {
    project_id?: number;
    fmea_type?: string;
    use_revised?: boolean;
  }) => {
    const sp = new URLSearchParams();
    if (params?.project_id)
      sp.set("project_id", String(params.project_id));
    if (params?.fmea_type) sp.set("fmea_type", params.fmea_type);
    if (params?.use_revised) sp.set("use_revised", "true");
    const qs = sp.toString();
    return request<RiskMatrixData>(`/api/analytics/risk-matrix${qs ? `?${qs}` : ""}`);
  },

  failureCauses: (params?: {
    limit?: number;
    project_id?: number;
    fmea_type?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.project_id)
      sp.set("project_id", String(params.project_id));
    if (params?.fmea_type) sp.set("fmea_type", params.fmea_type);
    const qs = sp.toString();
    return request<FailureCause[]>(
      `/api/analytics/failure-causes${qs ? `?${qs}` : ""}`
    );
  },

  entriesBySO: (params: {
    severity: number;
    occurrence: number;
    project_id?: number;
    fmea_type?: string;
    use_revised?: boolean;
  }) => {
    const sp = new URLSearchParams();
    sp.set("severity", String(params.severity));
    sp.set("occurrence", String(params.occurrence));
    if (params.project_id)
      sp.set("project_id", String(params.project_id));
    if (params.fmea_type) sp.set("fmea_type", params.fmea_type);
    if (params.use_revised) sp.set("use_revised", "true");
    return request<(DfmeaEntry | PfmeaEntry)[]>(
      `/api/analytics/entries-by-so?${sp.toString()}`
    );
  },
};

// ── Stats / Sync ────────────────────────────────────────────

export const sync = {
  stats: (projectId?: number) => {
    const qs = projectId ? `?project_id=${projectId}` : "";
    return request<ProjectStats>(`/api/stats${qs}`);
  },

  topRisks: (params?: { limit?: number; fmea_type?: string }) => {
    const sp = new URLSearchParams();
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.fmea_type) sp.set("fmea_type", params.fmea_type);
    const qs = sp.toString();
    return request<TopRisk[]>(`/api/top-risks${qs ? `?${qs}` : ""}`);
  },

  summary: (projectId?: number) => {
    const qs = projectId ? `?project_id=${projectId}` : "";
    return request<SyncSummary>(`/api/sync-summary${qs}`);
  },

  traceability: (entryType: string, entryId: number) =>
    request<TraceabilityChain>(
      `/api/traceability/${entryType}/${entryId}`
    ),

  createPfmeaFromDfmea: (data: {
    dfmea_id: number;
    part_id?: number;
  }) =>
    request<{ pfmea_id: number; step_id: string }>(
      "/api/create-pfmea-from-dfmea",
      { method: "POST", body: JSON.stringify(data) }
    ),

  rebuildLinks: (projectId?: number) => {
    const qs = projectId ? `?project_id=${projectId}` : "";
    return request<{ links_created: number }>(`/api/rebuild-links${qs}`, {
      method: "POST",
    });
  },

  projectItemCounts: (projectId: number) =>
    request<{
      assemblies: number;
      parts: number;
      dfmea: number;
      pfmea: number;
      control_plan: number;
    }>(`/api/project-item-counts/${projectId}`),
};

// ── Locks ───────────────────────────────────────────────────

export const locks = {
  acquire: (tableName: string, recordId: number) =>
    request<{ message: string; lock_id: number; expires_at: string }>(
      `/api/locks/${tableName}/${recordId}`,
      { method: "POST" }
    ),

  release: (tableName: string, recordId: number) =>
    request<{ message: string }>(
      `/api/locks/${tableName}/${recordId}`,
      { method: "DELETE" }
    ),

  list: (tableName?: string) => {
    const qs = tableName ? `?table_name=${tableName}` : "";
    return request<
      {
        id: number;
        table_name: string;
        record_id: number;
        user_id: number;
        username: string;
        locked_at: string;
        expires_at: string;
      }[]
    >(`/api/locks${qs}`);
  },
};

// ── Audit ───────────────────────────────────────────────────

export const audit = {
  list: (params?: {
    table_name?: string;
    record_id?: number;
    user_id?: number;
    limit?: number;
    offset?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params?.table_name) sp.set("table_name", params.table_name);
    if (params?.record_id) sp.set("record_id", String(params.record_id));
    if (params?.user_id) sp.set("user_id", String(params.user_id));
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.offset) sp.set("offset", String(params.offset));
    const qs = sp.toString();
    return request<AuditEntry[]>(`/api/audit${qs ? `?${qs}` : ""}`);
  },

  verify: () =>
    request<{
      valid: boolean;
      total_entries: number;
      broken_at: number | null;
      message: string;
    }>("/api/audit/verify"),
};

// ── Admin Licenses ─────────────────────────────────────────

export const adminLicenses = {
  summary: () =>
    request<AdminDashboardSummary>("/api/admin/dashboard-summary"),

  list: (params?: {
    search?: string;
    plan?: string;
    status?: string;
    offset?: number;
    limit?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set("search", params.search);
    if (params?.plan) sp.set("plan", params.plan);
    if (params?.status) sp.set("status", params.status);
    if (params?.offset != null) sp.set("offset", String(params.offset));
    if (params?.limit != null) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return request<PaginatedResponse<SaasLicense>>(
      `/api/admin/licenses${qs ? `?${qs}` : ""}`
    );
  },

  create: (data: SaasLicenseCreate) =>
    request<SaasLicense>("/api/admin/licenses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: SaasLicenseUpdate) =>
    request<SaasLicense>(`/api/admin/licenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  disable: (id: number) =>
    request<SaasLicense>(`/api/admin/licenses/${id}/disable`, {
      method: "POST",
    }),

  enable: (id: number) =>
    request<SaasLicense>(`/api/admin/licenses/${id}/enable`, {
      method: "POST",
    }),
};

// ── Admin Users ────────────────────────────────────────────

export const adminUsers = {
  list: (params?: {
    search?: string;
    role?: string;
    status?: string;
    offset?: number;
    limit?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params?.search) sp.set("search", params.search);
    if (params?.role) sp.set("role", params.role);
    if (params?.status) sp.set("status", params.status);
    if (params?.offset != null) sp.set("offset", String(params.offset));
    if (params?.limit != null) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return request<PaginatedResponse<UserWithSession>>(
      `/api/admin/users${qs ? `?${qs}` : ""}`
    );
  },

  create: (data: AdminUserCreate) =>
    request<UserInfo>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: AdminUserUpdate) =>
    request<UserInfo>(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  disable: (id: number) =>
    request<UserInfo>(`/api/admin/users/${id}/disable`, { method: "POST" }),

  enable: (id: number) =>
    request<UserInfo>(`/api/admin/users/${id}/enable`, { method: "POST" }),

  resetPassword: (id: number, new_password: string) =>
    request<UserInfo>(`/api/admin/users/${id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ new_password }),
    }),
};

// ── Stripe ─────────────────────────────────────────────────

export const stripeApi = {
  createCheckoutSession: (data: CheckoutSessionRequest) =>
    request<CheckoutSessionResponse>("/api/stripe/create-checkout-session", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createPortalSession: () =>
    request<{ portal_url: string }>("/api/stripe/create-portal-session", {
      method: "POST",
    }),

  subscriptionStatus: () =>
    request<{
      has_subscription: boolean;
      subscription: unknown;
      license: SaasLicense | null;
    }>("/api/stripe/subscription-status"),
};

// ── Tools: DRBFM ──────────────────────────────────────────

export const toolsDrbfm = {
  list: (params?: { part_id?: number; project_id?: number }) => {
    const sp = new URLSearchParams();
    if (params?.part_id) sp.set("part_id", String(params.part_id));
    if (params?.project_id) sp.set("project_id", String(params.project_id));
    const qs = sp.toString();
    return request<DrbfmEntry[]>(`/api/tools/drbfm${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => request<DrbfmEntry>(`/api/tools/drbfm/${id}`),
  create: (data: DrbfmCreate) =>
    request<DrbfmEntry>("/api/tools/drbfm", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: DrbfmUpdate) =>
    request<DrbfmEntry>(`/api/tools/drbfm/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/tools/drbfm/${id}`, { method: "DELETE" }),
};

// ── Tools: DVP&R ──────────────────────────────────────────

export const toolsDvpr = {
  list: (params?: { part_id?: number; project_id?: number }) => {
    const sp = new URLSearchParams();
    if (params?.part_id) sp.set("part_id", String(params.part_id));
    if (params?.project_id) sp.set("project_id", String(params.project_id));
    const qs = sp.toString();
    return request<DvprEntry[]>(`/api/tools/dvpr${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => request<DvprEntry>(`/api/tools/dvpr/${id}`),
  create: (data: DvprCreate) =>
    request<DvprEntry>("/api/tools/dvpr", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: DvprUpdate) =>
    request<DvprEntry>(`/api/tools/dvpr/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/tools/dvpr/${id}`, { method: "DELETE" }),
};

// ── Tools: FMEA-MSR ───────────────────────────────────────

export const toolsFmeaMsr = {
  list: (params?: { part_id?: number; project_id?: number }) => {
    const sp = new URLSearchParams();
    if (params?.part_id) sp.set("part_id", String(params.part_id));
    if (params?.project_id) sp.set("project_id", String(params.project_id));
    const qs = sp.toString();
    return request<FmeaMsrEntry[]>(`/api/tools/fmea-msr${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => request<FmeaMsrEntry>(`/api/tools/fmea-msr/${id}`),
  create: (data: FmeaMsrCreate) =>
    request<FmeaMsrEntry>("/api/tools/fmea-msr", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: FmeaMsrUpdate) =>
    request<FmeaMsrEntry>(`/api/tools/fmea-msr/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/tools/fmea-msr/${id}`, { method: "DELETE" }),
};

// ── Notifications ─────────────────────────────────────────

export const notifications = {
  list: (params?: { unread_only?: boolean; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.unread_only) sp.set("unread_only", "true");
    if (params?.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    return request<NotificationEntry[]>(`/api/notifications${qs ? `?${qs}` : ""}`);
  },
  summary: () => request<NotificationSummary>("/api/notifications/summary"),
  markRead: (id: number) =>
    request<{ message: string }>(`/api/notifications/${id}/read`, { method: "POST" }),
  markAllRead: () =>
    request<{ message: string }>("/api/notifications/read-all", { method: "POST" }),
  dismiss: (id: number) =>
    request<{ message: string }>(`/api/notifications/${id}/dismiss`, { method: "POST" }),
  generateOverdue: () =>
    request<{ message: string }>("/api/notifications/generate-overdue", { method: "POST" }),
  generateHighRisk: (threshold?: number) => {
    const qs = threshold ? `?rpn_threshold=${threshold}` : "";
    return request<{ message: string }>(`/api/notifications/generate-high-risk${qs}`, { method: "POST" });
  },
};

// ── Approvals ─────────────────────────────────────────────

export const approvals = {
  list: (params?: { project_id?: number; status?: string }) => {
    const sp = new URLSearchParams();
    if (params?.project_id) sp.set("project_id", String(params.project_id));
    if (params?.status) sp.set("status", params.status);
    const qs = sp.toString();
    return request<ApprovalWorkflow[]>(`/api/approvals${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => request<ApprovalWorkflow>(`/api/approvals/${id}`),
  create: (data: { project_id: number; fmea_type: string; title: string; description?: string; steps: { role_required: string; assigned_user_id?: number; assigned_user_name?: string }[] }) =>
    request<ApprovalWorkflow>("/api/approvals", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submit: (id: number) =>
    request<{ message: string; status: string }>(`/api/approvals/${id}/submit`, { method: "POST" }),
  decide: (workflowId: number, stepId: number, data: { decision: string; comments?: string }) =>
    request<ApprovalStep>(`/api/approvals/${workflowId}/steps/${stepId}/decide`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  reopen: (id: number) =>
    request<{ message: string }>(`/api/approvals/${id}/reopen`, { method: "POST" }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/approvals/${id}`, { method: "DELETE" }),
  stats: (projectId?: number) => {
    const qs = projectId ? `?project_id=${projectId}` : "";
    return request<{ total: number; pending: number; approved: number; rejected: number; my_pending_decisions: number }>(`/api/approvals/stats/summary${qs}`);
  },
};
