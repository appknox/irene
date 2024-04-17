import { action } from '@ember/object';
import Component from '@glimmer/component';
import { BufferedChangeset } from 'ember-changeset/types';

export type ChangesetBufferProps = BufferedChangeset & {
  email?: string;
  company?: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  termsAccepted?: boolean;
  recaptcha?: string;
  password?: string;
  passwordConfirmation?: string;
};

interface RegisterFormSignature {
  Args: {
    changeset: ChangesetBufferProps;
    emailValue?: string;
    companyValue?: string;
    onRegister: (changeset: ChangesetBufferProps) => void;
    enabledRecaptcha?: boolean;
    enabledName?: boolean;
    enabledPassword?: boolean;
    enabledUsername?: boolean;
    enabledTerms?: boolean;
    registerTaskRunning: boolean;
    showLoginLink?: boolean;
  };
  Blocks: {
    default: [];
  };
}

export default class RegisterForm extends Component<RegisterFormSignature> {
  get isRegisterButtonDisabled() {
    const isChangesetValid = this.args.changeset.get('isValid');

    return !isChangesetValid;
  }

  get isEmailDisabled() {
    return !!this.args.emailValue;
  }

  get isCompanyDisabled() {
    return !!this.args.companyValue;
  }

  @action
  showError(field: string) {
    if (this.args.changeset.isDirty || !this.args.changeset.isValid) {
      if (
        this.args.changeset.changes.some((change) => change['key'] === field) &&
        this.args.changeset.errors.some((error) => error['key'] === field)
      ) {
        return true;
      }
    } else {
      return false;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserRegistration::Form': typeof RegisterForm;
  }
}
