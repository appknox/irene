/**
 * Shared TypeScript types for API communication
 */

// Common API response structure (Django REST Framework)
export interface DRFPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Common API error structure
export interface APIError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Authentication types
export interface LoginCredentials {
  username: string;
  password: string;
  otp?: string;
}

export interface LoginResponse {
  token: string;
  user_id: string;
  email: string;
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  created_on: string;
  updated_on: string;
}

// Organization types
export interface Organization {
  id: number;
  name: string;
  created_on: string;
  updated_on: string;
  features?: OrganizationFeatures;
}

export interface OrganizationFeatures {
  ai_features_enabled: boolean;
  dynamic_scan_enabled: boolean;
  api_scan_enabled: boolean;
  sbom_enabled: boolean;
  storeknox_enabled: boolean;
}

export interface OrganizationMe {
  id: number;
  user: string;
  organization: number;
  is_admin: boolean;
  is_owner: boolean;
  created_on: string;
  updated_on: string;
}

// Project types
export interface Project {
  id: number;
  name: string;
  package_name: string;
  platform: number;
  platform_display: string;
  file_count: number;
  created_on: string;
  updated_on: string;
}

// File types
export interface File {
  id: number;
  name: string;
  version: string;
  version_code: string;
  project: number;
  is_active: boolean;
  risk_count_critical: number;
  risk_count_high: number;
  risk_count_medium: number;
  risk_count_low: number;
  risk_count_none: number;
  risk_count_unknown: number;
  created_on: string;
  updated_on: string;
}

// Analysis types
export interface Analysis {
  id: number;
  vulnerability: number;
  file: number;
  risk: number;
  risk_display: string;
  status: number;
  status_display: string;
  findings: Finding[];
  cvss_base: number;
  created_on: string;
  updated_on: string;
}

export interface Finding {
  title: string;
  description: string;
}

export interface Vulnerability {
  id: number;
  name: string;
  description: string;
  intro: string;
  compliant: string;
  non_compliant: string;
  business_implication: string;
  types: number[];
  created_on: string;
  updated_on: string;
}

// Risk levels (as const objects instead of enums for erasableSyntaxOnly)
export const RiskLevel = {
  UNKNOWN: -1,
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

// Platform types
export const Platform = {
  ANDROID: 0,
  IOS: 1,
} as const;

export type Platform = (typeof Platform)[keyof typeof Platform];

// Analysis status
export const AnalysisStatus = {
  WAITING: 0,
  RUNNING: 1,
  COMPLETED: 2,
  ERROR: 3,
} as const;

export type AnalysisStatus =
  (typeof AnalysisStatus)[keyof typeof AnalysisStatus];

// API namespaces
export const APINamespace = {
  API: '/api',
  API_V2: '/api/v2',
  API_V3: '/api/v3',
} as const;

export type APINamespace = (typeof APINamespace)[keyof typeof APINamespace];
