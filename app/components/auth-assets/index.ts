import Component from '@glimmer/component';

export default class AuthAssetsComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AuthAssets: typeof AuthAssetsComponent;
  }
}
