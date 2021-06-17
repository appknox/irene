import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'irene/config/environment';

export default class LoginComponent extends Component {
  @service router;
  @service intl;
  @service session;
  @service whitelabel;
  @service network;
  @service notifications;
  @service logger;
  @service registration;

  @tracked isCheckDone = false;
  checkToken = '';
  @tracked username = '';
  password = '';
  otp = '';
  @tracked isSSOEnabled = false;
  @tracked isSSOEnforced = false;

  @tracked MFAEnabled = false;
  @tracked MFAIsEmail = false;
  @tracked MFAForced = false;

  SSOCheckEndpoint = 'v2/sso/check';
  SSOAuthenticateEndpoint = 'sso/saml2';

  get origin() {
    return window.location.origin;
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

  @task(function* () {
    if (!this.username) {
      return yield this.notifications.error(
        this.intl.t('pleaseEnterValidEmail'),
        ENV.notifications
      );
    }
    try {
      const res = yield this.network.post(this.SSOCheckEndpoint, {
        username: this.username,
      });
      if (!res.ok) {
        const err = new Error(res.statusText);
        try {
          const error_payload = yield res.json();
          err.payload = error_payload;
        } catch {
          err.message = yield res.text();
        }
        throw err;
      }
      const data = yield res.json();
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
      yield this.notifications.error(
        this.intl.t('pleaseTryAgain'),
        ENV.notifications
      );
    }
  })
  verifySSOTask;

  @task(function* () {
    const username = this.username.trim();
    const password = this.password.trim();
    const otp = this.otp.trim();
    if (!username || !password) {
      return yield this.notifications.error(
        this.intl.t('pleaseEnterValidEmail'),
        ENV.notifications
      );
    }
    try {
      yield this.session.authenticate(
        'authenticator:irene',
        username,
        password,
        otp
      );
    } catch (error) {
      if (this.handleOTP(error)) {
        return;
      }
      if (error.payload && error.payload.message) {
        this.notifications.error(error.payload.message, ENV.notifications);
        return;
      }
      if (error.errors) {
        for (let errorObj of error.errors) {
          if (errorObj.status === '0') {
            return this.notifications.error(
              'Unable to reach server. Please try after sometime',
              ENV.notifications
            );
          }
        }
      }
      this.logger.error(error);
      this.notifications.error(
        this.intl.t('tPleaseEnterValidAccountDetail'),
        ENV.notifications
      );
    }
  })
  loginTask;

  @task(function* () {
    const return_to = this.samlRedirectURL;
    const token = this.checkToken;
    const endpoint = this.SSOAuthenticateEndpoint;
    const url = `${endpoint}?token=${token}&return_to=${return_to}`;
    const res = yield this.network.request(url);
    const data = yield res.json();
    if (!data.url) {
      this.logger.error('Invalid sso redirect call', data);
      return;
    }
    yield (window.location.href = data.url);
  })
  ssologinTask;

  handleOTP(error) {
    if (!error) {
      return false;
    }

    const otpinfo = error.payload || {};
    if (otpinfo.type != 'HOTP' && otpinfo.type != 'TOTP') {
      return false;
    }

    this.MFAEnabled = true;
    this.MFAIsEmail = otpinfo.type == 'HOTP';
    this.MFAForced = this.isTrue(otpinfo.forced);
    return true;
  }

  isTrue(value) {
    if (value && value.toLowerCase) {
      return value.toLowerCase() == 'true';
    }
    return !!value;
  }

  reset() {
    this.username = '';
    this.otp = '';
    this.password = '';
    this.isCheckDone = false;
    this.checkToken = '';
    this.isSSOEnabled = false;
    this.isSSOEnforced = false;
    this.MFAEnabled = false;
    this.MFAIsEmail = false;
    this.MFAForced = false;
  }

  @action
  verifySSO() {
    this.verifySSOTask.perform();
  }

  @action
  login() {
    this.loginTask.perform();
  }

  @action
  usernameChanged(event) {
    const username = event.target.value;
    this.reset();
    this.username = username;
  }

  @action
  ssologin() {
    this.ssologinTask.perform();
  }
}
