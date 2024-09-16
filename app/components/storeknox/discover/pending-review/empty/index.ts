import Component from '@glimmer/component';

export default class StoreknoxDiscoverPendingReviewEmptyComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::PendingReview::Empty': typeof StoreknoxDiscoverPendingReviewEmptyComponent;
  }
}
