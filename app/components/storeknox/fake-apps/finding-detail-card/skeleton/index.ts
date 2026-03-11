import Component from '@glimmer/component';

export interface StoreknoxFakeAppsFindingDetailCardSkeletonSignature {
  Element: HTMLDivElement;
}

export default class StoreknoxFakeAppsFindingDetailCardSkeletonComponent extends Component<StoreknoxFakeAppsFindingDetailCardSkeletonSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FindingDetailCard::Skeleton': typeof StoreknoxFakeAppsFindingDetailCardSkeletonComponent;
  }
}
