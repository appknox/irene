import Component from '@glimmer/component';

export interface RegisterConfirmSignature {
  Args: {
    title: string;
    message: string;
    showLoginLink?: boolean;
  };
  Blocks: {
    default: [];
  };
}

export default class RegisterConfirmComponent extends Component<RegisterConfirmSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserRegistration::RegisterConfirm': typeof RegisterConfirmComponent;
  }
}
