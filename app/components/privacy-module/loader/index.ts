import Component from '@glimmer/component';

interface PrivacyModuleLoaderSignature {
  Element: HTMLElement;
  Args: {
    loadingText: string;
  };
}

export default class PrivacyModuleLoaderComponent extends Component<PrivacyModuleLoaderSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::Loader': typeof PrivacyModuleLoaderComponent;
  }
}
