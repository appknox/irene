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

interface AccountSettingsSecurityMfaEmailEnableSignature {
  Args: {
    user: UserModel;
    onCancel: () => void;
    reloadMfa: () => void;
  };
}

export default class AccountSettingsSecurityMfaEmailEnableComponent extends Component<AccountSettingsSecurityMfaEmailEnableSignature> {
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked showEmailSendConfirm = true;
  @tracked showEmailOTPEnter = false;
  @tracked emailOTP = '';
  @tracked emailTokenData: TokenData | null = null;

  mfaEndpoint = '/v2/mfa';

  tEnterOTP: string;
  tInvalidOTP: string;
  tsomethingWentWrong: string;

  constructor(
    owner: Owner,
    args: AccountSettingsSecurityMfaEmailEnableSignature['Args']
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
  closeEmailEnable() {
    this.args.onCancel();
  }

  showEmailOTPDialog() {
    this.showEmailSendConfirm = false;
    this.showEmailOTPEnter = true;
  }

  getMFAEnableEmailToken = task(async () => {
    try {
      this.emailTokenData = await this.ajax.post<TokenData>(this.mfaEndpoint, {
        data: { method: ENUMS.MFA_METHOD.HOTP },
      });

      this.notify.success(`OTP sent to ${this.user?.email}`);

      this.showEmailOTPDialog();
    } catch (error) {
      this.notify.error('Failed to send OTP. Please try again.');
    }
  });

  verifyEmailOTP = task(async (event: Event) => {
    event.preventDefault();

    try {
      const otp = this.emailOTP;
      const token = this.emailTokenData?.token;

      if (!otp) {
        this.notify.error(this.tEnterOTP);

        return false;
      }

      await this.ajax.post(this.mfaEndpoint, {
        data: {
          method: ENUMS.MFA_METHOD.HOTP,
          otp: otp,
          token: token,
        },
      });

      this.args.reloadMfa();

      this.closeEmailEnable();
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
    'AccountSettings::Security::MfaEmailEnable': typeof AccountSettingsSecurityMfaEmailEnableComponent;
  }
}
