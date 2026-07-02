import Component from '@glimmer/component';

interface StoreknoxFakeAppsEmptyListSignature {
  Args: { subText: string };
}

export default class StoreknoxFakeAppsEmptyListComponent extends Component<StoreknoxFakeAppsEmptyListSignature> {}
declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::EmptyList': typeof StoreknoxFakeAppsEmptyListComponent;
  }
}
