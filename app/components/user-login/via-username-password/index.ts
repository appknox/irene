import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import WhitelabelService from 'irene/services/whitelabel';

export interface UserLoginViaUsernamePasswordComponentSignature {
  Args: {
    username: string;
    password: string;
    usernameChanged: (event: Event) => void;
    login: () => void;
    showSpinner: boolean;
    showCredError: boolean;
    showAccountLockError: boolean;
  };
  Element: HTMLElement;
}

export default class UserLoginViaUsernamePasswordComponent extends Component<UserLoginViaUsernamePasswordComponentSignature> {
  @service declare whitelabel: WhitelabelService;

  handleLogin = task(async (event: SubmitEvent) => {
    event.preventDefault();

    this.args.login();
  });

  get showLinkContactSupport() {
    return this.whitelabel.show_contact_support;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserLogin::ViaUsernamePassword': typeof UserLoginViaUsernamePasswordComponent;
  }
}
