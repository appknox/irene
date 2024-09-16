import Component from '@glimmer/component';

import type { StoreknoxDiscoveryReviewQueryParam } from 'irene/routes/authenticated/storeknox/discover/review';
import type SkAppModel from 'irene/models/sk-app';

interface LimitOffset {
  limit: number;
  offset: number;
}

export interface StoreknoxInventoryPendingReviewTableSignature {
  Args: {
    skAppList: SkAppModel[];
    limit: number;
    offset: number;
    loadingData: boolean;
    totalCount: number;
    goToPage: (args: LimitOffset) => void;
    onItemPerPageChange: (args: LimitOffset) => void;
    queryParams: StoreknoxDiscoveryReviewQueryParam;
  };
}

export default class StoreknoxInventoryPendingReviewTableComponent extends Component<StoreknoxInventoryPendingReviewTableSignature> {
  get itemPerPageOptions() {
    return [10, 25, 50];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::PendingReview::Table': typeof StoreknoxInventoryPendingReviewTableComponent;
  }
}
