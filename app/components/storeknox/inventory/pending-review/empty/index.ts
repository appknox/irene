import Component from '@glimmer/component';

export default class StoreknoxInventoryPendingReviewEmptyComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::PendingReview::Empty': typeof StoreknoxInventoryPendingReviewEmptyComponent;
  }
}