/**
 * PostHog Analytics Provider
 *
 * Implements the AnalyticsProvider interface for PostHog.
 * Supports:
 * - Proxy configuration (custom domains per deployment)
 * - User identification with super properties
 * - Session replay with privacy controls
 * - Event auto-enrichment
 * - Graceful error handling
 */

import ENV from 'irene/config/environment';
import type {
  AnalyticsProvider,
  ProviderConfig,
  UserTraits,
  EventProperties,
  PageProperties,
} from './analytics-provider';

// PostHog types (will be loaded dynamically)
type PostHog = {
  init: (apiKey: string, config?: any) => void;
  identify: (userId: string, properties?: any) => void;
  capture: (event: string, properties?: any) => void;
  reset: () => void;
  startSessionRecording: () => void;
  stopSessionRecording: () => void;
};

export class PostHogProvider implements AnalyticsProvider {
  name = 'posthog' as const;
  private sdk: PostHog | null = null;
  private _isReady = false;

  /**
   * Initialize PostHog SDK with proxy support
   *
   * @param config - Configuration including apiKey and apiHost (proxy or direct PostHog)
   */
  async initialize(config: ProviderConfig): Promise<void> {
    // Skip if no API key or host provided (on-premise, analytics disabled)
    if (!config.apiKey || !config.apiHost) {
      console.info(
        '[PostHog] No configuration provided, skipping initialization'
      );
      return;
    }

    if (!config.enabled) {
      console.info('[PostHog] Provider disabled, skipping initialization');
      return;
    }

    try {
      // Dynamic import to avoid loading SDK if not needed
      // @ts-expect-error - posthog-js types not available at compile time
      const { default: posthog } = await import('posthog-js');

      // Initialize PostHog with proxy support
      posthog.init(config.apiKey, {
        api_host: config.apiHost, // Can be proxy (https://analytics.customer.com) OR direct PostHog
        ui_host: config.uiHost || 'https://app.posthog.com', // Always PostHog UI for viewing data
        person_profiles: 'always', // Enable person profiles
        capture_pageview: false, // We handle pageviews manually for better control
        capture_pageleave: true, // Track when users leave pages
        enable_recording_console_log: true, // Capture console logs in session replay
        session_recording: {
          recordCrossOriginIframes: false, // Privacy: don't record cross-origin iframes
          maskAllInputs: true, // Privacy: mask all input fields by default
          maskTextSelector: '.ph-no-capture, [data-ph-no-capture]', // Elements to mask
        },
      });

      this.sdk = posthog;
      this._isReady = true;

      console.info('[PostHog] Initialized successfully', {
        api_host: config.apiHost,
        deployment: ENV.isEnterprise ? 'enterprise' : 'saas',
        whitelabel: ENV.whitelabel?.enabled || false,
      });
    } catch (error) {
      console.error('[PostHog] Initialization failed:', error);
      this._isReady = false;
    }
  }

  /**
   * Check if PostHog is ready
   */
  isReady(): boolean {
    return this._isReady && this.sdk !== null;
  }

  /**
   * Identify a user in PostHog
   *
   * @param userId - Unique user identifier
   * @param traits - User properties (becomes "Person Properties" in PostHog)
   */
  identify(userId: string, traits?: UserTraits): void {
    if (!this.isReady() || !this.sdk) {
      console.warn('[PostHog] SDK not ready, queuing identify call');
      return;
    }

    try {
      // Identify user with properties
      this.sdk.identify(userId, traits);

      console.info('[PostHog] User identified:', {
        userId,
        org: traits?.organization_id,
        role: traits?.role,
      });
    } catch (error) {
      console.error('[PostHog] Identify failed:', error);
    }
  }

  /**
   * Track an event in PostHog
   *
   * @param event - Event name (snake_case recommended)
   * @param properties - Event properties
   */
  track(event: string, properties?: EventProperties): void {
    if (!this.isReady() || !this.sdk) {
      console.warn('[PostHog] SDK not ready, queuing track call');
      return;
    }

    try {
      // Auto-enrich all events with deployment context
      const enrichedProperties = {
        ...properties,
        // Super properties (attached to ALL events automatically)
        $set: {
          deployment_type: ENV.isEnterprise ? 'enterprise' : 'saas',
          whitelabel_enabled: ENV.whitelabel?.enabled || false,
          whitelabel_name: ENV.whitelabel?.name || null,
          app_version: ENV.version,
          product_version: ENV.productVersions?.appknox || null,
        },
        // Event-specific timestamp
        timestamp: new Date().toISOString(),
      };

      this.sdk.capture(event, enrichedProperties);
    } catch (error) {
      console.error('[PostHog] Track failed:', error);
    }
  }

  /**
   * Track a page view in PostHog
   *
   * @param pageName - Page name or route
   * @param properties - Page properties
   */
  page(pageName?: string, properties?: PageProperties): void {
    if (!this.isReady() || !this.sdk) {
      return;
    }

    try {
      // PostHog capture pageview with custom properties
      this.sdk.capture('$pageview', {
        ...properties,
        $current_url: properties?.url || window.location.href,
        $pathname: window.location.pathname,
        $page_name: pageName || document.title,
      });
    } catch (error) {
      console.error('[PostHog] Page tracking failed:', error);
    }
  }

  /**
   * Reset PostHog (clear user identity)
   * Call this on logout
   */
  reset(): void {
    if (!this.isReady() || !this.sdk) {
      return;
    }

    try {
      this.sdk.reset();
      console.info('[PostHog] User session reset');
    } catch (error) {
      console.error('[PostHog] Reset failed:', error);
    }
  }

  /**
   * Start session replay recording
   */
  startSessionReplay(): void {
    if (!this.isReady() || !this.sdk) {
      return;
    }

    try {
      this.sdk.startSessionRecording();
      console.info('[PostHog] Session replay started');
    } catch (error) {
      console.error('[PostHog] Failed to start session replay:', error);
    }
  }

  /**
   * Stop session replay recording
   */
  stopSessionReplay(): void {
    if (!this.isReady() || !this.sdk) {
      return;
    }

    try {
      this.sdk.stopSessionRecording();
      console.info('[PostHog] Session replay stopped');
    } catch (error) {
      console.error('[PostHog] Failed to stop session replay:', error);
    }
  }
}
