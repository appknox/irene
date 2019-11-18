import Component from '@ember/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import ENV from 'irene/config/environment';
import { isUnauthorizedError } from 'ember-ajax/errors';
import { isEmpty } from '@ember/utils';
import { on } from '@ember/object/evented';
import { t } from 'ember-intl';

const LoginComponentComponent = Component.extend({
  session: service('session'),
  notify: service('notification-messages-service'),
  MFAEnabled: false,
  isLogingIn: false,
  identification: "",
  password: "",
  otp: "",
  isNotEnterprise: !ENV.isEnterprise,
  isRegistrationEnabled: ENV.isRegistrationEnabled,
  isSS0Enabled: null,
  isisSS0Enforced: null,
  tPleaseTryAgain: t("pleaseTryAgain"),
  tSomethingWentWrongContactSupport: t("somethingWentWrongContactSupport"),
  tPleaseEnterValidEmail: t("pleaseEnterValidEmail"),
  tPleaseEnterValidAccountDetail: t("pleaseEnterValidAccountDetail"),

  ssoNotverified: computed('isSS0Enabled', function(){
    return isEmpty(this.get('isSS0Enabled'))
  }),

  registrationLink: computed(function () {
    if (ENV.registrationLink) {
      return ENV.registrationLink;
    }
    try {
      var router = getOwner(this).lookup('router:main')
      var link = router.generate('register');
      return link;
    } catch (err) {
      return ENV.registrationLink;
    }
  }),

  hasRegistrationLink: computed('registrationLink', function () {
    return !!this.get('registrationLink');
  }),

  handleOTP(error) {
    if (!isUnauthorizedError(error)) {
      return false;
    }
    if (error.payload) {
      this.set("MFAEnabled", true)
      this.set("MFAIsEmail", error.payload.type == "HOTP")
      this.set("MFAForced", this.isTrue(error.payload.forced))
      return true;
    }
    return false;
  },

  isTrue(value) {
    if (value == undefined) {
      return false;
    }
    if (value.toLowerCase) {
      return value.toLowerCase() == "true"
    }
    return !!value
  },

  SSOAuthenticate: task(function*(){
    const url = `${ENV.endpoints.saml2}?token=${this.get('token')}&return_to=${window.location.origin}/saml2/redirect`;
    const data = yield this.get('ajax').request(url);
    yield window.location.href = data.url;
  }).evented(),

  SSOAuthenticateErrored: on('SSOAuthenticate:errored', function(_, err){
    const status = err.status
    this.set('token', null)
    this.set('isSS0Enabled', null);
    if (status===400 && (err.payload.token || err.payload.return_to)) {
      this.get('notify').error(this.get('tSomethingWentWrongContactSupport'), ENV.notifications);
      return;
    }
    this.get('notify').error(this.get('tPleaseTryAgain'));
  }),

  verifySSO: task(function *(){
    let identification = this.get('identification');
    if (!identification) {
      return yield this.get("notify").error(this.get('tPleaseEnterValidEmail'), ENV.notifications);
    }
    const data = yield this.get('ajax').post('sso/check',{
      namespace: ENV.namespace_v2,
      data: {
        username: identification
      }
    })
    yield this.set('isSS0Enabled', data.is_sso);
    yield this.set('isSS0Enforced', data.is_sso_enforced);
    yield this.set('token', data.token)
  }).evented(),

  verifySSOErrored: on('verifySSO:errored', function(){
    this.set('isSS0Enabled', null);
    this.set('isSS0Enforced', null);
  }),

  verifySSOSucceded: on('verifySSO:succeded', async function(){
    await this.get('redirectSaml').perform();
  }),

  actions: {
    authenticate() {
      let identification = this.get('identification');
      let password = this.get('password');
      const otp = this.get("otp");

      if (!identification || !password) {
        return this.get("notify").error(this.get('tPleaseEnterValidEmail'), ENV.notifications);
      }
      identification = identification.trim();
      password = password.trim();
      this.set("isLogingIn", true);

      this.get('session').authenticate("authenticator:irene", identification, password, otp)
        .then()
        .catch(error => {
          this.set("isLogingIn", false);
          if (this.handleOTP(error)) {
            return
          }
          if (error.payload && error.payload.message) {
            this.get("notify").error(error.payload.message, ENV.notifications);
            return
          }

          if (error.errors) {
            for (error of error.errors) {
              if (error.status === "0") {
                return this.get("notify").error("Unable to reach server. Please try after sometime", ENV.notifications);
              }
            }
          }
          this.get("notify").error(this.get('tPleaseEnterValidAccountDetail'), ENV.notifications);
        })
    },
    inputChange(){
      if (!this.get('ssoNotverified')) {
        this.set('isSS0Enabled', null);
      }
    }
  }
});

export default LoginComponentComponent;
