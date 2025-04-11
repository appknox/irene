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
        // Session is invalid, logout and redirect to login
        this.session.invalidate();
        this.window.location.replace('/login?sessionExpired=true');
        return;
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
