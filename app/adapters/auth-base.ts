import { service } from '@ember/service';
import DRFAdapter from 'ember-django-adapter/adapters/drf';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import type Transition from '@ember/routing/transition';

import ENV from 'irene/config/environment';
import RLM from 'irene/utils/rate-limit';
import type RateLimitService from 'irene/services/rate-limit';

export type RouteOrCallback = string | (() => void);

type InternalSessionMock<Data> = {
  isAuthenticated: boolean;
  data: Data;
  store: unknown;
  attemptedTransition: null;

  authenticate: (authenticator: string, ...args: unknown[]) => void;
  invalidate: (...args: unknown[]) => void;
  prohibitAuthentication: (routeOrCallback: RouteOrCallback) => boolean;
  restore: () => Promise<void>;

  requireAuthentication: (
    transition: Transition,
    routeOrCallback: RouteOrCallback
  ) => boolean;

  setup(): Promise<void>;
};

export type SessionService = InternalSessionMock<{
  authenticated: {
    b64token: string;
    authenticator: string;
    token: string;
    user_id: number;
  };
}>;

const AuthenticationBase = <
  T extends typeof JSONAPIAdapter | typeof DRFAdapter,
>(
  Superclass: T
): T =>
  class extends Superclass {
    declare session: SessionService;
    declare window: Window;
    declare rateLimit: RateLimitService;

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
      if (status === 429) {
        if (RLM.shouldBypass(requestData, this.rateLimit.bypassEndpoints)) {
          return super.handleResponse(status, headers, payload, requestData);
        }

        this.rateLimit.handleResponse(this, payload as object, requestData);

        // Return no request data or header to prevent same message
        // from being displayed in other parts of the application
        return super.handleResponse(429, {}, {}, {});
      }

      return super.handleResponse(status, headers, payload, requestData);
    }

    willDestroy() {
      super.willDestroy?.();
      this.rateLimit.clearCountdown(this);
    }
  };

export class JSONAPIAuthenticationBase extends AuthenticationBase<
  typeof JSONAPIAdapter
>(JSONAPIAdapter) {
  @service declare session: SessionService;
  @service('browser/window') declare window: Window;
  @service declare rateLimit: RateLimitService;
}

export class DRFAuthenticationBase extends AuthenticationBase<
  typeof DRFAdapter
>(DRFAdapter) {
  @service declare session: SessionService;
  @service('browser/window') declare window: Window;
  @service declare rateLimit: RateLimitService;
}
