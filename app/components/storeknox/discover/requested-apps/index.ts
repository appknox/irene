import Component from '@glimmer/component';

export default class StoreknoxDiscoverRequestedAppsComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::RequestedApps': typeof StoreknoxDiscoverRequestedAppsComponent;
  }
}
