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

interface AccountSettingsSecurityMfaSwitchToAppSignature {
  Args: {
    user: UserModel;
    closeModal: () => void;
    reloadMfa: () => void;
  };
}

export default class AccountSettingsSecurityMfaSwitchToAppComponent extends Component<AccountSettingsSecurityMfaSwitchToAppSignature> {
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked emailOTP = '';

  @tracked appOTP = '';
  @tracked mfaAppSecret = '';
  @tracked mfaAppToken = '';

  @tracked staAppConfirmActive = true;
  @tracked staEmailVerifyActive = false;
  @tracked staAppVerifyActive = false;

  mfaEndpoint = '/v2/mfa';

  tEnterOTP: string;
  tInvalidOTP: string;
  tsomethingWentWrong: string;

  constructor(
    owner: Owner,
    args: AccountSettingsSecurityMfaSwitchToAppSignature['Args']
  ) {
    super(owner, args);

    this.tEnterOTP = this.intl.t('enterOTP');
    this.tInvalidOTP = this.intl.t('invalidOTP');
    this.tsomethingWentWrong = this.intl.t('somethingWentWrong');
  }

  get user() {
    return this.args.user;
  }

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

  @action
  staClose() {
    this.args.closeModal();
  }

  staInitialEmail = task(async () => {
    try {
      await this.ajax.post(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP,
        },
      });
    } catch (error) {
      const errorObj = (error as AjaxError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];

      if (otpMsg) {
        this.staShowVerifyEmail();

        return;
      }

      this.notify.error(this.tsomethingWentWrong);
    }
  });

  staVerifyEmailOTP = task(async (event: Event) => {
    event.preventDefault();

    const otp = this.emailOTP;

    if (!otp) {
      this.notify.error(this.tEnterOTP);

      return false;
    }

    try {
      const tokenData = await this.ajax.post<TokenData>(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.TOTP,
          otp: otp,
        },
      });

      this.mfaAppSecret = tokenData.secret;

      this.mfaAppToken = tokenData.token;

      this.staShowVerifyApp();
    } catch (error) {
      const errorObj = (error as AjaxError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];

      if (otpMsg) {
        this.notify.error(this.tInvalidOTP);

        return;
      }

      this.notify.error(this.tsomethingWentWrong);
    }
  });

  staVerifyAppOTP = task(async () => {
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
          otp: otp,
          token: token,
        },
      });

      this.args.reloadMfa();

      this.staClose();
    } catch (error) {
      const errorObj = (error as AjaxError).payload || {};
      const otpMsg = errorObj.otp && errorObj.otp[0];

      if (otpMsg) {
        this.notify.error(this.tInvalidOTP);
      } else {
        this.notify.error(this.tsomethingWentWrong);
      }
    }

    return false;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::Security::MfaSwitchToApp': typeof AccountSettingsSecurityMfaSwitchToAppComponent;
  }
}
