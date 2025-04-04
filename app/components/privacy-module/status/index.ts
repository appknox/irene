import Component from '@glimmer/component';

interface PrivacyModuleStatusSignature {
  Element: HTMLElement;
  Args: {
    heading: string;
    description: string;
    svgComponent:
      | 'ak-svg/privacy-not-found'
      | 'ak-svg/privacy-upload'
      | 'ak-svg/privacy-in-progress';
  };
}

export default class PrivacyModuleStatusComponent extends Component<PrivacyModuleStatusSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::Status': typeof PrivacyModuleStatusComponent;
  }
}
