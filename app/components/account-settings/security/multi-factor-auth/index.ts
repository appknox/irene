import Component from '@glimmer/component';
import Owner from '@ember/owner';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type Store from 'ember-data/store';

import ENUMS from 'irene/enums';
import type UserModel from 'irene/models/user';
import type MfaModel from 'irene/models/mfa';
import type MeService from 'irene/services/me';

export interface AccountSettingsSecurityMultiFactorAuthSignature {
  Args: {
    user: UserModel;
  };
}

export default class AccountSettingsSecurityMultiFactorAuthComponent extends Component<AccountSettingsSecurityMultiFactorAuthSignature> {
  @service declare store: Store;
  @service declare me: MeService;

  @tracked mfas: MfaModel[] = [];

  @tracked showEmailEnableModal = false;
  @tracked showAppEnableModal = false;
  @tracked showSwitchToEmailModal = false;
  @tracked showSwitchToAppModal = false;
  @tracked showMFADisableModal = false;

  mfaEndpoint = '/v2/mfa';

  constructor(
    owner: Owner,
    args: AccountSettingsSecurityMultiFactorAuthSignature['Args']
  ) {
    super(owner, args);

    this.loadMfaData.perform();
  }

  loadMfaData = task(async () => {
    const mfaResponse = await this.store.findAll('mfa');

    this.mfas = mfaResponse.slice();
  });

  get mfaAppRecords() {
    return [
      {
        osTypes: 'For Android, iOS, and Blackberry:',
        app: 'Google Authenticator',
        infoURL: 'https://support.google.com/accounts/answer/1066447?hl=en',
      },
      {
        osTypes: 'For Android & iOS:',
        app: 'Duo Mobile',
        infoURL: 'https://guide.duo.com/third-party-accounts',
      },
      {
        osTypes: 'For Windows Phone:',
        app: 'Authenticator',
        infoURL:
          'https://www.microsoft.com/en-us/store/p/authenticator/9wzdncrfj3rj',
      },
    ];
  }

  get user() {
    return this.args.user;
  }

  get isMFAEnabled() {
    return !!this.mfas?.find((it) => it.enabled === true);
  }

  get isEmailMFAEnabled() {
    const emailMFA = this.mfas?.find((it) => it.isEmail === true);

    return emailMFA?.enabled ?? false;
  }

  get isAppMFAEnabled() {
    const appMFA = this.mfas?.find((it) => it.isApp === true);

    return appMFA?.enabled ?? false;
  }

  enableMFA = task(async (method: string) => {
    switch (parseInt(method)) {
      case ENUMS.MFA_METHOD.HOTP:
        if (this.isMFAEnabled) {
          this.showSwitchToEmail();
        } else {
          this.noMFAEnableEmailDialog();
        }

        break;

      case ENUMS.MFA_METHOD.TOTP:
        if (this.isMFAEnabled) {
          this.staShow();
        } else {
          this.showAppOTPModel();
        }

        break;

      default:
        break;
    }
  });

  @action
  noMFAEnableEmailDialog() {
    this.showEmailEnableModal = true;
  }

  @action
  closeEmailEnable() {
    this.showEmailEnableModal = false;
  }

  @action
  showAppOTPModel() {
    this.showAppEnableModal = true;
  }

  @action
  closeAppEnable() {
    this.showAppEnableModal = false;
  }

  @action
  showMFADisable() {
    this.showMFADisableModal = true;
  }

  @action
  closeMFADisable() {
    this.showMFADisableModal = false;
  }

  @action
  showSwitchToEmail() {
    this.showSwitchToEmailModal = true;
  }

  @action
  closeSwitchToEmail() {
    this.showSwitchToEmailModal = false;
  }

  @action
  staShow() {
    this.showSwitchToAppModal = true;
  }

  @action
  staClose() {
    this.showSwitchToAppModal = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::Security::MultiFactorAuth': typeof AccountSettingsSecurityMultiFactorAuthComponent;
  }
}
