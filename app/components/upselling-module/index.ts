import Component from '@glimmer/component';

export interface UpsellingModuleSignature {
  Args: {
    title: string;
    subtitle: string;
    features: string[];
    onClickContactCTA: () => void;
    showSuccess: boolean;
    successMessage: string;
  };
  Blocks: {
    gradientContent: [];
  };
}

export default class UpsellingModuleComponent extends Component<UpsellingModuleSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    UpsellingModule: typeof UpsellingModuleComponent;
  }
}
