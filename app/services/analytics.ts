import Service, { service } from '@ember/service';
import posthog from 'posthog-js';

import { ensurePosthogInit, isPosthogEnabled } from 'irene/utils/posthog';
import type { SessionService } from 'irene/adapters/auth-base';
import type OrganizationModel from 'irene/models/organization';
import type UserModel from 'irene/models/user';
import type LoggerService from 'irene/services/logger';

export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, unknown>;
  userId?: string | null;
  context?: Record<string, unknown>;
  timestamp?: Date;
};

type AnalyticsProvider = {
  isEnabled?(): boolean;
  identify?(userId: string, traits?: Record<string, unknown>): void;
  track?(eventName: string, properties?: Record<string, unknown>): void;
  page?(name?: string, properties?: Record<string, unknown>): void;
  flush?(): Promise<void>;
  unregister?(): void;
};

/**
 * Central Analytics Service (Ember service)
 * -----------------------------------------
 * Acts as the orchestrator for all analytics events and integrations.
 */
export default class AnalyticsService extends Service {
  @service declare logger: LoggerService;
  @service declare session: SessionService;

  private readonly providers: AnalyticsProvider[] = [];
  private isPosthogInitialized = false;

  /**
   * Initializes PostHog and any other analytics providers.
   */
  initializePosthog() {
    if (this.isPosthogInitialized) {
      return;
    }

    ensurePosthogInit();

    if (isPosthogEnabled()) {
      this.registerProvider({
        identify: (userId, traits) => posthog.identify(userId, traits),
        track: (eventName, props) => posthog.capture(eventName, props),
        page: (name, props) => posthog.capture('$pageview', { name, ...props }),
        flush: async () => posthog.reset(),
        unregister: () => {
          posthog.stopSessionRecording();
          posthog.reset();
        },
      });
    }

    this.isPosthogInitialized = true;
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
    if (!isPosthogEnabled() || posthog._isIdentified?.()) {
      return;
    }

    try {
      posthog.identify(user.id, {
        email: user?.email,
        username: user?.username,
        org_id: organization?.id,
        org_name: organization?.name,
      });
    } catch (e) {
      this.logger.error('PostHog register failed', e);
    }
  }

  /**
   * Clear user and session data .
   */
  unregister() {
    for (const provider of this.providers) {
      provider.unregister?.();
    }
  }

  /**
   * Identify a user across all analytics systems.
   */
  identify(userId: string, traits?: Record<string, unknown>) {
    for (const provider of this.providers) {
      provider.identify?.(userId, traits);
    }
  }

  /**
   * Track a custom event.
   */
  track(event: AnalyticsEvent) {
    const {
      name,
      properties = {},
      userId = this.session.data.authenticated.user_id,
    } = event;

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
  page(name: string, properties?: Record<string, unknown>) {
    for (const provider of this.providers) {
      provider.page?.(name, properties);
    }
  }

  /**
   * Track an error event with normalized data.
   */
  trackError(error: unknown, context?: Record<string, unknown>) {
    const userId = this.session.data.authenticated.user_id;

    const properties = {
      userId,
      context,
      timestamp: new Date().toISOString(),
    };

    posthog.captureException(error, properties);
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
