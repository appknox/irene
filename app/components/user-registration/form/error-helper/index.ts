import Component from '@glimmer/component';

interface FormErrorHelperSignature {
  Args: {
    message: string;
    dataTestHelperText: string;
    visible: boolean;
  };
  Blocks: {
    default: [];
  };
}

export default class FormErrorHelperComponent extends Component<FormErrorHelperSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserRegistration::Form::ErrorHelper': typeof FormErrorHelperComponent;
  }
}
