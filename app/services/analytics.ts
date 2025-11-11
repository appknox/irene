import Service from '@ember/service';
import posthog from 'posthog-js';
import ENV from 'irene/config/environment';
import type OrganizationModel from 'irene/models/organization';
import type UserModel from 'irene/models/user';

export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, any>;
  userId?: string | null;
  context?: Record<string, any>;
  timestamp?: Date;
};

type AnalyticsProvider = {
  identify?(userId: string, traits?: Record<string, any>): void;
  track?(eventName: string, properties?: Record<string, any>): void;
  page?(name?: string, properties?: Record<string, any>): void;
  flush?(): Promise<void>;
};

/**
 * Check if analytics (PostHog) is enabled via environment config.
 */
const isEnabled = () => {
  return Boolean(ENV.posthogApiKey && ENV.posthogApiHost);
};

/**
 * Ensures PostHog is initialized with proper masking and configuration.
 */
const ensureInit = () => {
  if (!isEnabled()) {
    return;
  }

  posthog.init(ENV.posthogApiKey, {
    api_host: ENV.posthogApiHost,
    person_profiles: 'always',
    session_recording: {
      maskTextSelector: '.posthog-sensitive',
    },
  });
};

/**
 * Central Analytics Service (Ember service)
 * -----------------------------------------
 * Acts as the orchestrator for all analytics events and integrations.
 */
export default class AnalyticsService extends Service {
  private providers: AnalyticsProvider[] = [];
  private isInitialized = false;

  /**
   * Initializes PostHog and any other analytics providers.
   */
  initializePosthog() {
    if (this.isInitialized) {
      return;
    }

    ensureInit();

    if (isEnabled()) {
      this.registerProvider({
        identify: (userId, traits) => posthog.identify(userId, traits),
        track: (eventName, props) => posthog.capture(eventName, props),
        page: (name, props) => posthog.capture('$pageview', { name, ...props }),
        flush: async () => posthog.reset(),
      });
    }

    this.isInitialized = true;
  }

  /**
   * Register a new analytics provider.
   */
  registerProvider(provider: AnalyticsProvider) {
    this.providers.push(provider);
  }

  /**
   * Identify and register the current user and organization.
   */
  registerPostHogOrganization(
    user: UserModel,
    organization: OrganizationModel | null
  ) {
    if (!isEnabled()) {
      return;
    }

    try {
      if (posthog._isIdentified?.()) {
        return;
      } else if (user?.id && organization?.id) {
        posthog.identify(user.id, {
          email: user?.email,
          username: user?.username,
          org_id: organization?.id,
          org_name: organization?.name,
        });
      }
    } catch (e) {
      console.warn('PostHog register failed', e);
    }
  }

  /**
   * Clear user and session data (same as unregisterPostHog).
   */
  unregister() {
    if (!isEnabled()) {
      return;
    }

    posthog.stopSessionRecording();
    posthog.reset();
  }

  /**
   * Identify a user across all analytics systems.
   */
  identify(userId: string, traits?: Record<string, any>) {
    for (const provider of this.providers) {
      provider.identify?.(userId, traits);
    }
  }

  /**
   * Track a custom event.
   */
  track(event: AnalyticsEvent) {
    const { name, properties = {}, userId } = event;

    for (const provider of this.providers) {
      provider.track?.(name, {
        ...properties,
        userId,
        timestamp: event.timestamp ?? new Date().toISOString(),
        context: event.context,
      });
    }
  }

  /**
   * Track a page view or route transition.
   */
  page(name: string, properties?: Record<string, any>) {
    for (const provider of this.providers) {
      provider.page?.(name, properties);
    }
  }

  /**
   * Flush any queued analytics data (if supported by provider).
   */
  async flush() {
    await Promise.all(this.providers.map((p) => p.flush?.()));
  }
}

declare module '@ember/service' {
  interface Registry {
    analytics: AnalyticsService;
  }
}
