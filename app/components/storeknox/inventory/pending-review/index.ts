import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { StoreknoxInventoryPendingReviewsQueryParam } from 'irene/routes/authenticated/storeknox/inventory/pending-reviews';
import type SkPendingReviewService from 'irene/services/sk-pending-review';
import type SkAppModel from 'irene/models/sk-app';

export interface StoreknoxInventoryResultsSignature {
  Args: {
    queryParams: StoreknoxInventoryPendingReviewsQueryParam;
  };
}

interface LimitOffset {
  limit: number;
  offset: number;
}

export default class StoreknoxInventoryPendingReviewComponent extends Component<StoreknoxInventoryResultsSignature> {
  @service declare intl: IntlService;
  @service declare skPendingReview: SkPendingReviewService;

  constructor(
    owner: unknown,
    args: StoreknoxInventoryResultsSignature['Args']
  ) {
    super(owner, args);

    const { app_limit, app_offset } = args.queryParams;

    this.skPendingReview.fetchPendingReviewApps.perform(app_limit, app_offset);
  }

  get columns() {
    return [
      // {
      //   headerComponent: 'storeknox/table-columns/checkbox-header',
      //   cellComponent: 'storeknox/table-columns/checkbox',
      //   minWidth: 10,
      //   width: 10,
      //   textAlign: 'center',
      // },
      {
        headerComponent: 'storeknox/table-columns/store-header',
        cellComponent: 'storeknox/table-columns/store',
        minWidth: 50,
        width: 50,
        textAlign: 'center',
      },
      {
        name: this.intl.t('application'),
        cellComponent: 'storeknox/table-columns/application',
        width: 200,
      },
      {
        headerComponent:
          'storeknox/inventory/pending-review/table/found-by-header',
        cellComponent: 'storeknox/inventory/pending-review/table/found-by',
      },
      // {
      //   headerComponent:
      //     'storeknox/inventory/pending-review/table/availability-header',
      //   cellComponent: 'storeknox/inventory/pending-review/table/availability',
      //   textAlign: 'center',
      // },
      {
        name: this.intl.t('status'),
        cellComponent: 'storeknox/inventory/pending-review/table/status',
        textAlign: 'center',
        width: 80,
      },
    ];
  }

  get reviewAppsData() {
    if (this.isFetchingData) {
      return Array.from({ length: 5 }, () => ({})) as SkAppModel[];
    } else {
      return this.skPendingReview.skPendingReviewData?.slice() || [];
    }
  }

  // Table Actions
  @action goToPage(args: LimitOffset) {
    this.skPendingReview.fetchPendingReviewApps.perform(
      args.limit,
      args.offset
    );
  }

  @action changePerPageItem(args: LimitOffset) {
    this.skPendingReview.fetchPendingReviewApps.perform(args.limit, 0);
  }

  // TO DO: When Multiple Scenario comes in
  get showButtons() {
    return false;
  }

  get showTable() {
    return this.totalCount > 0 || this.isFetchingData;
  }

  get isFetchingData() {
    return (
      this.skPendingReview.fetchPendingReviewApps.isRunning &&
      !this.skPendingReview.singleUpdate
    );
  }

  get totalCount() {
    return this.skPendingReview.totalCount;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::PendingReview': typeof StoreknoxInventoryPendingReviewComponent;
  }
}
