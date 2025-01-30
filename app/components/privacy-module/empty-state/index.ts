import Component from '@glimmer/component';

interface PrivacyModuleEmptyStateSignature {
  Element: HTMLElement;
  Args: {
    heading: string;
    description: string;
  };
}

export default class PrivacyModuleEmptyStateComponent extends Component<PrivacyModuleEmptyStateSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::EmptyState': typeof PrivacyModuleEmptyStateComponent;
  }
}
