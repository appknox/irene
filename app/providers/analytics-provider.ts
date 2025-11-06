/**
 * Analytics Provider Interface
 *
 * Contract that all analytics providers (PostHog, CSB, Pendo, Hotjar) must implement.
 * This enables:
 * - Swappable providers (no vendor lock-in)
 * - Testability (mock providers in tests)
 * - Type safety (TypeScript ensures implementation)
 * - Consistent API across all providers
 */

export interface UserTraits {
  email?: string;
  username?: string;
  name?: string;
  role?: string;
  organization_id?: string;
  organization_name?: string;
  account_domain?: string;
  created_at?: string;
  plan_type?: string;
  is_trial?: boolean;
  is_enterprise?: boolean;
  is_whitelabel?: boolean;
  [key: string]: unknown;
}

export interface EventProperties {
  feature?: string;
  module?: string;
  product?: string;
  [key: string]: unknown;
}

export interface PageProperties {
  url?: string;
  title?: string;
  referrer?: string;
  [key: string]: unknown;
}

export interface ProviderConfig {
  apiKey?: string;
  apiHost?: string;
  uiHost?: string;
  enabled: boolean;
  [key: string]: unknown;
}

/**
 * Analytics Provider Interface
 *
 * All analytics providers must implement these methods
 */
export interface AnalyticsProvider {
  /**
   * Provider name (e.g., 'posthog', 'csb', 'pendo')
   */
  readonly name: string;

  /**
   * Initialize the provider with configuration
   * @param config - Provider-specific configuration
   * @returns Promise that resolves when initialization is complete
   */
  initialize(config: ProviderConfig): Promise<void>;

  /**
   * Check if provider is initialized and ready
   * @returns true if provider is ready to receive events
   */
  isReady(): boolean;

  /**
   * Identify a user with traits
   * @param userId - Unique user identifier
   * @param traits - User properties and metadata
   */
  identify(userId: string, traits?: UserTraits): void;

  /**
   * Track an event
   * @param event - Event name
   * @param properties - Event properties and metadata
   */
  track(event: string, properties?: EventProperties): void;

  /**
   * Track a page view
   * @param pageName - Name or path of the page
   * @param properties - Page properties and metadata
   */
  page(pageName?: string, properties?: PageProperties): void;

  /**
   * Reset/clear user identity (e.g., on logout)
   */
  reset(): void;
}
