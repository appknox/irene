import Component from '@glimmer/component';

export interface StoreknoxFakeAppsFindingsCardSkeletonSignature {
  Element: HTMLElement;
  Args: { isDefaultFinding?: boolean; showChip?: boolean };
}

export default class StoreknoxFakeAppsFindingsCardSkeletonComponent extends Component<StoreknoxFakeAppsFindingsCardSkeletonSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FindingsCard::Skeleton': typeof StoreknoxFakeAppsFindingsCardSkeletonComponent;
  }
}
