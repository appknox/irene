/**
 * Analytics Service
 *
 * Central orchestrator for all analytics operations.
 * Manages multiple analytics providers (PostHog, CSB, Pendo) and broadcasts events to all active providers.
 *
 * Features:
 * - Provider registration pattern (pluggable analytics providers)
 * - Hybrid configuration (Runtime API > Build ENV > Disabled)
 * - Multi-tenant support (different configs per deployment)
 * - Event broadcasting to all providers
 * - Automatic event enrichment
 * - Event name transformation (CSB format → PostHog snake_case)
 * - Graceful error handling (one provider failure doesn't break others)
 *
 * Usage:
 * ```typescript
 * @service declare analytics: AnalyticsService;
 *
 * // Track event
 * this.analytics.track('app_uploaded', { file_size: 12345, platform: 'android' });
 *
 * // Identify user
 * this.analytics.identify(user.id, { email: user.email, role: user.role });
 *
 * // Legacy CSB event
 * this.analytics.trackLegacyCSBEvent('dynamicScanBtnClick');
 * ```
 */

import Service, { service } from '@ember/service';
import ENV from 'irene/config/environment';
import { transformEventName } from 'irene/utils/transform-event-name';
import { PostHogProvider } from '../providers/posthog-provider';
import { CSBProvider } from '../providers/csb-provider';
import { PendoProvider } from '../providers/pendo-provider';
import type ConfigurationService from './configuration';
import type IntegrationService from './integration';
import type {
  AnalyticsProvider,
  UserTraits,
  EventProperties,
  PageProperties,
} from '../providers/analytics-provider';
import type { CsbEventConfig } from '../../types/analytics-events';

interface QueuedEvent {
  type: 'identify' | 'track' | 'page';
  data: {
    userId?: string;
    event?: string;
    pageName?: string;
    traits?: UserTraits;
    properties?: EventProperties;
  };
}

export default class AnalyticsService extends Service {
  @service declare configuration: ConfigurationService;
  @service declare integration: IntegrationService;

  private providers = new Map<string, AnalyticsProvider>();
  private eventQueue: QueuedEvent[] = [];
  private isInitialized = false;

  /**
   * Initialize analytics service
   * Called automatically when service is first accessed
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.info('[Analytics] Initializing analytics service...');

    try {
      // Initialize all providers in parallel
      await Promise.allSettled([
        this.initializePostHog(),
        this.initializeCSB(),
        this.initializePendo(),
      ]);

      this.isInitialized = true;

      // Flush queued events
      await this.flushEventQueue();

      console.info('[Analytics] Service initialized successfully', {
        providers: Array.from(this.providers.keys()),
      });
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error);
    }
  }

  /**
   * Initialize PostHog provider with hybrid configuration
   * Priority: API config > ENV vars > Disabled
   */
  private async initializePostHog(): Promise<void> {
    try {
      // Hybrid configuration: API overrides ENV
      const posthogKey =
        this.configuration.integrationData?.posthog_key ||
        ENV.posthogApiKey ||
        null;

      const posthogHost =
        this.configuration.integrationData?.posthog_host ||
        ENV.posthogApiHost ||
        null;

      const posthogUiHost =
        this.configuration.integrationData?.posthog_ui_host ||
        (ENV as any).posthogUiHost ||
        'https://app.posthog.com';

      // Skip if no configuration (on-premise or analytics disabled)
      if (!posthogKey || !posthogHost) {
        console.info('[Analytics] PostHog configuration not found, skipping');
        return;
      }

      // Create and initialize PostHog provider
      const postHogProvider = new PostHogProvider();
      await postHogProvider.initialize({
        apiKey: posthogKey,
        apiHost: posthogHost,
        uiHost: posthogUiHost,
        enabled: true,
      });

      if (postHogProvider.isReady()) {
        this.registerProvider(postHogProvider);
        console.info('[Analytics] PostHog provider registered');
      }
    } catch (error) {
      console.error('[Analytics] PostHog initialization failed:', error);
    }
  }

  /**
   * Initialize CSB provider
   */
  private async initializeCSB(): Promise<void> {
    try {
      // Check if CSB is enabled
      const isCsbEnabled = this.integration.isCSBEnabled();

      if (!isCsbEnabled) {
        console.info('[Analytics] CSB disabled, skipping');
        return;
      }

      const csbProvider = new CSBProvider();
      await csbProvider.initialize({ enabled: true });

      // CSB initialization is async (waits for script to load)
      // Register immediately, it will be ready when script loads
      this.registerProvider(csbProvider);
      console.info('[Analytics] CSB provider registered');
    } catch (error) {
      console.error('[Analytics] CSB initialization failed:', error);
    }
  }

  /**
   * Initialize Pendo provider
   */
  private async initializePendo(): Promise<void> {
    try {
      // Check if Pendo is enabled
      const isPendoEnabled = this.integration.isPendoEnabled();

      if (!isPendoEnabled) {
        console.info('[Analytics] Pendo disabled, skipping');
        return;
      }

      const pendoProvider = new PendoProvider();
      await pendoProvider.initialize({ enabled: true });

      // Pendo initialization is async (waits for script to load)
      // Register immediately, it will be ready when script loads
      this.registerProvider(pendoProvider);
      console.info('[Analytics] Pendo provider registered');
    } catch (error) {
      console.error('[Analytics] Pendo initialization failed:', error);
    }
  }

  /**
   * Register an analytics provider
   */
  registerProvider(provider: AnalyticsProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Check if a provider is active
   */
  isProviderActive(name: string): boolean {
    const provider = this.providers.get(name);
    return provider !== undefined && provider.isReady();
  }

  /**
   * Identify a user
   * Broadcasts to all active providers
   */
  async identify(userId: string, traits?: UserTraits): Promise<void> {
    if (!this.isInitialized) {
      // Queue for later if not initialized
      this.eventQueue.push({
        type: 'identify',
        data: { userId, traits },
      });
      await this.initialize();
      return;
    }

    // Broadcast to all providers
    const promises = Array.from(this.providers.values()).map((provider) => {
      try {
        if (provider.isReady()) {
          provider.identify(userId, traits);
        }
      } catch (error) {
        console.error(`[Analytics] ${provider.name} identify failed:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Track an event
   * Broadcasts to all active providers with event name transformation
   */
  async track(event: string, properties?: EventProperties): Promise<void> {
    if (!this.isInitialized) {
      // Queue for later if not initialized
      this.eventQueue.push({
        type: 'track',
        data: { event, properties },
      });
      await this.initialize();
      return;
    }

    // Broadcast to all providers
    const promises = Array.from(this.providers.values()).map((provider) => {
      try {
        if (!provider.isReady()) {
          return;
        }

        // Transform event name for PostHog (snake_case)
        const eventName =
          provider.name === 'posthog' ? transformEventName(event) : event;

        provider.track(eventName, properties);
      } catch (error) {
        console.error(`[Analytics] ${provider.name} track failed:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Track a page view
   * Broadcasts to all active providers
   */
  async page(pageName?: string, properties?: PageProperties): Promise<void> {
    if (!this.isInitialized) {
      // Queue for later if not initialized
      this.eventQueue.push({
        type: 'page',
        data: { pageName, properties },
      });
      await this.initialize();
      return;
    }

    // Broadcast to all providers
    const promises = Array.from(this.providers.values()).map((provider) => {
      try {
        if (provider.isReady()) {
          provider.page(pageName, properties);
        }
      } catch (error) {
        console.error(`[Analytics] ${provider.name} page failed:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Reset analytics (clear user identity)
   * Call this on logout
   */
  reset(): void {
    Array.from(this.providers.values()).forEach((provider) => {
      try {
        if (provider.isReady()) {
          provider.reset();
        }
      } catch (error) {
        console.error(`[Analytics] ${provider.name} reset failed:`, error);
      }
    });
  }

  /**
   * Track legacy CSB event using ENV.csb configuration
   * Maintains backward compatibility with existing CSB integration
   *
   * @param csbKey - Key from ENV.csb (e.g., 'dynamicScanBtnClick')
   */
  async trackLegacyCSBEvent(csbKey: string): Promise<void> {
    try {
      const csbEventConfig = (ENV.csb as Record<string, CsbEventConfig>)[
        csbKey
      ];

      if (!csbEventConfig) {
        console.warn('[Analytics] CSB event configuration not found:', csbKey);
        return;
      }

      // Track with CSB-specific properties
      await this.track(csbEventConfig.feature, {
        feature: csbEventConfig.feature,
        module: csbEventConfig.module,
        product: csbEventConfig.product,
      });
    } catch (error) {
      console.error('[Analytics] Legacy CSB event tracking failed:', error);
    }
  }

  /**
   * Start PostHog session replay
   */
  startSessionReplay(): void {
    const postHogProvider = this.providers.get('posthog') as
      | PostHogProvider
      | undefined;

    if (postHogProvider && postHogProvider.isReady()) {
      postHogProvider.startSessionReplay();
    }
  }

  /**
   * Stop PostHog session replay
   */
  stopSessionReplay(): void {
    const postHogProvider = this.providers.get('posthog') as
      | PostHogProvider
      | undefined;

    if (postHogProvider && postHogProvider.isReady()) {
      postHogProvider.stopSessionReplay();
    }
  }

  /**
   * Flush queued events
   * Called after initialization to process events that were tracked before providers were ready
   */
  private async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    console.info(
      `[Analytics] Flushing ${this.eventQueue.length} queued events`
    );

    const queue = [...this.eventQueue];
    this.eventQueue = [];

    for (const queuedEvent of queue) {
      try {
        switch (queuedEvent.type) {
          case 'identify':
            if (queuedEvent.data.userId) {
              await this.identify(
                queuedEvent.data.userId,
                queuedEvent.data.traits
              );
            }
            break;
          case 'track':
            if (queuedEvent.data.event) {
              await this.track(
                queuedEvent.data.event,
                queuedEvent.data.properties
              );
            }
            break;
          case 'page':
            await this.page(
              queuedEvent.data.pageName,
              queuedEvent.data.properties
            );
            break;
        }
      } catch (error) {
        console.error('[Analytics] Failed to flush queued event:', error);
      }
    }
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    analytics: AnalyticsService;
  }
}
