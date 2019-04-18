import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';

const isValidOTP = otp => otp && otp.length > 5;

export default Component.extend({

  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  me: service(),

  user: null,
  mfas: null,

  mfaEnabledStatus: {
    email: false,
    app: false,
  },

  showMFAEnableModal: false,
  showEmailSendConfirm: false,
  showEmailOTPEnter: false,
  showAppOTPEnter: false,
  showConfirmDisableMFA: false,
  isSendingEmail: false,
  isEnablingAppMFA: false,
  isEnablingEmailMFA: false,
  isDisablingMFA: false,
  isConfirmingDisableMFA: false,
  showDisableMFA: false,

  tEnterOTP: t('enterOTP'),
  tMFADisabled: t('mfaDisabled'),

  didInsertElement() {
    const provisioningURL = this.get('user.provisioningURL');
    // eslint-disable-next-line no-undef
    return new QRious({
      element: this.element.querySelector('canvas'),
      background: 'white',
      backgroundAlpha: 0.8,
      foreground: 'black',
      foregroundAlpha: 0.8,
      level: 'H',
      padding: 25,
      size: 300,
      value: provisioningURL
    });
  },

  mfaMethods: computed('mfas.[]', function() {
    return this.mfas.map(function(mfa) {
      mfa.set('isEmail', mfa.get('method') == ENUMS.MFA_METHOD.HOTP);
      mfa.set('isApp', mfa.get('method') == ENUMS.MFA_METHOD.TOTP);
      return mfa;
    });
  }),

  setEmailSendConfirm: task(function * () {
    this.set('showEmailSendConfirm', true);
    this.set('showEmailOTPEnter', false);
    yield this.set('showAppOTPEnter', false);
  }),
  setEmailOTPEnter: task(function * () {
    this.set('showEmailSendConfirm', false);
    this.set('showEmailOTPEnter', true);
    yield this.set('showAppOTPEnter', false);
  }),
  setAppOTPEnter: task(function * () {
    this.set('showEmailSendConfirm', false);
    this.set('showEmailOTPEnter', false);
    yield this.set('showAppOTPEnter', true);
  }),


  openMFAEnableModal: task(function * (method) {
    if (method == ENUMS.MFA_METHOD.TOTP) {
      this.get('setAppOTPEnter').perform();
    } else if (method == ENUMS.MFA_METHOD.HOTP) {
      this.get('setEmailSendConfirm').perform();
    }
    yield this.set('showMFAEnableModal', true);
  }),

  closeMFAEnableModal: task(function * () {
    yield this.set('showMFAEnableModal', false);
  }),


  sendOTPEmailMFA: task(function * () {
    this.get('notify').success('Sending mail...');
    // yield this.set('isSendingEmail', true);
    yield this.get('ajax').post(ENV.endpoints.mfaSendOTPMail);
  }).evented(),

  sendOTPEmailMFASucceeded: on('sendOTPEmailMFA:succeeded', function() {
    // this.set('isSendingEmail', false);
    this.get('setEmailOTPEnter').perform();
  }),

  sendOTPEmailMFAErrored: on('sendOTPEmailMFA:errored', function(_, err) {
    // this.set('isSendingEmail', false);

    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),


  updateMFA: task(function * (otp, method) {
    const data = {otp, method};
    yield this.get('ajax').post(ENV.endpoints.mfa, {data});
    return yield this.get('store').findAll('mfa');
  }),


  enableEmailMFA: task(function * () {
    yield this.set('isEnablingEmailMFA', true);
    const tEnterOTP = this.get('tEnterOTP');
    const emailOTP = this.get('emailOTP');
    for (let o of [emailOTP]) {
      if (!isValidOTP(o)) { return this.get('notify').error(tEnterOTP); }
    }
    yield this.get('updateMFA').perform(emailOTP, ENUMS.MFA_METHOD.HOTP);
  }).evented(),

  enableEmailMFASucceeded: on('enableEmailMFA:succeeded', function () {
    this.set('isEnablingEmailMFA', false);
    this.set('showMFAEnableModal', false);
    this.set('emailOTP', '');
    this.get('setAppOTPEnter').perform();
    this.get('notify').success('MFA method set to email');
  }),

  enableEmailMFAErrored: on('enableEmailMFA:errored', function(_, err) {
    this.set('isEnablingEmailMFA', false);

    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),


  enableAppMFA: task(function * () {
    yield this.set('isEnablingAppMFA', true);
    const tEnterOTP = this.get('tEnterOTP');
    const appOTP = this.get('appOTP');
    for (let o of [appOTP]) {
      if (!isValidOTP(o)) { return this.get('notify').error(tEnterOTP); }
    }
    yield this.get('updateMFA').perform(appOTP, ENUMS.MFA_METHOD.TOTP);
  }).evented(),

  enableAppMFASucceeded: on('enableAppMFA:succeeded', function () {
    this.set('isEnablingAppMFA', false);
    this.set('showMFAEnableModal', false);
    this.set('appOTP', '');
    this.get('setEmailSendConfirm').perform();
    this.get('notify').success('MFA method set to app');
  }),

  enableAppMFAErrored: on('enableAppMFA:errored', function(_, err) {
    this.set('isEnablingAppMFA', false);

    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),

  setConfirmDisableMFA: task(function * () {
    this.set('showConfirmDisableMFA', true);
    yield this.set('showDisableMFA', false);
  }),

  setDisableMFA: task(function * () {
    this.set('showConfirmDisableMFA', false);
    yield this.set('showDisableMFA', true);
  }),


  openMFADisableModal: task(function * (method) {
    if (method == ENUMS.MFA_METHOD.HOTP) {
      this.set('mfaEnabledStatus.email', true);
    } else if (method == ENUMS.MFA_METHOD.TOTP) {
      this.set('mfaEnabledStatus.app', true);
    }
    this.get('setConfirmDisableMFA').perform();
    yield this.set('showMFADisableModal', true);
  }),

  closeMFADisableModal: task(function * () {
    yield this.set('showMFADisableModal', false);
  }),

  confirmDisableMFA: task(function * () {
    yield this.set('isConfirmingDisableMFA', true);

    if (this.get('user.mfaMethod') === ENUMS.MFA_METHOD.HOTP) {
      yield this.get('ajax').post(ENV.endpoints.mfaSendOTPMail)
        .then(() => {
          this.get('notify').success('Sending mail...');
        }, (error) => {
          this.get('notify').error(error.payload.message);
        });
    }
  }).evented(),

  confirmDisableMFASucceeded: on('confirmDisableMFA:succeeded', function () {
    this.set('isConfirmingDisableMFA', false);
    this.get('setDisableMFA').perform();
  }),

  confirmDisableMFAErrored: on('confirmDisableMFA:errored', function(_, err) {
    this.set('isConfirmingDisableMFA', false);

    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),

  disableMFA: task(function * () {
    this.set('isDisablingMFA', true);
    const disableOTP = this.get('disableOTP');
    const tEnterOTP = this.get('tEnterOTP');

    for (let otp of [disableOTP]) {
      if (!isValidOTP(otp)) { return this.get('notify').error(tEnterOTP); }
    }
    let method = this.get('user.mfaMethod');
    if (this.get('mfaEnabledStatus.email')) {
      method = ENUMS.MFA_METHOD.HOTP;
    } else if (this.get('mfaEnabledStatus.app')) {
      method = ENUMS.MFA_METHOD.TOTP;
    }
    const data = {
      otp: disableOTP,
      method,
    };

    yield this.get('ajax').delete(ENV.endpoints.mfa, {data});
    yield this.get('store').findAll('mfa');
  }).evented(),

  disableMFASucceeded: on('disableMFA:succeeded', function () {
    const tMFADisabled = this.get('tMFADisabled');
    this.set('isDisablingMFA', false);
    this.set('showMFADisableModal', false);
    this.set('disableOTP', '');
    this.set('user.mfaEnabled', false);
    this.get('notify').success(tMFADisabled);
  }),

  disableMFAErrored: on('disableMFA:errored', function(_, err) {
    this.set('isDisablingMFA', false);

    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),

});
