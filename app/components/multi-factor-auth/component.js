import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { task, waitForEvent } from 'ember-concurrency';
import ENUMS from 'irene/enums';
import { t } from 'ember-intl';
import { debug } from '@ember/debug';

export default Component.extend({

  intl: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  me: service(),

  user: null,
  mfas: computed('store', function () {
    return this.get('store').findAll('mfa');
  }),
  isMFAEnabled: computed('mfas.@each.enabled', function () {
    return !!this.get('mfas').findBy('enabled', true);
  }),
  isEmailMFAEnabled: computed('mfas.@each.enabled', function () {
    const email = this.get('mfas').findBy('isEmail', true);
    if (email) {
      return email.get('enabled');
    }
    return false;
  }),
  isAppMFAEnabled: computed('mfas.@each.enabled', function () {
    const app = this.get('mfas').findBy('isApp', true);
    if (app) {
      return app.get('enabled');
    }
    return false;
  }),
  mfaEndpoint: '/v2/mfa',

  tEnterOTP: t('enterOTP'),
  tMFADisabled: t('mfaDisabled'),
  tInvalidOTP: t('invalidOTP'),
  tsomethingWentWrong: t('somethingWentWrong'),

  //------No MFA Enable Email start------
  showEmailEnableModal: false,
  closeEmailEnable: task(function* () {
    this.set('showEmailSendConfirm', false);
    this.set('showEmailOTPEnter', false);
    yield this.set('showEmailEnableModal', false);
  }),
  cancelEmailEnable: task(function* () {
    yield this.get('closeEmailEnable').perform();
    yield this.trigger('confirmSendEmail', {
      cancel: true
    });
    yield this.trigger('confirmEmailOTP', {
      cancel: true
    });
  }),
  noMFAEnableEmail: task(function* () {
    yield this.set('emailOTP', "");
    const confirmEmailSend = yield this.get('showConfirmEmailOTP').perform();
    if (confirmEmailSend.cancel) {
      return;
    }
    const tokenData = yield this.get('getMFAEnableEmailToken').perform();
    this.get('notify').success('OTP sent to ' + this.get('user.email'));
    while (true) {
      debug('noMFAEnableEmail: In side otp loop');
      let otpData = yield this.get('showEmailOTP').perform();
      if (otpData.cancel) {
        debug('noMFAEnableEmail: otp cancel called');
        return;
      }
      const confirmed = yield this.get('verifyEmailOTP').perform(
        otpData.otp,
        tokenData.token
      );
      if (confirmed) {
        yield this.get('closeEmailEnable').perform();
        return;
      }
    }
  }),
  getMFAEnableEmailToken: task(function* () {
    const mfaEndpoint = this.get('mfaEndpoint');
    return yield this.get('ajax').post(mfaEndpoint, {
      data: {
        method: ENUMS.MFA_METHOD.HOTP,
      }
    });
  }),
  verifyEmailOTP: task(function* (otp, token) {
    const mfaEndpoint = this.get('mfaEndpoint');
    try {
      yield this.get('ajax').post(mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.HOTP,
          otp: otp,
          token: token
        }
      });
    } catch (error) {
      const errorObj = error.payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];
      if (otpMsg) {
        this.get('notify').error(this.get('tInvalidOTP'));
        return false;
      }
      this.get('notify').error(this.get('tsomethingWentWrong'));
      return false;
    }
    return true;
  }),
  showConfirmEmailOTP: task(function* () {
    this.set('showEmailSendConfirm', true);
    this.set('showEmailOTPEnter', false);
    yield this.set('showEmailEnableModal', true);
    return yield waitForEvent(this, 'confirmSendEmail');
  }),

  showEmailOTP: task(function* () {
    this.set('showEmailSendConfirm', false);
    yield this.set('showEmailOTPEnter', true);
    return yield waitForEvent(this, 'confirmEmailOTP');
  }),
  sendEmailMFA: task(function* () {
    yield this.trigger('confirmSendEmail', {
      cancel: false
    });
  }),
  confirmEmailOTP: task(function* () {
    const emailOTP = yield this.get('emailOTP');
    yield this.trigger('confirmEmailOTP', {
      otp: emailOTP,
      cancel: false
    });
  }),
  //------No MFA Enable Email end------
  //------No MFA Enable App start------
  showAppEnableModal: false,
  showAppOTPModel: task(function* () {
    yield this.set('showAppEnableModal', true);
  }),
  cancelAppEnable: task(function* () {
    yield this.get('closeAppEnable').perform();
    yield this.trigger('confirmAppOTP', {
      cancel: true
    });
  }),
  closeAppEnable: task(function* () {
    yield this.set('showAppEnableModal', false);
  }),
  getAppOTP: task(function* () {
    return yield waitForEvent(this, 'confirmAppOTP');
  }),
  noMFAEnableApp: task(function* () {
    yield this.set('appOTP', "");
    try {
      const tokenData = yield this.get('getMFAEnableAppToken').perform();
      this.set('mfaAppSecret', tokenData.secret);
      this.get('showAppOTPModel').perform();
      while (true) {
        const otpData = yield this.get('getAppOTP').perform();
        if (otpData.cancel) {
          return;
        }
        const confirmed = yield this.get('verifyAppOTP').perform(
          otpData.otp, tokenData.token
        );
        if (confirmed) {
          yield this.get('closeAppEnable').perform();
          return;
        }
      }

    } catch (error) {
      this.get('closeAppEnable').perform();
      this.get('notify').error(this.get('tsomethingWentWrong'));
    }
  }),
  getMFAEnableAppToken: task(function* () {
    const mfaEndpoint = this.get('mfaEndpoint');
    return yield this.get('ajax').post(mfaEndpoint, {
      data: {
        method: ENUMS.MFA_METHOD.TOTP
      }
    });
  }),
  confirmAppOTP: task(function* () {
    const appOTP = this.get('appOTP');
    yield this.trigger('confirmAppOTP', {
      otp: appOTP,
      cancel: false
    });
  }),
  verifyAppOTP: task(function* (otp, token) {
    yield this.set('appOTP', "");
    const mfaEndpoint = this.get('mfaEndpoint');
    try {
      yield this.get('ajax').post(mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP,
          otp: otp || "",
          token: token
        }
      });
    } catch (error) {
      const errorObj = error.payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];
      if (otpMsg) {
        this.get('notify').error(this.get('tInvalidOTP'));
        return false;
      }
      this.get('notify').error(this.get('tsomethingWentWrong'));
      return false;
    }
    return true;
  }),
  //------No MFA Enable App end------
  //------Switch To Email MFA start------
  showSwitchToEmailModal: false,
  showSwitchToEmail: task(function* () {
    yield this.set('showSwitchToEmailModal', true);
    yield this.set('showSwitchToEmailConfirm', true);
    yield this.set('showSwitchTOEmailAppVerify', false);
    yield this.set('showSwitchTOEmailEmailVerify', false);
    this.set('appOTP', "");
    this.set('emailOTP', "");
  }),
  closeSwitchToEmail: task(function* () {
    yield this.set('showSwitchToEmailModal', false);
    yield this.set('showSwitchToEmailConfirm', false);
    yield this.set('showSwitchTOEmailAppVerify', false);
    yield this.set('showSwitchTOEmailEmailVerify', false);
    this.set('appOTP', "");
    this.set('emailOTP', "");
  }),
  cancelSwitchToEmail: task(function* () {
    yield this.get('closeSwitchToEmail').perform();
    yield this.trigger('confirmSwitchToEmail', {
      cancel: true
    })
    yield this.trigger('confirmSwitchToEmailAppOTP', {
      cancel: true
    });
    yield this.trigger('confirmSwitchToEmailEmailOTP', {
      cancel: true
    });
  }),
  confirmSwitchToEmail: task(function* () {
    yield this.get('showSwitchToEmail').perform();
    return yield waitForEvent(this, 'confirmSwitchToEmail');
  }),
  showSwitchToEmailVerifyApp: task(function* () {
    yield this.set('showSwitchToEmailConfirm', false);
    yield this.set('showSwitchTOEmailAppVerify', true);
    yield this.set('showSwitchTOEmailEmailVerify', false);
  }),
  showSwitchToEmailVerifyEmail: task(function* () {
    yield this.set('showSwitchToEmailConfirm', false);
    yield this.set('showSwitchTOEmailAppVerify', false);
    yield this.set('showSwitchTOEmailEmailVerify', true);
  }),
  confirmSwitchToEmailAppOTP: task(function* () {
    yield this.get('showSwitchToEmailVerifyApp').perform();
    return yield waitForEvent(this, 'confirmSwitchToEmailAppOTP');
  }),
  confirmSwitchToEmailEmailOTP: task(function* () {
    yield this.get('showSwitchToEmailVerifyEmail').perform();
    return yield waitForEvent(this, 'confirmSwitchToEmailEmailOTP');
  }),
  onConfirmSwitchToEmail: task(function* () {
    yield this.trigger('confirmSwitchToEmail', {
      cancel: false
    });
  }),
  onConfirmSwitchToEmailAppOTP: task(function* () {
    const appOTP = this.get('appOTP');
    yield this.trigger('confirmSwitchToEmailAppOTP', {
      otp: appOTP,
      cancel: false
    });
  }),
  onConfirmSwitchToEmailEmailOTP: task(function* () {
    const emailOTP = this.get('emailOTP');
    yield this.trigger('confirmSwitchToEmailEmailOTP', {
      otp: emailOTP,
      cancel: false
    });
  }),
  verifySwitchToEmailAppOTP: task(function* (otp) {
    const mfaEndpoint = this.get('mfaEndpoint');
    try {
      const tokenData = yield this.get('ajax').post(mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.HOTP,
          otp: otp || ""
        }
      });
      return tokenData;
    } catch (error) {
      const errorObj = error.payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];
      if (otpMsg) {
        this.get('notify').error(this.get('tInvalidOTP'));
        return;
      }
      this.get('notify').error(this.get('tsomethingWentWrong'));
    }
  }),
  verifySwitchToEmailEmailOTP: task(function* (otp, token) {
    yield this.set('emailOTP', "");
    const mfaEndpoint = this.get('mfaEndpoint');
    try {
      yield this.get('ajax').post(mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.HOTP,
          otp: otp || "",
          token: token
        }
      });
    } catch (error) {
      const errorObj = error.payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];
      if (otpMsg) {
        this.get('notify').error(this.get('tInvalidOTP'));
        return false;
      }
      this.get('notify').error(this.get('tsomethingWentWrong'));
      return false;
    }
    return true;
  }),
  switchToEmail: task(function* () {
    const confirmSwitch = yield this.get('confirmSwitchToEmail').perform();
    if (confirmSwitch.cancel) {
      return;
    }
    var appOTPNotConfirmed;
    var tokenData;
    do {
      debug('SwitchTOEmail: In App OTP Loop');
      const appOTPData = yield this.get('confirmSwitchToEmailAppOTP').perform();
      if (appOTPData.cancel) {
        return;
      }
      tokenData = yield this.get('verifySwitchToEmailAppOTP').perform(
        appOTPData.otp
      );
      appOTPNotConfirmed = !(tokenData || {}).token;
    } while (appOTPNotConfirmed);

    debug('SwitchTOEmail: App OTP Token Data ' + tokenData.token);

    while (true) {
      debug('SwitchTOEmail: In Email OTP Loop');
      const emailOTPData = yield this.get('confirmSwitchToEmailEmailOTP').perform();
      if (emailOTPData.cancel) {
        return;
      }
      const confirmed = yield this.get('verifySwitchToEmailEmailOTP').perform(
        emailOTPData.otp, tokenData.token
      );
      if (confirmed) {
        yield this.get('closeSwitchToEmail').perform();
        return;
      }
    }
  }),
  //------Switch To Email MFA end------
  //------Switch To App MFA start------
  staModalActive: false,
  staShow: task(function* () {
    yield this.set('staModalActive', true);
    yield this.set('staAppConfirmActive', true);
    yield this.set('staEmailVerifyActive', false);
    yield this.set('staAppVerifyActive', false);
    this.set('appOTP', "");
    this.set('emailOTP', "");
  }),
  staClose: task(function* () {
    yield this.set('staModalActive', false);
    yield this.set('staAppConfirmActive', false);
    yield this.set('staEmailVerifyActive', false);
    yield this.set('staAppVerifyActive', false);
    this.set('appOTP', "");
    this.set('emailOTP', "");
  }),
  staCancel: task(function* () {
    yield this.get('staClose').perform();
    yield this.trigger('staConfirm', {
      cancel: true
    })
    yield this.trigger('staConfirmEmailOTP', {
      cancel: true
    });
    yield this.trigger('staConfirmAppOTP', {
      cancel: true
    });
  }),
  staConfirm: task(function* () {
    yield this.get('staShow').perform();
    return yield waitForEvent(this, 'staConfirm');
  }),
  staShowVerifyEmail: task(function* () {
    yield this.set('staAppConfirmActive', false);
    yield this.set('staEmailVerifyActive', true);
    yield this.set('staAppVerifyActive', false);
  }),
  staShowVerifyApp: task(function* () {
    yield this.set('staAppConfirmActive', false);
    yield this.set('staEmailVerifyActive', false);
    yield this.set('staAppVerifyActive', true);
  }),
  staConfirmEmailOTP: task(function* () {
    yield this.get('staShowVerifyEmail').perform();
    return yield waitForEvent(this, 'staConfirmEmailOTP');
  }),
  staConfirmAppOTP: task(function* () {
    yield this.get('staShowVerifyApp').perform();
    return yield waitForEvent(this, 'staConfirmAppOTP');
  }),
  staOnConfirm: task(function* () {
    yield this.trigger('staConfirm', {
      cancel: false
    });
  }),
  staOnConfirmEmailOTP: task(function* () {
    const emailOTP = this.get('emailOTP');
    yield this.trigger('staConfirmEmailOTP', {
      otp: emailOTP,
      cancel: false
    });
  }),
  staOnConfirmAppOTP: task(function* () {
    const appOTP = this.get('appOTP');
    yield this.trigger('staConfirmAppOTP', {
      otp: appOTP,
      cancel: false
    });
  }),
  staInitialEmail: task(function* () {
    const mfaEndpoint = this.get('mfaEndpoint');
    try {
      yield this.get('ajax').post(mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP
        }
      });
    } catch (error) {
      const errorObj = error.payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];
      if (otpMsg) {
        return;
      }
      this.get('notify').error(this.get('tsomethingWentWrong'));
    }
  }),
  staVerifyEmailOTP: task(function* (otp) {
    yield this.set('emailOTP', "");
    const mfaEndpoint = this.get('mfaEndpoint');
    if (!otp) {
      this.get('notify').error(this.get('tEnterOTP'));
      return false;
    }
    try {
      const tokenData = yield this.get('ajax').post(mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP,
          otp: otp
        }
      });
      return tokenData;
    } catch (error) {
      const errorObj = error.payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];
      if (otpMsg) {
        this.get('notify').error(this.get('tInvalidOTP'));
        return;
      }
      this.get('notify').error(this.get('tsomethingWentWrong'));
    }
  }),
  staVerifyAppOTP: task(function* (otp, token) {
    yield this.set('appOTP', "");
    const mfaEndpoint = this.get('mfaEndpoint');
    if (!otp) {
      this.get('notify').error(this.get('tEnterOTP'));
      return false;
    }
    try {
      yield this.get('ajax').post(mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP,
          otp: otp,
          token: token
        }
      });
    } catch (error) {
      const errorObj = error.payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];
      if (otpMsg) {
        this.get('notify').error(this.get('tInvalidOTP'));
        return false;
      }
      this.get('notify').error(this.get('tsomethingWentWrong'));
      return false;
    }
    return true;
  }),
  sta: task(function* () {
    const confirmSwitch = yield this.get('staConfirm').perform();
    if (confirmSwitch.cancel) {
      return;
    }
    var emailOTPNotConfirmed;
    var tokenData;
    yield this.get('staInitialEmail').perform();
    do {
      debug('sta: In Email OTP Loop');
      const emailOTPData = yield this.get('staConfirmEmailOTP').perform();
      if (emailOTPData.cancel) {
        return;
      }
      tokenData = yield this.get('staVerifyEmailOTP').perform(
        emailOTPData.otp
      );
      emailOTPNotConfirmed = !(tokenData || {}).token;
    } while (emailOTPNotConfirmed);

    debug('sta: Email OTP Token Data ' + tokenData.token);

    this.set('mfaAppSecret', tokenData.secret);

    while (true) {
      debug('sta: In App OTP Loop');
      const appOTPData = yield this.get('staConfirmAppOTP').perform();
      if (appOTPData.cancel) {
        return;
      }
      const confirmed = yield this.get('staVerifyAppOTP').perform(
        appOTPData.otp, tokenData.token
      );
      if (confirmed) {
        yield this.get('staClose').perform();
        return;
      }
    }
  }),
  //------Switch To App MFA end------
  //------Disable MFA Start ------
  showMFADisableModal: false,
  showConfirmDisableMFA: false,
  showDisableMFA: false,
  showMFADisable: task(function* () {
    yield this.set('showMFADisableModal', true);
    yield this.set('showConfirmDisableMFA', true);
  }),
  closeMFADisable: task(function* () {
    yield this.set('showMFADisableModal', false);
    yield this.set('showDisableMFA', false);
    yield this.set('showConfirmDisableMFA', false);
  }),
  cancelMFADisable: task(function* () {
    yield this.get('closeMFADisable').perform();
    yield this.trigger('continueDisableMFA', {
      cancel: true
    })
    yield this.trigger('confirmDisableOTP', {
      cancel: true
    });
  }),
  showMFADisableOTP: task(function* () {
    yield this.set('showConfirmDisableMFA', false);
    yield this.set('showDisableMFA', true);
  }),
  continueDisableMFA: task(function* () {
    yield this.trigger('continueDisableMFA', {
      cancel: false
    });
  }),
  disableMFA: task(function* (method) {
    debug('MFA disable called');
    this.set('disableOTP', '');
    yield this.get('showMFADisable').perform();
    const shouldContinue = yield waitForEvent(this, 'continueDisableMFA');
    if (shouldContinue.cancel) {
      debug('MFA disable cancelled');
      return;
    }
    try {
      if (method == ENUMS.MFA_METHOD.HOTP) {
        yield this.get('sendDisableMFAOTPEmail').perform();
      }
      yield this.get('showMFADisableOTP').perform();
      while (true) {
        const otpData = yield this.get('getDisableOTP').perform();
        if (otpData.cancel) {
          return;
        }
        const confirmed = yield this.get('verifyDisableOTP').perform(
          otpData.otp,
          method
        );
        if (confirmed) {
          yield this.get('store').findAll('mfa');
          yield this.get('closeMFADisable').perform();
          return;
        }
      }
    } catch (error) {
      this.get('closeMFADisable').perform();
      this.get('notify').error(this.get('tsomethingWentWrong'));
    }

  }),
  sendDisableMFAOTPEmail: task(function* () {
    try {
      const data = {
        method: ENUMS.MFA_METHOD.HOTP
      };
      yield this.get('ajax').delete(this.get('mfaEndpoint'), { data });
    } catch (error) {
      const payload = error.payload || {};
      if (payload.otp && payload.otp.length) {
        return;
      }
      throw error;
    }
  }),
  verifyDisableOTP: task(function* (otp, method) {
    const data = {
      method: method,
      otp: otp,
    };
    try {
      yield this.get('ajax').delete(this.get('mfaEndpoint'), {
        data: data,
      });
    } catch (error) {
      const errorObj = error.payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];
      if (otpMsg) {
        this.get('notify').error(this.get('tInvalidOTP'));
        return false;
      }
      this.get('notify').error(this.get('tsomethingWentWrong'));
      return false;
    }
    return true;
  }),
  getDisableOTP: task(function* () {
    return yield waitForEvent(this, 'confirmDisableOTP');
  }),
  confirmDisableOTP: task(function* () {
    const disableOTP = this.get('disableOTP');
    yield this.trigger('confirmDisableOTP', {
      otp: disableOTP,
      cancel: false
    });
  }),
  //------Disable MFA End ------
  enableMFA: task(function* (method) {
    if (this.get('isMFAEnabled')) {
      switch (+method) {
        case ENUMS.MFA_METHOD.HOTP:
          yield this.get('switchToEmail').perform();
          break;
        case ENUMS.MFA_METHOD.TOTP:
          yield this.get('sta').perform();
          break;
        default:
          break;
      }
    } else {
      switch (+method) {
        case ENUMS.MFA_METHOD.HOTP:
          yield this.get('noMFAEnableEmail').perform();
          break;
        case ENUMS.MFA_METHOD.TOTP:
          yield this.get('noMFAEnableApp').perform();
          break;
        default:
          break;
      }
    }
    yield this.get('store').findAll('mfa');
  })
});
