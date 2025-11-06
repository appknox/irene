/**
 * Pendo Analytics Provider
 *
 * Wraps the existing window.pendo API to conform to the AnalyticsProvider interface.
 * Pendo is primarily used for product tours and user guidance, not event tracking.
 *
 * Note: We don't use Pendo for event tracking (CSB/PostHog handle that).
 * Pendo is only used for user identification to enable product tours.
 */

import type {
  AnalyticsProvider,
  ProviderConfig,
  UserTraits,
} from './analytics-provider';

export class PendoProvider implements AnalyticsProvider {
  name = 'pendo' as const;
  private _isReady = false;

  /**
   * Initialize Pendo provider
   * Pendo is loaded via external script in app initializer, so we just check if it's available
   */
  async initialize(config: ProviderConfig): Promise<void> {
    if (!config.enabled) {
      console.info('[Pendo] Provider disabled, skipping initialization');
      return;
    }

    // Pendo is loaded via script tag in app/initializers/irene.js
    // We just check if window.pendo is available
    const checkInterval = setInterval(() => {
      if (typeof window.pendo !== 'undefined') {
        this._isReady = true;
        clearInterval(checkInterval);
        console.info('[Pendo] Provider ready');
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!this._isReady) {
        console.warn('[Pendo] Provider not available after 5s timeout');
      }
    }, 5000);
  }

  /**
   * Check if Pendo is ready
   */
  isReady(): boolean {
    return this._isReady && typeof window.pendo !== 'undefined';
  }

  /**
   * Identify user in Pendo
   * This enables product tours and guides for the specific user
   */
  identify(userId: string, traits?: UserTraits): void {
    if (!this.isReady() || typeof window.pendo?.initialize !== 'function') {
      return;
    }

    try {
      // Pendo expects visitor and account objects
      window.pendo.initialize?.({
        visitor: {
          id: userId,
          email: traits?.email,
        },
        account: {
          id: traits?.organization_id || traits?.account_domain || 'unknown',
        },
      });

      console.info('[Pendo] User identified:', {
        userId,
        org: traits?.organization_id,
      });
    } catch (error) {
      console.error('[Pendo] Identify failed:', error);
    }
  }

  /**
   * Track event in Pendo
   * Note: We don't use Pendo for event tracking (CSB/PostHog handle that)
   * This is a no-op to conform to the interface
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  track(_event: string, ..._rest: unknown[]): void {
    // Pendo is not used for event tracking
    // Events go to CSB and PostHog instead
  }

  /**
   * Track page view in Pendo
   * Note: Pendo automatically tracks page views, so this is a no-op
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  page(..._rest: unknown[]): void {
    // Pendo automatically tracks page views
    // No need for manual tracking
  }

  /**
   * Reset Pendo (logout user)
   * Pendo doesn't have an explicit logout method
   */
  reset(): void {
    // Pendo doesn't have a reset/logout method
    // User identity is cleared when page reloads after logout
    console.info('[Pendo] User session will reset on page reload');
  }
}
