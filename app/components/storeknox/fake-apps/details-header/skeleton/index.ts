import Component from '@glimmer/component';

export interface StoreknoxFakeAppsDetailsHeaderSkeletonSignature {
  Element: HTMLDivElement;
}

export default class StoreknoxFakeAppsDetailsHeaderSkeletonComponent extends Component<StoreknoxFakeAppsDetailsHeaderSkeletonSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::DetailsHeader::Skeleton': typeof StoreknoxFakeAppsDetailsHeaderSkeletonComponent;
  }
}
