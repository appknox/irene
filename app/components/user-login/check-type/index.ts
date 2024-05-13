import Component from '@glimmer/component';
import { task } from 'ember-concurrency';

export interface UserLoginCheckTypeComponentSignature {
  Args: {
    username: string;
    showSpinner: boolean;
    verifySSO: () => void;
  };
  Element: HTMLElement;
}

export default class UserLoginCheckTypeComponent extends Component<UserLoginCheckTypeComponentSignature> {
  handleVerification = task(async (event: SubmitEvent) => {
    event.preventDefault();

    this.args.verifySSO();
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserLogin::CheckType': typeof UserLoginCheckTypeComponent;
  }
}
