/* eslint-disable ember/no-computed-properties-in-native-classes, ember/no-classic-components, no-constant-condition */
import Component from '@ember/component';
import Evented from '@ember/object/evented';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';
import { task, waitForEvent } from 'ember-concurrency';
import { findAll } from 'ember-data-resources';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';

import { debug } from '@ember/debug';

import ENUMS from 'irene/enums';
import MeService from 'irene/services/me';
import MfaModel from 'irene/models/mfa';
import UserModel from 'irene/models/user';

type MfaConfirmEventData = { cancel: boolean; otp?: string };

export default class AccountSettingsSecurityMultiFactorAuthComponent extends Component.extend(
  Evented
) {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service declare me: MeService;
  @service declare store: Store;

  @tracked showEmailEnableModal = false;
  @tracked showEmailSendConfirm = false;
  @tracked showEmailOTPEnter = false;
  @tracked emailOTP = '';

  @tracked showAppEnableModal = false;
  @tracked appOTP = '';
  @tracked mfaAppSecret = '';

  @tracked showSwitchToEmailModal = false;
  @tracked showSwitchToEmailConfirm = false;
  @tracked showSwitchTOEmailAppVerify = false;
  @tracked showSwitchTOEmailEmailVerify = false;

  @tracked staModalActive = false;
  @tracked staAppConfirmActive = false;
  @tracked staEmailVerifyActive = false;
  @tracked staAppVerifyActive = false;

  @tracked showMFADisableModal = false;
  @tracked showConfirmDisableMFA = false;
  @tracked showDisableMFA = false;
  @tracked disableOTP = '';

  user: UserModel | null = null;
  mfaEndpoint = '/v2/mfa';

  mfas = findAll<MfaModel>(this, 'mfa');

  tEnterOTP: string;
  tMFADisabled: string;
  tInvalidOTP: string;
  tsomethingWentWrong: string;

  constructor(owner: object) {
    super(owner);

    this.tEnterOTP = this.intl.t('enterOTP');
    this.tMFADisabled = this.intl.t('mfaDisabled');
    this.tInvalidOTP = this.intl.t('invalidOTP');
    this.tsomethingWentWrong = this.intl.t('somethingWentWrong');
  }

  @computed('mfas.records.@each.enabled')
  get isMFAEnabled() {
    return !!this.mfas.records?.findBy('enabled', true);
  }

  @computed('mfas.records.@each.enabled')
  get isEmailMFAEnabled() {
    const emailMFA = this.mfas.records?.findBy('isEmail', true);

    return emailMFA?.enabled ?? false;
  }

  @computed('mfas.records.@each.enabled')
  get isAppMFAEnabled() {
    const appMFA = this.mfas.records?.findBy('isApp', true);

    return appMFA?.enabled ?? false;
  }

  //------No MFA Enable Email start------

  @action
  closeEmailEnable() {
    this.showEmailSendConfirm = false;
    this.showEmailOTPEnter = false;
    this.showEmailEnableModal = false;
  }

  @action
  cancelEmailEnable() {
    this.closeEmailEnable();

    this.trigger('confirmSendEmail', {
      cancel: true,
    });

    this.trigger('confirmEmailOTP', {
      cancel: true,
    });
  }

  noMFAEnableEmail = task(async () => {
    this.emailOTP = '';

    const confirmEmailSend = await this.showConfirmEmailOTP.perform();

    if (confirmEmailSend.cancel) {
      return;
    }

    const tokenData = await this.getMFAEnableEmailToken.perform();

    this.notify.success('OTP sent to ' + this.user?.email);

    while (true) {
      debug('noMFAEnableEmail: In side otp loop');

      const otpData = await this.showEmailOTP.perform();

      if (otpData.cancel) {
        debug('noMFAEnableEmail: otp cancel called');

        return;
      }

      const confirmed = await this.verifyEmailOTP.perform(
        otpData.otp,
        tokenData.token
      );

      if (confirmed) {
        this.closeEmailEnable();
        return;
      }
    }
  });

  getMFAEnableEmailToken = task(async () => {
    return await this.ajax.post(this.mfaEndpoint, {
      data: {
        method: ENUMS.MFA_METHOD.HOTP,
      },
    });
  });

  verifyEmailOTP = task(async (otp, token) => {
    try {
      await this.ajax.post(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.HOTP,
          otp: otp,
          token: token,
        },
      });

      return true;
    } catch (error) {
      const errorObj = (error as AdapterError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];

      if (otpMsg) {
        this.notify.error(this.tInvalidOTP);
      } else {
        this.notify.error(this.tsomethingWentWrong);
      }
    }

    return false;
  });

  showConfirmEmailOTP = task(async () => {
    this.showEmailSendConfirm = true;
    this.showEmailOTPEnter = false;
    this.showEmailEnableModal = true;

    return (await (waitForEvent(
      this,
      'confirmSendEmail'
    ) as unknown)) as MfaConfirmEventData;
  });

  showEmailOTP = task(async () => {
    this.showEmailSendConfirm = false;
    this.showEmailOTPEnter = true;

    return (await (waitForEvent(
      this,
      'confirmEmailOTP'
    ) as unknown)) as MfaConfirmEventData;
  });

  @action
  sendEmailMFA() {
    this.trigger('confirmSendEmail', {
      cancel: false,
    });
  }

  @action
  confirmEmailOTP() {
    this.trigger('confirmEmailOTP', {
      otp: this.emailOTP,
      cancel: false,
    });
  }

  //------No MFA Enable Email end------

  //------No MFA Enable App start------
  @action
  showAppOTPModel() {
    this.showAppEnableModal = true;
  }

  @action
  cancelAppEnable() {
    this.closeAppEnable();

    this.trigger('confirmAppOTP', {
      cancel: true,
    });
  }

  @action
  closeAppEnable() {
    this.showAppEnableModal = false;
  }

  getAppOTP = task(async () => {
    return (await (waitForEvent(
      this,
      'confirmAppOTP'
    ) as unknown)) as MfaConfirmEventData;
  });

  noMFAEnableApp = task(async () => {
    this.appOTP = '';

    try {
      const tokenData = await this.getMFAEnableAppToken.perform();

      this.mfaAppSecret = tokenData.secret;

      this.showAppOTPModel();

      while (true) {
        const otpData = await this.getAppOTP.perform();

        if (otpData.cancel) {
          return;
        }

        const confirmed = await this.verifyAppOTP.perform(
          otpData.otp,
          tokenData.token
        );

        if (confirmed) {
          this.closeAppEnable();

          return;
        }
      }
    } catch (error) {
      this.closeAppEnable();

      this.notify.error(this.tsomethingWentWrong);
    }
  });

  getMFAEnableAppToken = task(async () => {
    return await this.ajax.post(this.mfaEndpoint, {
      data: {
        method: ENUMS.MFA_METHOD.TOTP,
      },
    });
  });

  @action
  confirmAppOTP() {
    this.trigger('confirmAppOTP', {
      otp: this.appOTP,
      cancel: false,
    });
  }

  verifyAppOTP = task(async (otp, token) => {
    this.appOTP = '';

    try {
      await this.ajax.post(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP,
          otp: otp || '',
          token: token,
        },
      });

      return true;
    } catch (error) {
      const errorObj = (error as AdapterError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];

      if (otpMsg) {
        this.notify.error(this.tInvalidOTP);
      } else {
        this.notify.error(this.tsomethingWentWrong);
      }
    }

    return false;
  });
  //------No MFA Enable App end------

  //------Switch To Email MFA start------
  @action
  showSwitchToEmail() {
    this.showSwitchToEmailModal = true;
    this.showSwitchToEmailConfirm = true;
    this.showSwitchTOEmailAppVerify = false;
    this.showSwitchTOEmailEmailVerify = false;
    this.appOTP = '';
    this.emailOTP = '';
  }

  closeSwitchToEmail() {
    this.showSwitchToEmailModal = false;
    this.showSwitchToEmailConfirm = false;
    this.showSwitchTOEmailAppVerify = false;
    this.showSwitchTOEmailEmailVerify = false;
    this.appOTP = '';
    this.emailOTP = '';
  }

  @action
  cancelSwitchToEmail() {
    this.closeSwitchToEmail();

    this.trigger('confirmSwitchToEmail', {
      cancel: true,
    });

    this.trigger('confirmSwitchToEmailAppOTP', {
      cancel: true,
    });

    this.trigger('confirmSwitchToEmailEmailOTP', {
      cancel: true,
    });
  }

  confirmSwitchToEmail = task(async () => {
    this.showSwitchToEmail();

    return (await (waitForEvent(
      this,
      'confirmSwitchToEmail'
    ) as unknown)) as MfaConfirmEventData;
  });

  @action
  showSwitchToEmailVerifyApp() {
    this.showSwitchToEmailConfirm = false;
    this.showSwitchTOEmailAppVerify = true;
    this.showSwitchTOEmailEmailVerify = false;
  }

  @action
  showSwitchToEmailVerifyEmail() {
    this.showSwitchToEmailConfirm = false;
    this.showSwitchTOEmailAppVerify = false;
    this.showSwitchTOEmailEmailVerify = true;
  }

  confirmSwitchToEmailAppOTP = task(async () => {
    this.showSwitchToEmailVerifyApp();

    return (await (waitForEvent(
      this,
      'confirmSwitchToEmailAppOTP'
    ) as unknown)) as MfaConfirmEventData;
  });

  confirmSwitchToEmailEmailOTP = task(async () => {
    this.showSwitchToEmailVerifyEmail();

    return (await (waitForEvent(
      this,
      'confirmSwitchToEmailEmailOTP'
    ) as unknown)) as MfaConfirmEventData;
  });

  @action
  onConfirmSwitchToEmail() {
    this.trigger('confirmSwitchToEmail', {
      cancel: false,
    });
  }

  @action
  onConfirmSwitchToEmailAppOTP() {
    this.trigger('confirmSwitchToEmailAppOTP', {
      otp: this.appOTP,
      cancel: false,
    });
  }

  @action
  onConfirmSwitchToEmailEmailOTP() {
    this.trigger('confirmSwitchToEmailEmailOTP', {
      otp: this.emailOTP,
      cancel: false,
    });
  }

  verifySwitchToEmailAppOTP = task(async (otp) => {
    try {
      return await this.ajax.post(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.HOTP,
          otp: otp || '',
        },
      });
    } catch (error) {
      const errorObj = (error as AdapterError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];
      if (otpMsg) {
        this.notify.error(this.tInvalidOTP);

        return;
      }

      this.notify.error(this.tsomethingWentWrong);
    }
  });

  verifySwitchToEmailEmailOTP = task(async (otp, token) => {
    this.emailOTP = '';

    try {
      await this.ajax.post(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.HOTP,
          otp: otp || '',
          token: token,
        },
      });

      return true;
    } catch (error) {
      const errorObj = (error as AdapterError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];

      if (otpMsg) {
        this.notify.error(this.tInvalidOTP);
      } else {
        this.notify.error(this.tsomethingWentWrong);
      }
    }

    return false;
  });

  switchToEmail = task(async () => {
    const confirmSwitch = await this.confirmSwitchToEmail.perform();

    if (confirmSwitch.cancel) {
      return;
    }

    let appOTPNotConfirmed;
    let tokenData;

    do {
      debug('SwitchTOEmail: In App OTP Loop');
      const appOTPData = await this.confirmSwitchToEmailAppOTP.perform();

      if (appOTPData.cancel) {
        return;
      }

      tokenData = await this.verifySwitchToEmailAppOTP.perform(appOTPData.otp);

      appOTPNotConfirmed = !(tokenData || {}).token;
    } while (appOTPNotConfirmed);

    debug('SwitchTOEmail: App OTP Token Data ' + tokenData.token);

    while (true) {
      debug('SwitchTOEmail: In Email OTP Loop');
      const emailOTPData = await this.confirmSwitchToEmailEmailOTP.perform();

      if (emailOTPData.cancel) {
        return;
      }

      const confirmed = await this.verifySwitchToEmailEmailOTP.perform(
        emailOTPData.otp,
        tokenData.token
      );

      if (confirmed) {
        this.closeSwitchToEmail();

        return;
      }
    }
  });
  //------Switch To Email MFA end------

  //------Switch To App MFA start------
  @action
  staShow() {
    this.staModalActive = true;
    this.staAppConfirmActive = true;
    this.staEmailVerifyActive = false;
    this.staAppVerifyActive = false;
    this.appOTP = '';
    this.emailOTP = '';
  }

  @action
  staClose() {
    this.staModalActive = false;
    this.staAppConfirmActive = false;
    this.staEmailVerifyActive = false;
    this.staAppVerifyActive = false;
    this.appOTP = '';
    this.emailOTP = '';
  }

  @action
  staCancel() {
    this.staClose();

    this.trigger('staConfirm', {
      cancel: true,
    });

    this.trigger('staConfirmEmailOTP', {
      cancel: true,
    });

    this.trigger('staConfirmAppOTP', {
      cancel: true,
    });
  }

  staConfirm = task(async () => {
    this.staShow();

    return (await (waitForEvent(
      this,
      'staConfirm'
    ) as unknown)) as MfaConfirmEventData;
  });

  @action
  staShowVerifyEmail() {
    this.staAppConfirmActive = false;
    this.staEmailVerifyActive = true;
    this.staAppVerifyActive = false;
  }

  @action
  staShowVerifyApp() {
    this.staAppConfirmActive = false;
    this.staEmailVerifyActive = false;
    this.staAppVerifyActive = true;
  }

  staConfirmEmailOTP = task(async () => {
    this.staShowVerifyEmail();

    return (await (waitForEvent(
      this,
      'staConfirmEmailOTP'
    ) as unknown)) as MfaConfirmEventData;
  });

  staConfirmAppOTP = task(async () => {
    this.staShowVerifyApp();

    return (await (waitForEvent(
      this,
      'staConfirmAppOTP'
    ) as unknown)) as MfaConfirmEventData;
  });

  @action
  staOnConfirm() {
    this.trigger('staConfirm', {
      cancel: false,
    });
  }

  @action
  staOnConfirmEmailOTP() {
    this.trigger('staConfirmEmailOTP', {
      otp: this.emailOTP,
      cancel: false,
    });
  }

  @action
  staOnConfirmAppOTP() {
    this.trigger('staConfirmAppOTP', {
      otp: this.appOTP,
      cancel: false,
    });
  }

  staInitialEmail = task(async () => {
    try {
      await this.ajax.post(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP,
        },
      });
    } catch (error) {
      const errorObj = (error as AdapterError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];

      if (otpMsg) {
        return;
      }

      this.notify.error(this.tsomethingWentWrong);
    }
  });

  staVerifyEmailOTP = task(async (otp) => {
    this.emailOTP = '';

    if (!otp) {
      this.notify.error(this.tEnterOTP);

      return false;
    }

    try {
      return await this.ajax.post(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP,
          otp: otp,
        },
      });
    } catch (error) {
      const errorObj = (error as AdapterError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];

      if (otpMsg) {
        this.notify.error(this.tInvalidOTP);

        return;
      }

      this.notify.error(this.tsomethingWentWrong);
    }
  });

  staVerifyAppOTP = task(async (otp, token) => {
    this.appOTP = '';

    if (!otp) {
      this.notify.error(this.tEnterOTP);

      return false;
    }

    try {
      await this.ajax.post(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP,
          otp: otp,
          token: token,
        },
      });

      return true;
    } catch (error) {
      const errorObj = (error as AdapterError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];

      if (otpMsg) {
        this.notify.error(this.tInvalidOTP);
      } else {
        this.notify.error(this.tsomethingWentWrong);
      }
    }

    return false;
  });

  sta = task(async () => {
    const confirmSwitch = await this.staConfirm.perform();

    if (confirmSwitch.cancel) {
      return;
    }

    let emailOTPNotConfirmed;
    let tokenData;

    await this.staInitialEmail.perform();

    do {
      debug('sta: In Email OTP Loop');
      const emailOTPData = await this.staConfirmEmailOTP.perform();

      if (emailOTPData.cancel) {
        return;
      }

      tokenData = await this.staVerifyEmailOTP.perform(emailOTPData.otp);

      emailOTPNotConfirmed = !(tokenData || {}).token;
    } while (emailOTPNotConfirmed);

    debug('sta: Email OTP Token Data ' + tokenData.token);

    this.mfaAppSecret = tokenData.secret;

    while (true) {
      debug('sta: In App OTP Loop');
      const appOTPData = await this.staConfirmAppOTP.perform();

      if (appOTPData.cancel) {
        return;
      }

      const confirmed = await this.staVerifyAppOTP.perform(
        appOTPData.otp,
        tokenData.token
      );

      if (confirmed) {
        this.staClose();

        return;
      }
    }
  });
  //------Switch To App MFA end------

  //------Disable MFA Start ------
  @action
  showMFADisable() {
    this.showMFADisableModal = true;
    this.showConfirmDisableMFA = true;
  }

  @action
  closeMFADisable() {
    this.showMFADisableModal = false;
    this.showDisableMFA = false;
    this.showConfirmDisableMFA = false;
  }

  @action
  cancelMFADisable() {
    this.closeMFADisable();

    this.trigger('continueDisableMFA', {
      cancel: true,
    });

    this.trigger('confirmDisableOTP', {
      cancel: true,
    });
  }

  @action
  showMFADisableOTP() {
    this.showConfirmDisableMFA = false;
    this.showDisableMFA = true;
  }

  @action
  continueDisableMFA() {
    this.trigger('continueDisableMFA', {
      cancel: false,
    });
  }

  disableMFA = task(async (method) => {
    debug('MFA disable called');

    this.disableOTP = '';

    this.showMFADisable();

    const shouldContinue = (await (waitForEvent(
      this,
      'continueDisableMFA'
    ) as unknown)) as MfaConfirmEventData;

    if (shouldContinue.cancel) {
      debug('MFA disable cancelled');

      return;
    }

    try {
      if (method == ENUMS.MFA_METHOD.HOTP) {
        await this.sendDisableMFAOTPEmail.perform();
      }

      this.showMFADisableOTP();

      while (true) {
        const otpData = await this.getDisableOTP.perform();

        if (otpData.cancel) {
          return;
        }

        const confirmed = await this.verifyDisableOTP.perform(
          otpData.otp,
          method
        );

        if (confirmed) {
          await this.mfas.retry();

          this.closeMFADisable();

          return;
        }
      }
    } catch (error) {
      this.closeMFADisable();

      this.notify.error(this.tsomethingWentWrong);
    }
  });

  sendDisableMFAOTPEmail = task(async () => {
    try {
      const data = {
        method: ENUMS.MFA_METHOD.HOTP,
      };

      await this.ajax.delete(this.mfaEndpoint, {
        data,
      });
    } catch (error) {
      const payload = (error as AdapterError).payload || {};

      if (payload.otp && payload.otp.length) {
        return;
      }

      throw error;
    }
  });

  verifyDisableOTP = task(async (otp, method) => {
    const data = {
      method: method,
      otp: otp,
    };

    try {
      await this.ajax.delete(this.mfaEndpoint, {
        data: data,
      });

      return true;
    } catch (error) {
      const errorObj = (error as AdapterError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];

      if (otpMsg) {
        this.notify.error(this.tInvalidOTP);
      } else {
        this.notify.error(this.tsomethingWentWrong);
      }
    }

    return false;
  });

  getDisableOTP = task(async () => {
    return (await (waitForEvent(
      this,
      'confirmDisableOTP'
    ) as unknown)) as MfaConfirmEventData;
  });

  @action
  confirmDisableOTP() {
    this.trigger('confirmDisableOTP', {
      otp: this.disableOTP,
      cancel: false,
    });
  }
  //------Disable MFA End ------

  enableMFA = task(async (method: string) => {
    switch (parseInt(method)) {
      case ENUMS.MFA_METHOD.HOTP:
        if (this.isMFAEnabled) {
          await this.switchToEmail.perform();
        } else {
          await this.noMFAEnableEmail.perform();
        }

        break;

      case ENUMS.MFA_METHOD.TOTP:
        if (this.isMFAEnabled) {
          await this.sta.perform();
        } else {
          await this.noMFAEnableApp.perform();
        }

        break;

      default:
        break;
    }

    await this.mfas.retry();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::Security::MultiFactorAuth': typeof AccountSettingsSecurityMultiFactorAuthComponent;
  }
}
