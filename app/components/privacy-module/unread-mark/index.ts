import Component from '@glimmer/component';

interface PrivacyModuleUnreadMarkSignature {
  Element: HTMLElement;
  Args: {
    highlight: boolean;
  };
}

export default class PrivacyModuleUnreadMarkComponent extends Component<PrivacyModuleUnreadMarkSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::UnreadMark': typeof PrivacyModuleUnreadMarkComponent;
  }
}
