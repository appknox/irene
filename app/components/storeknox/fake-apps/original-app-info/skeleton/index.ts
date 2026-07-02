import Component from '@glimmer/component';

export interface StoreknoxFakeAppsOriginalAppInfoSkeletonSignature {
  Element: HTMLElement;
}

export default class StoreknoxFakeAppsOriginalAppInfoSkeletonComponent extends Component<StoreknoxFakeAppsOriginalAppInfoSkeletonSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::OriginalAppInfo::Skeleton': typeof StoreknoxFakeAppsOriginalAppInfoSkeletonComponent;
  }
}
