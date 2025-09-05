import { inject as service } from '@ember/service';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from 'irene/config/environment';

// @ts-expect-error no types
import DRFAdapter from 'ember-django-adapter/adapters/drf';

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
      payload: any,
      requestData?: object
    ) {
      if (status === 401) {
        // Safely extract message from payload
        const message =
          typeof payload === 'string'
            ? payload
            : (payload?.detail ?? payload?.message ?? '');

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

      return super.handleResponse(status, headers, payload, requestData);
    }
  };

export class JSONAPIAuthenticationBase extends AuthenticationBase(
  JSONAPIAdapter
) {
  @service declare session: SessionService;
  @service('browser/window') declare window: Window;
}

export class DRFAuthenticationBase extends AuthenticationBase(DRFAdapter) {
  @service declare session: SessionService;
  @service('browser/window') declare window: Window;
}
