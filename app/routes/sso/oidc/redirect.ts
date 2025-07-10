import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import ENV from 'irene/config/environment';
import config from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';

// Helper function to create b64token (same as in base authenticator)
const b64EncodeUnicode = (str: string) =>
  btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1: string) => {
      return String.fromCharCode(Number(`0x${p1}`));
    })
  );

const getB64Token = (userId: number, token: string) =>
  b64EncodeUnicode(`${userId}:${token}`);

interface OidcSsoCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

interface OidcSsoCallbackResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  provider: string;
  token: string;
}

export default class SsoOidcRedirectRoute extends Route {
  @service declare session: any;
  @service declare router: RouterService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  title = `OIDC SSO Redirect${config.platform}`;

  queryParams = {
    code: {
      refreshModel: true,
    },
    state: {
      refreshModel: true,
    },
    error: {
      refreshModel: true,
    },
    error_description: {
      refreshModel: true,
    },
  };

  async model(params: OidcSsoCallbackParams) {
    // Handle OIDC errors
    if (params.error) {
      // Clean up session storage on error
      this.window.sessionStorage.removeItem('oidc_provider');
      this.router.transitionTo('login');
      this.notify.error(
        params.error_description || params.error,
        ENV.notifications
      );
      return;
    }

    // Handle missing authorization code
    if (!params.code) {
      // Clean up session storage on error
      this.window.sessionStorage.removeItem('oidc_provider');
      this.router.transitionTo('login');
      this.notify.error('Authorization code is missing', ENV.notifications);
      return;
    }

    try {
      // Get provider_name from session storage
      const providerName = this.window.sessionStorage.getItem('oidc_provider');

      if (!providerName) {
        // Clean up session storage if provider not found
        this.window.sessionStorage.removeItem('oidc_provider');
        this.router.transitionTo('login');
        this.notify.error('OIDC provider not found', ENV.notifications);
        return;
      }

      // Make API request to backend callback endpoint
      const response = await this.ajax.post<OidcSsoCallbackResponse>(
        '/api/v2/sso/oidc/auth/callback/',
        {
          data: {
            code: params.code,
            state: params.state,
            provider_name: providerName,
          },
        }
      );

      // Directly save the token data like the login API does
      const authData = {
        user_id: response.user.id,
        token: response.token,
        b64token: getB64Token(response.user.id, response.token)
      };

      // Store the authentication data in the session
      await this.session.authenticate('authenticator:login', authData);

      // Clean up session storage
      this.window.sessionStorage.removeItem('oidc_provider');

      // Redirect to home dashboard
      this.router.transitionTo('authenticated.index');

    } catch (error) {
      // Clean up session storage on error
      this.window.sessionStorage.removeItem('oidc_provider');
      this.router.transitionTo('login');
      this.notify.error('OIDC authentication failed', ENV.notifications);
    }
  }
}
