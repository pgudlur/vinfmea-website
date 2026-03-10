/**
 * TypeScript interfaces matching the vinFMEA FastAPI server Pydantic schemas.
 */

// ── Auth ────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
  machine_id?: string;
}

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  display_name: string;
  role: string;
  seat_id: number;
}

export interface UserInfo {
  id: number;
  username: string;
  display_name: string;
  email?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

// ── License ─────────────────────────────────────────────────

export interface LicenseStatus {
  max_seats: number;
  active_seats: number;
  available_seats: number;
  expires_at: string | null;
  seats: LicenseSeat[];
}

export interface LicenseSeat {
  seat_id: number;
  user_id: number;
  username: string;
  display_name: string;
  checked_out_at: string;
  last_heartbeat: string;
  machine_id: string | null;
}

// ── Project Hierarchy ───────────────────────────────────────

export interface Project {
  id: number;
  name: string;
  description: string;
  customer: string;
  project_number: string;
  model_year: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  customer?: string;
  project_number?: string;
  model_year?: string;
  status?: string;
}

export interface ProjectUpdate extends Partial<ProjectCreate> {
  version?: number;
}

export interface Assembly {
  id: number;
  project_id: number;
  parent_id: number | null;
  name: string;
  assembly_number: string;
  description: string;
  level: number;
  version: number;
  created_at: string;
}

export interface AssemblyCreate {
  project_id: number;
  parent_id?: number | null;
  name: string;
  assembly_number?: string;
  description?: string;
  level?: number;
}

export interface AssemblyUpdate {
  name?: string;
  assembly_number?: string;
  description?: string;
  level?: number;
  version?: number;
}

export interface Part {
  id: number;
  assembly_id: number;
  name: string;
  part_number: string;
  nc12: string;
  description: string;
  material: string;
  supplier: string;
  drawing_number: string;
  revision: string;
  version: number;
  created_at: string;
}

export interface PartCreate {
  assembly_id: number;
  name: string;
  part_number?: string;
  nc12?: string;
  description?: string;
  material?: string;
  supplier?: string;
  drawing_number?: string;
  revision?: string;
}

export interface PartUpdate {
  name?: string;
  part_number?: string;
  nc12?: string;
  description?: string;
  material?: string;
  supplier?: string;
  drawing_number?: string;
  revision?: string;
  version?: number;
}

// ── FMEA Base Fields ────────────────────────────────────────

interface FmeaBase {
  id: number;
  part_id: number | null;
  step_id: string;
  failure_mode: string;
  failure_effect: string;
  severity: number;
  failure_cause: string;
  occurrence: number;
  current_prevention_controls: string;
  current_detection_controls: string;
  detection: number;
  rpn: number;
  action_priority: string;
  criticality: string;
  recommended_action: string;
  responsibility: string;
  target_date: string;
  action_status: string;
  action_taken: string;
  new_severity: number;
  new_occurrence: number;
  new_detection: number;
  new_rpn: number;
  new_action_priority: string;
  notes: string;
  version: number;
  created_at: string;
  updated_at: string;
}

// ── SFMEA ───────────────────────────────────────────────────

export interface SfmeaEntry extends FmeaBase {
  system_element: string;
  system_function: string;
  system_requirement: string;
  focus_element: string;
  asil_rating: string;
  safety_goal: string;
  safety_mechanism: string;
  ftti: string;
  safe_state: string;
  diagnostic_coverage: string;
}

export interface SfmeaCreate {
  part_id?: number | null;
  step_id: string;
  system_element?: string;
  system_function?: string;
  system_requirement?: string;
  focus_element?: string;
  failure_mode?: string;
  failure_effect?: string;
  severity?: number;
  failure_cause?: string;
  occurrence?: number;
  current_prevention_controls?: string;
  current_detection_controls?: string;
  detection?: number;
  asil_rating?: string;
  safety_goal?: string;
  safety_mechanism?: string;
  ftti?: string;
  safe_state?: string;
  diagnostic_coverage?: string;
  recommended_action?: string;
  responsibility?: string;
  target_date?: string;
  action_status?: string;
  notes?: string;
}

export type SfmeaUpdate = Partial<SfmeaCreate> & { version?: number };

// ── DFMEA ───────────────────────────────────────────────────

export interface DfmeaEntry extends FmeaBase {
  part_name: string;
  function: string;
  requirement: string;
  asil_rating: string;
  safety_goal: string;
  safety_mechanism: string;
  ftti: string;
  safe_state: string;
  diagnostic_coverage: string;
}

export interface DfmeaCreate {
  part_id?: number | null;
  step_id: string;
  part_name?: string;
  function?: string;
  requirement?: string;
  failure_mode?: string;
  failure_effect?: string;
  severity?: number;
  failure_cause?: string;
  occurrence?: number;
  current_prevention_controls?: string;
  current_detection_controls?: string;
  detection?: number;
  asil_rating?: string;
  recommended_action?: string;
  responsibility?: string;
  target_date?: string;
  action_status?: string;
  notes?: string;
}

export type DfmeaUpdate = Partial<DfmeaCreate> & { version?: number };

// ── PFMEA ───────────────────────────────────────────────────

export interface PfmeaEntry extends FmeaBase {
  process_step: string;
  process_function: string;
  requirement: string;
  init_ctq: string;
  rev_ctq: string;
}

export interface PfmeaCreate {
  part_id?: number | null;
  step_id: string;
  process_step?: string;
  process_function?: string;
  requirement?: string;
  failure_mode?: string;
  failure_effect?: string;
  severity?: number;
  failure_cause?: string;
  occurrence?: number;
  current_prevention_controls?: string;
  current_detection_controls?: string;
  detection?: number;
  recommended_action?: string;
  responsibility?: string;
  target_date?: string;
  action_status?: string;
  notes?: string;
}

export type PfmeaUpdate = Partial<PfmeaCreate> & { version?: number };

// ── Control Plan ────────────────────────────────────────────

export interface ControlPlanEntry {
  id: number;
  part_id: number | null;
  step_id: string;
  process_step: string;
  machine_device: string;
  characteristic_number: string;
  product_characteristic: string;
  process_characteristic: string;
  special_char_class: string;
  specification_tolerance: string;
  evaluation_measurement: string;
  sample_size: string;
  sample_frequency: string;
  control_method: string;
  reaction_plan: string;
  responsible: string;
  notes: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ControlPlanCreate {
  part_id?: number | null;
  step_id: string;
  process_step?: string;
  machine_device?: string;
  characteristic_number?: string;
  product_characteristic?: string;
  process_characteristic?: string;
  special_char_class?: string;
  specification_tolerance?: string;
  evaluation_measurement?: string;
  sample_size?: string;
  sample_frequency?: string;
  control_method?: string;
  reaction_plan?: string;
  responsible?: string;
  notes?: string;
}

export type ControlPlanUpdate = Partial<ControlPlanCreate> & { version?: number };

// ── Analytics ───────────────────────────────────────────────

export interface DashboardSummary {
  counts: {
    projects: number;
    assemblies: number;
    parts: number;
    sfmea: number;
    dfmea: number;
    pfmea: number;
    control_plan: number;
  };
}

export interface RiskMatrixData {
  [key: string]: number; // "severity,occurrence" -> count
}

export interface TopRisk {
  type: string;
  step_id: string;
  failure_mode: string;
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
  action_priority: string;
  action_status: string;
}

export interface ProjectStats {
  total_projects: number;
  total_assemblies: number;
  total_parts: number;
  total_sfmea: number;
  total_dfmea: number;
  total_pfmea: number;
  total_control_plan: number;
  sfmea_by_criticality: Record<string, number>;
  dfmea_by_criticality: Record<string, number>;
  pfmea_by_criticality: Record<string, number>;
  sfmea_by_ap: Record<string, number>;
  dfmea_by_ap: Record<string, number>;
  pfmea_by_ap: Record<string, number>;
  sfmea_by_status: Record<string, number>;
  dfmea_by_status: Record<string, number>;
  pfmea_by_status: Record<string, number>;
  avg_rpn_sfmea: number;
  avg_rpn_dfmea: number;
  avg_rpn_pfmea: number;
  max_rpn_sfmea: number;
  max_rpn_dfmea: number;
  max_rpn_pfmea: number;
}

export interface FailureCause {
  failure_cause: string;
  count: number;
  initial_rpn: number;
  avg_rpn: number;
  revised_rpn: number;
  type: string;
}

// ── Sync / Traceability ─────────────────────────────────────

export interface SyncSummary {
  total_links: number;
  synced: number;
  out_of_sync: number;
  dfmea_unlinked: number;
  pfmea_unlinked: number;
  sfmea_unlinked: number;
}

export interface TraceabilityChain {
  sfmea: SfmeaEntry | null;
  dfmea: DfmeaEntry | null;
  pfmea: PfmeaEntry | null;
  control_plan: ControlPlanEntry | null;
  link: {
    id: number;
    sync_status: string;
  } | null;
}

// ── Audit ───────────────────────────────────────────────────

export interface AuditEntry {
  id: number;
  user_id: number | null;
  username: string | null;
  table_name: string;
  record_id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  field_changes: Record<string, { old: string; new: string }> | null;
  timestamp: string;
  entry_hash: string;
}

// ── Union Types ─────────────────────────────────────────────

export type FmeaType = "sfmea" | "dfmea" | "pfmea" | "control-plan";
export type FmeaEntry = SfmeaEntry | DfmeaEntry | PfmeaEntry | ControlPlanEntry;

// ── Admin / SaaS License ───────────────────────────────────

export interface AdminDashboardSummary {
  total_licenses: number;
  active_licenses: number;
  trial_licenses: number;
  expiring_30d: number;
  disabled_licenses: number;
}

export interface SaasLicense {
  id: number;
  license_key: string;
  subscription_id: number | null;
  owner_user_id: number | null;
  customer_name: string;
  customer_email: string;
  plan: string;
  max_seats: number;
  activated_seats: number;
  status: string;
  trial_ends_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface SaasLicenseCreate {
  customer_name: string;
  customer_email: string;
  plan?: string;
  max_seats?: number;
  status?: string;
  trial_ends_at?: string | null;
  expires_at?: string | null;
}

export interface SaasLicenseUpdate {
  customer_name?: string;
  customer_email?: string;
  plan?: string;
  max_seats?: number;
  activated_seats?: number;
  status?: string;
  trial_ends_at?: string | null;
  expires_at?: string | null;
}

export interface SubscriptionInfo {
  id: number;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  owner_user_id: number | null;
  plan: string;
  billing_interval: string;
  status: string;
  quantity: number;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface UserWithSession {
  id: number;
  username: string;
  display_name: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  has_active_seat: boolean;
  last_heartbeat: string | null;
  license_key: string | null;
}

export interface AdminUserCreate {
  username: string;
  password: string;
  display_name: string;
  email?: string;
  role?: string;
}

export interface AdminUserUpdate {
  display_name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
}

export interface CheckoutSessionRequest {
  plan: string;
  quantity?: number;
  customer_email?: string;
  customer_name?: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}
