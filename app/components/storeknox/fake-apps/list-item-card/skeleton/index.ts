import Component from '@glimmer/component';

export interface StoreknoxFakeAppsListItemCardSkeletonSignature {
  Element: HTMLElement;
}

export default class StoreknoxFakeAppsListItemCardSkeletonComponent extends Component<StoreknoxFakeAppsListItemCardSkeletonSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::ListItemCard::Skeleton': typeof StoreknoxFakeAppsListItemCardSkeletonComponent;
  }
}
