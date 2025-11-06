/**
 * Customer Success Box (CSB) Analytics Provider
 *
 * Wraps the existing window.analytics (CSB) API to conform to the AnalyticsProvider interface.
 * This maintains backward compatibility with existing CSB integration while allowing
 * the analytics service to treat CSB like any other provider.
 *
 * CSB is the legacy analytics system that tracks feature usage for customer success teams.
 */

import ENV from 'irene/config/environment';
import type {
  AnalyticsProvider,
  ProviderConfig,
  UserTraits,
  EventProperties,
  PageProperties,
} from './analytics-provider';

export class CSBProvider implements AnalyticsProvider {
  name = 'csb' as const;
  private _isReady = false;

  /**
   * Initialize CSB provider
   * CSB is loaded via external script in app initializer, so we just check if it's available
   */
  async initialize(config: ProviderConfig): Promise<void> {
    if (!config.enabled) {
      console.info('[CSB] Provider disabled, skipping initialization');
      return;
    }

    // CSB is loaded via script tag in app/initializers/irene.js
    // We just check if window.analytics is available
    const checkInterval = setInterval(() => {
      if (typeof window.analytics !== 'undefined') {
        this._isReady = true;
        clearInterval(checkInterval);
        console.info('[CSB] Provider ready');
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      if (!this._isReady) {
        console.warn('[CSB] Provider not available after 5s timeout');
      }
    }, 5000);
  }

  /**
   * Check if CSB is ready
   */
  isReady(): boolean {
    return this._isReady && typeof window.analytics !== 'undefined';
  }

  /**
   * Identify user in CSB
   */
  identify(userId: string, traits?: UserTraits): void {
    if (!this.isReady() || typeof window.analytics?.identify !== 'function') {
      return;
    }

    try {
      // CSB identify expects user ID and properties object
      const csbTraits: CsbAnalyticsUserIdentificationObject = {
        custom_username: traits?.username || traits?.email || '',
        email: traits?.email || '',
        account_id: traits?.organization_id || '',
        custom_Organization: traits?.organization_name || '',
        custom_role: traits?.role || '',
        first_name: traits?.username || traits?.name || '',
      };

      window.analytics.identify(userId, csbTraits);
    } catch (error) {
      console.error('[CSB] Identify failed:', error);
    }
  }

  /**
   * Track event in CSB
   *
   * CSB expects events in format: feature(feature, module, product)
   * We extract these from properties or use defaults
   */
  track(event: string, properties?: EventProperties): void {
    if (!this.isReady() || typeof window.analytics?.feature !== 'function') {
      return;
    }

    try {
      // CSB uses feature(), not track()
      const feature = (properties?.feature as string) || event;
      const module = (properties?.module as any) || ('Unknown' as any);
      const product = (properties?.product as any) || ('Appknox' as any);

      window.analytics.feature(feature, module, product);
    } catch (error) {
      console.error('[CSB] Track failed:', error);
    }
  }

  /**
   * Track page view in CSB
   * CSB doesn't have explicit pageview tracking, so we track it as a feature
   */
  page(pageName?: string, properties?: PageProperties): void {
    if (!this.isReady() || typeof window.analytics?.feature !== 'function') {
      return;
    }

    try {
      // Track pageview as a feature event
      const feature = `Page View: ${pageName || properties?.title || 'Unknown'}`;
      window.analytics.feature(feature, 'Navigation' as any, 'Appknox' as any);
    } catch (error) {
      console.error('[CSB] Page tracking failed:', error);
    }
  }

  /**
   * Reset CSB (logout user)
   */
  reset(): void {
    if (!this.isReady() || typeof window.analytics?.logout !== 'function') {
      return;
    }

    try {
      window.analytics.logout();
      console.info('[CSB] User session reset');
    } catch (error) {
      console.error('[CSB] Reset failed:', error);
    }
  }

  /**
   * Track legacy CSB event using ENV.csb configuration
   *
   * @param csbKey - Key from ENV.csb (e.g., 'dynamicScanBtnClick')
   */
  trackLegacyEvent(csbKey: string): void {
    if (!this.isReady()) {
      return;
    }

    try {
      const csbEventConfig = (ENV.csb as Record<string, any>)[csbKey];

      if (!csbEventConfig) {
        console.warn('[CSB] Event configuration not found:', csbKey);
        return;
      }

      this.track(csbKey, {
        feature: csbEventConfig.feature,
        module: csbEventConfig.module,
        product: csbEventConfig.product,
      });
    } catch (error) {
      console.error('[CSB] Legacy event tracking failed:', error);
    }
  }
}
