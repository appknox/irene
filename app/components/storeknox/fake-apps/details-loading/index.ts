import Component from '@glimmer/component';

export default class StoreknoxFakeAppsDetailsLoadingComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::DetailsLoading': typeof StoreknoxFakeAppsDetailsLoadingComponent;
  }
}
