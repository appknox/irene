import Component from '@glimmer/component';

export interface UserLoginRootContainerComponentSignature {
  Element: HTMLElement;
  Blocks: {
    default: [];
  };
}

export default class UserLoginRootContainerComponent extends Component<UserLoginRootContainerComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserLogin::RootContainer': typeof UserLoginRootContainerComponent;
  }
}
