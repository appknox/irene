import Service, { service } from '@ember/service';
import posthog from 'posthog-js';

import { ensurePosthogInit, isPosthogEnabled } from 'irene/utils/posthog';
import type { SessionService } from 'irene/adapters/auth-base';
import type OrganizationModel from 'irene/models/organization';
import type UserModel from 'irene/models/user';
import type LoggerService from 'irene/services/logger';

export type AnalyticsEvent = {
  name:
    | 'LOGIN_EVENT'
    | 'LOGOUT_EVENT'
    | 'PASSWORD_RESET_EVENT'
    | 'PASSWORD_CHANGE_EVENT'
    | 'FEATURE_REQUEST_EVENT'
    | 'RISK_OVERRIDE_EVENT'
    | 'REPORT_GENERATION_EVENT'
    | 'PROXY_SETTINGS_CHANGE_EVENT'
    | 'DYNAMIC_SCAN_START_EVENT'
    | 'API_SCAN_START_EVENT'
    | 'MANUAL_SCAN_REQUESTED_EVENT'
    | 'API_URL_FILTER_UPDATE_EVENT'
    | 'ORGANIZATION_INVITE_EVENT'
    | 'INTEGRATION_INITIATED_EVENT'
    | 'SERVICE_ACCOUNT_CREATE_EVENT'
    | 'ORGANIZATION_ARCHIVE_EVENT'
    | 'ORGANIZATION_NAMESPACE_EVENT'
    | 'ORG_SUBSCRIPTION_CANCEL_EVENT'
    | 'ORG_NAME_UPDATE_EVENT'
    | 'ORGANIZATION_TEAM_EVENT'
    | 'PROJECT_COLLABORATOR_EVENT'
    | 'PROJECT_TEAM_EVENT'
    | 'SSO_OIDC_EVENT'
    | 'SSO_SAML_EVENT'
    | 'UPLOAD_APP_EVENT'
    | 'FILE_REPORT_DOWNLOAD_EVENT'
    | 'CAPI_REPORT_DOWNLOAD_EVENT';

  properties?: Record<string, unknown>;
  userId?: number | null;
  context?: Record<string, unknown>;
  timestamp?: Date;
};

type AnalyticsProvider = {
  isEnabled?(): boolean;
  identify?(userId: string, traits?: Record<string, unknown>): void;
  track?(eventName: string, properties?: Record<string, unknown>): void;
  page?(name?: string, properties?: Record<string, unknown>): void;
  trackError?(error: unknown, context?: Record<string, unknown>): void;
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

  get authenticatedUserId() {
    return this.session.data.authenticated.user_id;
  }

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

        trackError: (error, context) =>
          posthog.captureException(error, context),

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
      try {
        provider.unregister?.();
      } catch (e) {
        this.logger.error('Analytics unregister failed', e);
      }
    }
  }

  /**
   * Identify a user across all analytics systems.
   */
  identify(userId: string, traits?: Record<string, unknown>) {
    for (const provider of this.providers) {
      try {
        provider.identify?.(userId, traits);
      } catch (e) {
        this.logger.error('Analytics identify failed', e);
      }
    }
  }

  /**
   * Track a custom event.
   */
  track(event: AnalyticsEvent) {
    const { name, properties = {}, userId = this.authenticatedUserId } = event;

    for (const provider of this.providers) {
      try {
        provider.track?.(name, {
          ...properties,
          userId,
          timestamp: event.timestamp ?? new Date().toISOString(),
          context: event.context,
        });
      } catch (e) {
        this.logger.error('Analytics event track failed', e);
      }
    }
  }

  /**
   * Track a page view or route transition.
   */
  page(name: string, properties?: Record<string, unknown>) {
    for (const provider of this.providers) {
      try {
        provider.page?.(name, properties);
      } catch (e) {
        this.logger.error('Analytics event page track failed', e);
      }
    }
  }

  /**
   * Track an error event with normalized data.
   */
  trackError(error: unknown, context?: Record<string, unknown>) {
    const properties = {
      userId: this.authenticatedUserId,
      context,
      timestamp: new Date().toISOString(),
    };

    for (const provider of this.providers) {
      try {
        provider.trackError?.(error, properties);
      } catch (e) {
        this.logger.error('Analytics error track failed', e);
      }
    }
  }

  /**
   * Flush any queued analytics data (if supported by provider).
   */
  async flush() {
    const results = await Promise.allSettled(
      this.providers.map((p) => p.flush?.() ?? Promise.resolve())
    );

    // Log failed flush attempts
    results.forEach((r) => {
      if (r.status === 'rejected') {
        this.logger.warn('Analytics flush failed', r.reason);
      }
    });
  }
}

declare module '@ember/service' {
  interface Registry {
    analytics: AnalyticsService;
  }
}
