import Component from '@glimmer/component';
import UserModel from 'irene/models/user';

export interface AccountSettingsSecuritySignature {
  Args: {
    user: UserModel;
  };
}

export default class AccountSettingsSecurityComponent extends Component<AccountSettingsSecuritySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::Security': typeof AccountSettingsSecurityComponent;
  }
}
