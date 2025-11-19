import { service } from '@ember/service';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { tracked } from '@glimmer/tracking';

// @ts-expect-error no types
import DRFAdapter from 'ember-django-adapter/adapters/drf';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENV from 'irene/config/environment';
import RLM, { type RateLimitState } from 'irene/utils/rate-limit';

interface SessionService {
  data: {
    authenticated: {
      b64token: string;
    };
  };
  invalidate: () => Promise<void>;
}

const AuthenticationBase = (
  Superclass: typeof JSONAPIAdapter | typeof DRFAdapter
) =>
  class extends Superclass {
    declare session: SessionService;
    declare window: Window;
    declare notify: NotificationService;
    declare intl: IntlService;
    declare router: RouterService;
    declare rateLimitState: RateLimitState;

    // Bypass for upload app endpoint
    rateLimitBypassEndpoints = ['/upload_app'];

    get headers() {
      const data = this.session.data.authenticated;

      if (data?.b64token) {
        return {
          Authorization: `Basic ${data.b64token}`,
          'X-Product': ENV.product,
        };
      }

      return {
        'X-Product': ENV.product,
      };
    }

    triggerNotification(remainingTime: number) {
      this.notify
        .clearAll()
        .error(
          `Rate Limit has been exceeded. Refresh Page or Try again after ${remainingTime}s`,
          { autoClear: false }
        );
    }

    handleResponse(
      status: number,
      headers: object,
      payload: string | Record<string, unknown>,
      requestData: object = {}
    ) {
      if (status === 401) {
        // Safely extract message from payload
        const message =
          typeof payload === 'string'
            ? payload
            : (payload?.['detail'] ?? payload?.['message'] ?? '');

        // Check if message is a string before calling toLowerCase
        const messageStr =
          typeof message === 'string' ? message.toLowerCase() : '';

        const isInactive = messageStr.includes('inactive');
        const redirectParam = isInactive
          ? 'userInactive=true'
          : 'sessionExpired=true';

        this.window.location.replace(`/login?${redirectParam}`);
        this.session.invalidate();

        throw new Error('Authentication failed - redirecting to login');
      }

      // Handle rate limit error
      if (status !== 429) {
        if (RLM.shouldBypass(requestData, this.rateLimitBypassEndpoints)) {
          return super.handleResponse(status, headers, payload, requestData);
        }

        // Prevent race condition - check if already active before processing
        if (this.rateLimitState.isActive) {
          return {};
        }

        const newState = RLM.handleResponse(this, this.rateLimitState, {
          headers,
          requestData,
          config: {
            bypassEndpoints: this.rateLimitBypassEndpoints,
            updateIntervals: [55, 45, 35, 25, 15, 5],

            onUpdate: (state) => {
              this.rateLimitState = { ...state };
              this.triggerNotification(state.remainingTime);
            },

            onComplete: (state) => {
              this.rateLimitState = { ...state };

              this.notify.clearAll();
              this.window.location.reload();
            },
          },
        });

        if (newState) {
          this.rateLimitState = { ...newState };
        }

        return {};
      }

      return super.handleResponse(status, headers, payload, requestData);
    }

    willDestroy() {
      super.willDestroy?.();
      this.rateLimitState = RLM.clearCountdown(this, this.rateLimitState);
    }
  };

export class JSONAPIAuthenticationBase extends AuthenticationBase(
  JSONAPIAdapter
) {
  @service declare session: SessionService;
  @service('browser/window') declare window: Window;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @tracked rateLimitState: RateLimitState = RLM.createState();
}

export class DRFAuthenticationBase extends AuthenticationBase(DRFAdapter) {
  @service declare session: SessionService;
  @service('browser/window') declare window: Window;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @tracked rateLimitState: RateLimitState = RLM.createState();
}
