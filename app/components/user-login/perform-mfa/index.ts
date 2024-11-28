import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import IntlService from 'ember-intl/services/intl';
import { task } from 'ember-concurrency';
import { tracked } from 'tracked-built-ins';
import WhitelabelService from 'irene/services/whitelabel';

export interface UserLoginPerformMFAComponentSignature {
  Args: {
    forced: boolean;
    isEmail: boolean;
    isAuthApp: boolean;
    showSpinner: boolean;
    login: (otp: string) => void;
    showCredError: boolean;
    showAccountLockError: boolean;
  };
  Element: HTMLElement;
}

export default class UserLoginPerformMFAComponent extends Component<UserLoginPerformMFAComponentSignature> {
  @service declare intl: IntlService;
  @service declare whitelabel: WhitelabelService;

  @tracked otp = '';

  get mfaInputLabel() {
    return this.args.isAuthApp
      ? this.intl.t('authenticatorCodeLabel')
      : this.intl.t('emailCodeLabel');
  }

  handleLogin = task(async (event: SubmitEvent) => {
    event.preventDefault();

    this.args.login(this.otp);
  });

  get showLinkContactSupport() {
    return this.whitelabel.is_appknox_url;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserLogin::PerformMfa': typeof UserLoginPerformMFAComponent;
  }
}
