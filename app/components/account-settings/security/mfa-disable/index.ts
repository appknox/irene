import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import Owner from '@ember/owner';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type IreneAjaxService from 'irene/services/ajax';
import type UserModel from 'irene/models/user';
import type { AjaxError } from 'irene/services/ajax';

interface AccountSettingsSecurityMfaDisableSignature {
  Args: {
    user: UserModel;
    isEmailMFAEnabled: boolean;
    isAppMFAEnabled: boolean;
    closeModal: () => void;
    reloadMfa: () => void;
  };
}

export default class AccountSettingsSecurityMfaDisableComponent extends Component<AccountSettingsSecurityMfaDisableSignature> {
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked showConfirmDisableMFA = true;
  @tracked showDisableMFA = false;
  @tracked disableOTP = '';

  mfaEndpoint = '/v2/mfa';

  tEnterOTP: string;
  tInvalidOTP: string;
  tsomethingWentWrong: string;

  constructor(
    owner: Owner,
    args: AccountSettingsSecurityMfaDisableSignature['Args']
  ) {
    super(owner, args);

    this.tEnterOTP = this.intl.t('enterOTP');
    this.tInvalidOTP = this.intl.t('invalidOTP');
    this.tsomethingWentWrong = this.intl.t('somethingWentWrong');
  }

  get user() {
    return this.args.user;
  }

  get isEmailMFAEnabled() {
    return this.args.isEmailMFAEnabled;
  }

  get isAppMFAEnabled() {
    return this.args.isAppMFAEnabled;
  }

  get enabledMethod() {
    if (this.isEmailMFAEnabled) {
      return ENUMS.MFA_METHOD.HOTP;
    }

    if (this.isAppMFAEnabled) {
      return ENUMS.MFA_METHOD.TOTP;
    }

    return ENUMS.MFA_METHOD.NONE;
  }

  @action
  showMFADisableOTP() {
    this.showConfirmDisableMFA = false;
    this.showDisableMFA = true;
  }

  @action
  closeMFADisable() {
    this.args.closeModal();
  }

  continueDisableMFA = task(async () => {
    try {
      if (this.isEmailMFAEnabled) {
        await this.sendDisableMFAOTPEmail.perform();
      }

      this.showMFADisableOTP();
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
      const payload = (error as AjaxError).payload || {};

      if (payload.otp && payload.otp.length) {
        return;
      }

      throw error;
    }
  });

  verifyDisableOTP = task(async (event: Event) => {
    event.preventDefault();

    const otp = this.disableOTP;

    if (!otp) {
      this.notify.error(this.tEnterOTP);

      return false;
    }

    const data = {
      method: this.enabledMethod,
      otp,
    };

    try {
      await this.ajax.delete(this.mfaEndpoint, {
        data: data,
      });

      this.args.reloadMfa();

      this.closeMFADisable();
    } catch (error) {
      const errorObj = (error as AjaxError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];

      if (otpMsg) {
        this.notify.error(this.tInvalidOTP);
      } else {
        this.notify.error(this.tsomethingWentWrong);
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::Security::MfaDisable': typeof AccountSettingsSecurityMfaDisableComponent;
  }
}
