import Component from '@glimmer/component';

interface AuthAssetsSignature {
  Element: HTMLImageElement;
}

export default class AuthAssetsComponent extends Component<AuthAssetsSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AuthAssets: typeof AuthAssetsComponent;
  }
}
