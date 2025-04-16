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

interface AccountSettingsSecurityMfaSwitchToEmailSignature {
  Args: {
    user: UserModel;
    closeModal: () => void;
    reloadMfa: () => void;
  };
}

export default class AccountSettingsSecurityMfaSwitchToEmailComponent extends Component<AccountSettingsSecurityMfaSwitchToEmailSignature> {
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked showSwitchToEmailConfirm = true;
  @tracked showSwitchToEmailAppVerify = false;
  @tracked showSwitchTOEmailEmailVerify = false;

  @tracked emailOTP = '';
  @tracked emailTokenData: TokenData | null = null;

  @tracked appOTP = '';

  mfaEndpoint = '/v2/mfa';

  tEnterOTP: string;
  tInvalidOTP: string;
  tsomethingWentWrong: string;

  constructor(
    owner: Owner,
    args: AccountSettingsSecurityMfaSwitchToEmailSignature['Args']
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
  closeSwitchToEmail() {
    this.args.closeModal();
  }

  @action
  showSwitchToEmailVerifyApp() {
    this.showSwitchToEmailConfirm = false;
    this.showSwitchToEmailAppVerify = true;
    this.showSwitchTOEmailEmailVerify = false;
  }

  @action
  showSwitchToEmailVerifyEmail() {
    this.showSwitchToEmailConfirm = false;
    this.showSwitchToEmailAppVerify = false;
    this.showSwitchTOEmailEmailVerify = true;
  }

  verifySwitchToEmailAppOTP = task(async (event: Event) => {
    event.preventDefault();

    const otp = this.appOTP;

    if (!otp) {
      this.notify.error(this.tEnterOTP);

      return false;
    }

    try {
      this.emailTokenData = await this.ajax.post<TokenData>(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.HOTP,
          otp: otp || '',
        },
      });

      this.showSwitchToEmailVerifyEmail();

      return true;
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

  verifySwitchToEmailEmailOTP = task(async (event: Event) => {
    event.preventDefault();

    const otp = this.emailOTP;
    const token = this.emailTokenData?.token;

    if (!otp) {
      this.notify.error(this.tEnterOTP);

      return false;
    }

    try {
      await this.ajax.post(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.HOTP,
          otp: otp || '',
          token: token,
        },
      });

      this.args.reloadMfa();

      this.closeSwitchToEmail();
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
    'AccountSettings::Security::MfaSwitchToEmail': typeof AccountSettingsSecurityMfaSwitchToEmailComponent;
  }
}
