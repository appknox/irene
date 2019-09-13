import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { task, waitForEvent } from 'ember-concurrency';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';

export default Component.extend({

  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  me: service(),

  user: null,
  mfas: computed(function () {
    return this.get('store').findAll('mfa');
  }),
  mfaEnabledStatus: {
    email: false,
    app: false,
  },
  mfaEndpoint: '/v2/mfa',

  tEnterOTP: t('enterOTP'),
  tMFADisabled: t('mfaDisabled'),
  tInvalidOTP: t('invalidOTP'),
  tsomethingWentWrong: t('somethingWentWrong'),

  didInsertElement() {
    window.test = this;
  },

  //------No MFA Enable Email start------
  showEmailEnableModal: false,
  closeEmailEnable: task(function* () {
    this.set('showEmailSendConfirm', false);
    this.set('showEmailOTPEnter', false);
    yield this.set('showEmailEnableModal', false)
  }),
  cancelEmailEnable: task(function* () {
    yield this.get('closeEmailEnable').perform();
    yield this.trigger('confirmSendEmail', {
      cancel: true
    });
  }),
  noMFAEnableEmail: task(function* () {
    const confirmEmailSend = yield this.get('showConfirmEmailOTP').perform()
    if (confirmEmailSend.cancel) {
      return;
    }
    const tokenData = yield this.get('getMFAEnableEmailToken').perform();
    this.get('notify').success('OTP sent to ' + this.get('user.email'));
    while (true) {
      let otpData = yield this.get('showEmailOTP').perform();
      if (otpData.cancel) {
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
      const errorObj = error.payload || {}
      const otpMsg = errorObj.otp && errorObj.otp[0];
      if (otpMsg) {
        this.get('notify').error(this.get('tInvalidOTP'));
        return false;
      }
      this.get('notify').error(this.get('tsomethingWentWrong'));
      return false;
    }
    return true
  }),
  showConfirmEmailOTP: task(function* () {
    this.set('showEmailSendConfirm', true);
    this.set('showEmailOTPEnter', false);
    yield this.set('showEmailEnableModal', true)
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
    })
  }),
  //------No MFA Enable Email end------
  //------No MFA Enable App start------
  showAppEnableModal: false,
  showAppOTPModel: task(function* () {
    yield this.set('showAppEnableModal', true)
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
    try {
      const tokenData = yield this.get('getMFAEnableAppToken').perform();
      this.get('showAppOTPModel').perform();
      // eslint-disable-next-line no-undef
      new QRious({
        element: this.element.querySelector('canvas.nomfatotp'),
        background: 'white',
        backgroundAlpha: 0.8,
        foreground: 'black',
        foregroundAlpha: 0.8,
        level: 'H',
        padding: 25,
        size: 300,
        value: getQRURL(this.get('user.email'), tokenData.secret)
      });
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
    const mfaEndpoint = this.get('mfaEndpoint');
    try {
      yield this.get('ajax').post(mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP,
          otp: otp,
          token: token
        }
      });
    } catch (error) {
      const errorObj = error.payload || {}
      const otpMsg = errorObj.otp && errorObj.otp[0];
      if (otpMsg) {
        this.get('notify').error(this.get('tInvalidOTP'));
        return false;
      }
      this.get('notify').error(this.get('tsomethingWentWrong'));
      return false;
    }
    return true
  }),
  //------No MFA Enable App start------
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
    yield this.get('showMFADisable').perform()
    const shouldContinue = yield waitForEvent(this, 'continueDisableMFA');
    if (shouldContinue.cancel) {
      return;
    }
    try {
      if (method == ENUMS.MFA_METHOD.HOTP) {
        yield this.get('sendDisableMFAOTPEmail').perform()
      }
      yield this.get('showMFADisableOTP').perform()
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
        return
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
      const errorObj = error.payload || {}
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
    })
  }),
  //------Disable MFA End ------
  enableMFA: task(function* (method) {
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
    yield this.get('store').findAll('mfa');
  })
});

function getQRURL(email, mfaSecret) {
  return `otpauth://totp/Appknox:${email}?secret=${mfaSecret}&issuer=Appknox`;
}
