import Service, { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';

import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

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
  @service declare ajax: IreneAjaxService;
  @service declare session: any;
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('browser/window') declare window: Window;
  @service('notifications') declare notify: NotificationService;

  oidcTokenValidateEndpoint = '/api/v2/oidc/authorization/validate';
  oidcAuthorizationEndpoint = '/api/v2/oidc/authorization';
  oidcAuthorizeEndpoint = '/api/v2/oidc/authorization/authorize';

  checkForOidcTokenAndRedirect() {
    const oidc_token = this.window.sessionStorage.getItem('oidc_token');

    if (oidc_token) {
      const url = this.router.urlFor('oidc.redirect', {
        queryParams: { oidc_token },
      });

      this.window.location.href = url;
      this.window.sessionStorage.removeItem('oidc_token');

      return true;
    }

    return false;
  }

  authorizeOidcAppPermissions = task(async (token: string, allow?: boolean) => {
    try {
      const data = await this.ajax.post<OidcAuthorizeResult>(
        this.oidcAuthorizeEndpoint,
        {
          data: { oidc_token: token, allow },
        }
      );

      if (data.valid && data.redirect_url) {
        this.window.location.href = data.redirect_url;
      }
    } catch (e) {
      const err = e as AjaxError;

      if (err.payload.error) {
        if (err.payload.redirect_url) {
          this.window.location.href = err.payload.redirect_url;
        } else {
          this.notify.error(
            err.payload.error.description || this.intl.t('somethingWentWrong')
          );
        }

        return;
      }
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
    try {
      const data = await this.ajax.post<ValidateOidcTokenResponse>(
        this.oidcTokenValidateEndpoint,
        {
          data: { oidc_token: token },
        }
      );

      if (data.valid) {
        this.router.transitionTo('oidc.authorize', {
          queryParams: { oidc_token: token },
        });
      }
    } catch (e) {
      const err = e as AjaxError;

      if (err.status === 400 || err.payload.error) {
        if (err.payload.redirect_url) {
          this.window.location.href = err.payload.redirect_url;
          return;
        } else {
          throw {
            name: 'Error',
            statusCode: err.status,
            code: err.payload.error?.code,
            description: err.payload.error?.description,
          };
        }
      }
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
    try {
      const data = await this.ajax.post<OidcAuthorizationResponse>(
        this.oidcAuthorizationEndpoint,
        {
          data: { oidc_token: token },
        }
      );

      return data;
    } catch (error) {
      const err = error as AjaxError;

      if (err.status === 400 || err.payload.validation_result.error) {
        if (err.payload.validation_result.redirect_url) {
          this.window.location.href =
            err.payload.validation_result.redirect_url;
          return;
        } else {
          throw {
            name: 'Error',
            statusCode: err.status,
            code: err.payload.validation_result.error?.code,
            description: err.payload.validation_result.error?.description,
          };
        }
      }
    }
  });
}
