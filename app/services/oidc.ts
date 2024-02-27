import Service, { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';

import NetworkService from 'irene/services/network';

interface OidcResponse {
  valid: boolean;
  redirect_url: null | string;
  error: null | {
    code: string;
    description: string;
  };
}

type ValidateOidcTokenResponse = OidcResponse;

type OidcAuthorizeResult = OidcResponse;

type OidcValidationResult = OidcResponse;

interface OidcAuthorizationFormData {
  application_name: string;
  scopes_descriptions: string[];
  authorization_needed: boolean;
}

export interface OidcAuthorizationResponse {
  form_data: OidcAuthorizationFormData | null;
  validation_result: OidcValidationResult;
}

export default class OidcService extends Service {
  @service declare network: NetworkService;
  @service declare session: any;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('browser/window') declare window: Window;
  @service('notifications') declare notify: NotificationService;

  oidcTokenValidateEndpoint = '/api/v2/oidc/authorization/validate';
  oidcAuthorizationEndpoint = '/api/v2/oidc/authorization';
  oidcAuthorizeEndpoint = '/api/v2/oidc/authorization/authorize';

  checkForOidcTokenAndRedirect() {
    if (this.session.isAuthenticated) {
      const oidc_token = this.window.sessionStorage.getItem('oidc_token');

      if (oidc_token) {
        this.router.transitionTo('oidc.redirect', {
          queryParams: {
            oidc_token,
          },
        });

        this.window.sessionStorage.removeItem('oidc_token');
      }
    }
  }

  authorizeOidcAppPermissions = task(async (token: string, allow?: boolean) => {
    const res = await this.network.post(this.oidcAuthorizeEndpoint, {
      oidc_token: token,
      allow,
    });

    const data = (await res.json()) as OidcAuthorizeResult;

    if (data.error) {
      if (data.redirect_url) {
        this.window.location.href = data.redirect_url;
      } else {
        this.notify.error(
          data.error.description || this.intl.t('somethingWentWrong')
        );
      }

      return;
    }

    if (data.valid && data.redirect_url) {
      this.window.location.href = data.redirect_url;
    }
  });

  async validateOidcTokenOrRedirect(token: string) {
    if (this.session.isAuthenticated) {
      await this.validateOidcToken.perform(token);
    } else {
      this.router.transitionTo('login');

      this.window.sessionStorage.setItem('oidc_token', token);
    }
  }

  validateOidcToken = task(async (token: string) => {
    const res = await this.network.post(this.oidcTokenValidateEndpoint, {
      oidc_token: token,
    });

    const data = (await res.json()) as ValidateOidcTokenResponse;

    if (res.status === 400 || data.error) {
      if (data.redirect_url) {
        this.window.location.href = data.redirect_url;

        return;
      } else {
        throw {
          name: 'Error',
          statusCode: res.status,
          code: data.error?.code,
          description: data.error?.description,
        };
      }
    }

    if (data.valid) {
      this.router.transitionTo('oidc.authorize', {
        queryParams: {
          oidc_token: token,
        },
      });
    }
  });

  async fetchOidcAuthorizationDataOrRedirect(token: string) {
    if (this.session.isAuthenticated) {
      return {
        token: token,
        data: await this.fetchOidcAuthorizationData.perform(token),
      };
    } else {
      this.router.transitionTo('login');

      this.window.sessionStorage.setItem('oidc_token', token);
    }
  }

  fetchOidcAuthorizationData = task(async (token: string) => {
    const res = await this.network.post(this.oidcAuthorizationEndpoint, {
      oidc_token: token,
    });

    const data = (await res.json()) as OidcAuthorizationResponse;

    if (res.status === 400 || data.validation_result.error) {
      if (data.validation_result.redirect_url) {
        this.window.location.href = data.validation_result.redirect_url;

        return;
      } else {
        throw {
          name: 'Error',
          statusCode: res.status,
          code: data.validation_result.error?.code,
          description: data.validation_result.error?.description,
        };
      }
    }

    return data;
  });
}
