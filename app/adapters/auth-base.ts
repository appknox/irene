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
}

const AuthenticationBase = (
  Superclass: typeof JSONAPIAdapter | typeof DRFAdapter
) =>
  class extends Superclass {
    declare session: SessionService;

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
  };

export class JSONAPIAuthenticationBase extends AuthenticationBase(
  JSONAPIAdapter
) {
  @service declare session: SessionService;
}

export class DRFAuthenticationBase extends AuthenticationBase(DRFAdapter) {
  @service declare session: SessionService;
}
