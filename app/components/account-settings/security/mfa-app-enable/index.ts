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

type TokenData = {
  token: string;
  secret: string;
};

interface AccountSettingsSecurityMfaAppEnableSignature {
  Args: {
    user: UserModel;
    closeModal: () => void;
    reloadMfa: () => void;
  };
}

export default class AccountSettingsSecurityMfaAppEnableComponent extends Component<AccountSettingsSecurityMfaAppEnableSignature> {
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked appOTP = '';
  @tracked mfaAppSecret = '';
  @tracked mfaAppToken = '';

  mfaEndpoint = '/v2/mfa';

  tEnterOTP: string;
  tInvalidOTP: string;
  tsomethingWentWrong: string;

  constructor(
    owner: Owner,
    args: AccountSettingsSecurityMfaAppEnableSignature['Args']
  ) {
    super(owner, args);

    this.tEnterOTP = this.intl.t('enterOTP');
    this.tInvalidOTP = this.intl.t('invalidOTP');
    this.tsomethingWentWrong = this.intl.t('somethingWentWrong');

    this.noMFAEnableApp.perform();
  }

  get user() {
    return this.args.user;
  }

  @action
  closeAppEnable() {
    this.args.closeModal();
  }

  noMFAEnableApp = task(async () => {
    this.appOTP = '';

    try {
      const tokenData = await this.getMFAEnableAppToken.perform();

      this.mfaAppSecret = tokenData.secret;

      this.mfaAppToken = tokenData.token;
    } catch (error) {
      this.closeAppEnable();

      this.notify.error(this.tsomethingWentWrong);
    }
  });

  getMFAEnableAppToken = task(async () => {
    return await this.ajax.post<TokenData>(this.mfaEndpoint, {
      data: {
        method: ENUMS.MFA_METHOD.TOTP,
      },
    });
  });

  verifyAppOTP = task(async () => {
    const otp = this.appOTP;
    const token = this.mfaAppToken;

    if (!otp) {
      this.notify.error(this.tEnterOTP);

      return false;
    }

    try {
      await this.ajax.post(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP,
          otp: otp || '',
          token: token,
        },
      });

      this.args.reloadMfa();

      this.closeAppEnable();
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
    'AccountSettings::Security::MfaAppEnable': typeof AccountSettingsSecurityMfaAppEnableComponent;
  }
}
