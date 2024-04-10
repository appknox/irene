import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export interface UserLoginViaSsoComponentSignature {
  Args: {
    username: string;
    password: string;
    usernameChanged: (event: Event) => void;
    showLoginSpinner: boolean;
    login: () => void;
    showSSOSpinner: boolean;
    ssologin: () => void;
    isEnforced: boolean;
    showCredError: boolean;
    showAccountLockError: boolean;
  };
  Element: HTMLElement;
}

export default class UserLoginViaSsoComponent extends Component<UserLoginViaSsoComponentSignature> {
  handleSsoLogin = task(async (event: SubmitEvent) => {
    event.preventDefault();

    this.args.ssologin();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserLogin::ViaSso': typeof UserLoginViaSsoComponent;
  }
}
