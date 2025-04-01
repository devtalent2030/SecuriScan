// frontend/src/types.ts

// Helper interfaces
export interface SQLVulnerability {
  evidence?: string;
  param?: string;
  payload?: string;
  vulnerable?: boolean;
}

export interface TimeBasedTest {
  payload?: string;
  vulnerable?: boolean;
  evidence?: string;
  note?: string;
  delay?: number; // Added for consistency where used
}

// Consolidated interfaces
export interface SQLScanResult {
  action: string;
  url: string;
  sql_vulnerabilities: Array<{
    param: string;
    payload: string;
    vulnerable: boolean;
    evidence?: string;
  }>;
  time_based_test?: TimeBasedTest | null; 
  note?: string;
  error?: string;
}

export interface XSSScanResult {
  action?: string;
  url?: string;
  vulnerabilities?: { issue: string; evidence: string; severity: string }[];
  error?: string;
  note?: string;
}

export interface CommandInjectionScanResult {
  action?: string;
  url?: string;
  vulnerabilities?: { issue: string; evidence: string; severity: string }[]; // From updated pages
  vulnerable_params?: { param: string; payload: string; vulnerable: boolean; evidence?: string }[]; // From original
  time_based_test?: TimeBasedTest;
  error?: string;
  note?: string;
}

export interface CSRFScanResult {
  action?: string;
  url?: string;
  vulnerabilities?: { issue: string; evidence: string; severity: string }[]; // From updated pages
  csrf_vulnerabilities?: { form_action?: string; method?: string; vulnerable: boolean; evidence?: string }[] | string; // From original
  time_based_test?: TimeBasedTest;
  error?: string;
  note?: string;
}

export interface DirectoryEnumResult {
  action?: string;
  url?: string;
  vulnerabilities?: { issue: string; evidence: string; severity: string }[]; // From updated pages
  vulnerable_directories?: { url: string; status_code: number; vulnerable: boolean; evidence?: string }[]; // From original
  time_based_test?: TimeBasedTest;
  error?: string;
  note?: string;
}

export interface NosqlInjectionScanResult {
  action?: string;
  url?: string;
  vulnerabilities?: { issue: string; evidence: string; severity: string }[]; // From updated pages
  vulnerable_params?: { param: string; payload: string; vulnerable: boolean; evidence?: string; method?: string }[]; // From original
  detected_endpoints?: { method: string; url: string }[];
  time_based_test?: TimeBasedTest;
  error?: string;
  note?: string;
}

export interface BrokenAccessScanResult {
  action?: string;
  url?: string;
  vulnerabilities?: { issue: string; evidence: string; severity: string }[]; // From updated pages
  vulnerable_endpoints?: { url: string; issue: string; evidence?: string; params?: Record<string, string[]>; status_code?: number }[]; // From original
  detected_paths?: string[];
  time_based_test?: { vulnerable: boolean; delay?: number; evidence?: string; note?: string }; // Consolidated, matches latest usage
  error?: string;
  note?: string;
}

export interface CryptoFailuresScanResult {
  action?: string;
  url?: string;
  vulnerabilities?: { issue: string; evidence?: string; severity: string }[];
  certificate_info?: { issuer: string; subject: string; not_before: string; not_after: string; expired: boolean; error?: string };
  exposed_data?: string[];
  tls_info?: { version: string; cipher: string; error?: string };
  error?: string;
  note?: string;
}

export interface SecurityMisconfigScanResult {
  action?: string;
  url?: string;
  vulnerabilities?: { issue: string; evidence: string; severity: string }[];
  exposed_paths?: string[];
  headers?: Record<string, string>;
  error?: string;
  note?: string;
}

export interface DependencyScanResult {
  action?: string;
  url?: string;
  dependencies?: { library: string; version: string | null; source: string; status?: string }[];
  vulnerabilities?: { issue: string; evidence: string; severity: string }[];
  error?: string;
  note?: string;
}

export interface SsrfScanResult {
  action?: string;
  url?: string;
  vulnerabilities?: { issue: string; evidence: string; severity: string }[];
  tested_urls?: string[];
  error?: string;
  note?: string;
}

export interface AuthFailuresScanResult {
  action?: string;
  url?: string;
  vulnerabilities?: { issue: string; evidence?: string; severity: string }[];
  login_pages?: string[];
  error?: string;
  note?: string;
}

export interface LoggingMonitorResult {
  action?: string;
  url?: string;
  vulnerabilities?: { issue: string; evidence: string; severity: string }[];
  time_based_test?: { payload: string; vulnerable: boolean; evidence?: string; note?: string; severity?: string };
  error?: string;
  note?: string;
}