import Component from '@glimmer/component';

export default class StoreknoxDiscoverWelcomeModalComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::WelcomeModal': typeof StoreknoxDiscoverWelcomeModalComponent;
  }
}
