import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import RouterService from '@ember/routing/router-service';
import IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import WhitelabelService from 'irene/services/whitelabel';
import RegistrationService from 'irene/services/registration';
import type IreneAjaxService from 'irene/services/ajax';

type OtpError = { payload: { type: string; forced: string } };

type SSOCheckData = {
  is_sso: boolean;
  is_sso_enforced: boolean;
  token: string;
};

type SSOSaml2Data = {
  url: string;
};

export default class UserLoginComponent extends Component {
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare session: any;
  @service declare whitelabel: WhitelabelService;
  @service declare ajax: IreneAjaxService;
  @service declare notifications: NotificationService;
  @service declare logger: any;
  @service declare registration: RegistrationService;
  @service('browser/window') declare window: Window;

  @tracked isCheckDone = false;
  checkToken = '';

  @tracked username = '';
  @tracked password = '';

  @tracked isSSOEnabled = false;
  @tracked isSSOEnforced = false;

  @tracked MFAEnabled = false;
  @tracked MFAIsEmail = false;
  @tracked MFAIsAuthApp = false;
  @tracked MFAForced = false;

  @tracked showCredError = false;
  @tracked showAccountLockError = false;

  SSOCheckEndpoint = 'v2/sso/check';
  SSOAuthenticateEndpoint = 'sso/saml2';

  get origin() {
    return this.window.location.origin;
  }

  get samlRedirectURL() {
    const origin = this.origin;
    const redirectURL = this.router.urlFor('saml2.redirect');

    return `${origin}${redirectURL}`;
  }

  get showRegistrationLink() {
    return this.registration.shouldShowInLogin();
  }

  get registrationLink() {
    return this.registration.link;
  }

  verifySSOTask = task(async () => {
    try {
      const data = await this.ajax.post<SSOCheckData>(this.SSOCheckEndpoint, {
        data: {
          username: this.username,
        },
      });

      this.isSSOEnabled = data.is_sso == true;
      this.isSSOEnforced = data.is_sso_enforced == true;
      this.checkToken = data.token;
      this.isCheckDone = true;
    } catch (error) {
      this.logger.error(error);

      this.checkToken = '';
      this.isCheckDone = false;
      this.isSSOEnabled = false;
      this.isSSOEnforced = false;

      this.notifications.error(
        this.intl.t('pleaseTryAgain'),
        ENV.notifications
      );
    }
  });

  loginTask = task(async (otp?: string) => {
    const username = this.username.trim();
    const password = this.password.trim();

    try {
      await this.session.authenticate(
        'authenticator:irene',
        username,
        password,
        otp
      );
    } catch (error) {
      if (this.handleOTP(error as OtpError)) {
        return;
      }

      const err = error as AdapterError;

      if (err.payload && err.payload.message) {
        if (
          err.payload.message == 'Unable to log in with provided credentials.'
        ) {
          this.showCredError = true;

          return;
        }

        if (err.payload.message == 'Account Locked Out') {
          this.showCredError = false;
          this.showAccountLockError = true;

          return;
        }

        this.notifications.error(err.payload.message, ENV.notifications);

        return;
      }

      if (err.errors) {
        for (const errorObj of err.errors) {
          if (errorObj.status === '0') {
            return this.notifications.error(
              'Unable to reach server. Please try after sometime',
              ENV.notifications
            );
          }
        }
      }

      this.logger.error(err);

      this.notifications.error(
        this.intl.t('pleaseEnterValidAccountDetail'),
        ENV.notifications
      );
    }
  });

  ssologinTask = task(async () => {
    const return_to = this.samlRedirectURL;
    const token = this.checkToken;
    const endpoint = this.SSOAuthenticateEndpoint;
    const url = `${endpoint}?token=${token}&return_to=${return_to}`;

    const data = await this.ajax.request<SSOSaml2Data>(url);

    if (!data.url) {
      this.logger.error('Invalid sso redirect call', data);

      return;
    }

    this.window.location.href = data.url;
  });

  handleOTP(error: OtpError) {
    if (!error) {
      return false;
    }

    const otpinfo = error.payload || {};

    if (otpinfo.type != 'HOTP' && otpinfo.type != 'TOTP') {
      return false;
    }

    this.MFAEnabled = true;
    this.showCredError = false;
    this.MFAIsEmail = otpinfo.type === 'HOTP';
    this.MFAIsAuthApp = otpinfo.type === 'TOTP';
    this.MFAForced = this.isTrue(otpinfo.forced);

    return true;
  }

  isTrue(value: string | undefined) {
    if (value && value.toLowerCase) {
      return value.toLowerCase() == 'true';
    }

    return !!value;
  }

  reset() {
    this.username = '';
    this.password = '';
    this.isCheckDone = false;
    this.checkToken = '';
    this.isSSOEnabled = false;
    this.isSSOEnforced = false;
    this.MFAEnabled = false;
    this.MFAIsEmail = false;
    this.MFAForced = false;
    this.MFAIsAuthApp = false;
    this.showCredError = false;
    this.showAccountLockError = false;
  }

  @action
  verifySSO() {
    this.verifySSOTask.perform();
  }

  @action
  login(otp?: string) {
    this.loginTask.perform(otp);
  }

  @action
  usernameChanged(event: Event) {
    const username = (event.target as HTMLInputElement).value;

    if (username !== this.username) {
      this.reset();

      this.username = username;
    }
  }

  @action
  ssologin() {
    this.ssologinTask.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    UserLogin: typeof UserLoginComponent;
  }
}
