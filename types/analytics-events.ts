/**
 * Analytics Event Type Definitions
 *
 * This file provides type-safe event tracking with:
 * - Autocomplete for event names
 * - Required properties enforcement
 * - Self-documenting event catalog
 * - Refactoring safety
 *
 * To add a new event:
 * 1. Add it to the AnalyticsEvent union type
 * 2. Specify required properties
 * 3. TypeScript will enforce usage throughout the app
 */

/**
 * Common event properties
 */
interface BaseEventProperties {
  // CSB-specific (for backward compatibility)
  feature?: string;
  module?: string;
  product?: string;

  // PostHog-specific
  timestamp?: string;
  [key: string]: unknown;
}

/**
 * Analytics Event Union Type
 *
 * Each event has a name and required properties
 */
export type AnalyticsEvent =
  // App Upload Events
  | {
      name: 'app_uploaded';
      properties: BaseEventProperties & {
        file_size: number;
        platform: 'ios' | 'android';
        package_name?: string;
      };
    }
  | {
      name: 'app_upload_failed';
      properties: BaseEventProperties & {
        error_message?: string;
        file_size?: number;
      };
    }

  // Scan Events
  | {
      name: 'scan_started';
      properties: BaseEventProperties & {
        scan_type: 'static' | 'dynamic' | 'api' | 'manual';
        file_id: string;
      };
    }
  | {
      name: 'dynamic_scan_started';
      properties: BaseEventProperties & {
        has_automation: boolean;
        device_type?: string;
      };
    }
  | {
      name: 'api_scan_started';
      properties: BaseEventProperties & {
        endpoint_count?: number;
      };
    }
  | {
      name: 'manual_scan_requested';
      properties: BaseEventProperties & {
        file_id: string;
      };
    }

  // Report & Export Events
  | {
      name: 'report_downloaded';
      properties: BaseEventProperties & {
        report_type: string;
        file_id: string;
        format?: 'pdf' | 'csv' | 'json';
      };
    }
  | {
      name: 'vulnerability_exported';
      properties: BaseEventProperties & {
        format: 'pdf' | 'csv' | 'json';
        vulnerability_count: number;
      };
    }

  // Integration Events
  | {
      name: 'integration_connected';
      properties: BaseEventProperties & {
        integration_type: 'github' | 'jira' | 'slack' | 'servicenow' | 'splunk';
      };
    }
  | {
      name: 'integration_disconnected';
      properties: BaseEventProperties & {
        integration_type: string;
      };
    }

  // Team & Organization Events
  | {
      name: 'team_created';
      properties: BaseEventProperties & {
        team_name?: string;
      };
    }
  | {
      name: 'team_member_added';
      properties: BaseEventProperties & {
        team_id?: string;
        role?: string;
      };
    }
  | {
      name: 'user_invited';
      properties: BaseEventProperties & {
        invitee_email?: string;
      };
    }

  // Navigation & Feature Usage (CSB Legacy)
  | {
      name: 'feature_used';
      properties: BaseEventProperties & {
        feature: string;
        module: string;
        product: string;
      };
    }

  // Authentication Events
  | {
      name: 'user_logged_in';
      properties: BaseEventProperties & {
        auth_method?: 'password' | 'saml' | 'oidc';
      };
    }
  | {
      name: 'user_logged_out';
      properties?: BaseEventProperties;
    }

  // Generic events (for gradual migration)
  | {
      name: string;
      properties?: BaseEventProperties;
    };

/**
 * Extract event name type
 */
export type EventName = AnalyticsEvent['name'];

/**
 * Extract properties for a specific event
 */
export type EventProperties<T extends EventName> = Extract<
  AnalyticsEvent,
  { name: T }
>['properties'];

/**
 * CSB Event Configuration (from ENV.csb)
 */
export interface CsbEventConfig {
  feature: string;
  module: string;
  product: string;
}
