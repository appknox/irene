import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import { StoreknoxDiscoveryReviewQueryParam } from 'irene/routes/authenticated/storeknox/discover/review';
import SkPendingReviewService from 'irene/services/sk-pending-review';

export interface StoreknoxDiscoverResultsSignature {
  Args: {
    queryParams: StoreknoxDiscoveryReviewQueryParam;
  };
}

interface LimitOffset {
  limit: number;
  offset: number;
}

export default class StoreknoxDiscoverPendingReviewComponent extends Component<StoreknoxDiscoverResultsSignature> {
  @service declare intl: IntlService;
  @service declare skPendingReview: SkPendingReviewService;

  constructor(owner: unknown, args: StoreknoxDiscoverResultsSignature['Args']) {
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
          'storeknox/discover/pending-review/table/found-by-header',
        cellComponent: 'storeknox/discover/pending-review/table/found-by',
      },
      // {
      //   headerComponent:
      //     'storeknox/discover/pending-review/table/availability-header',
      //   cellComponent: 'storeknox/discover/pending-review/table/availability',
      //   textAlign: 'center',
      // },
      {
        name: this.intl.t('status'),
        cellComponent: 'storeknox/discover/pending-review/table/status',
        textAlign: 'center',
        width: 80,
      },
    ];
  }

  get reviewAppsData() {
    if (this.skPendingReview.isFetchingData) {
      return Array.from({ length: 5 }, () => ({}));
    } else {
      return this.skPendingReview.skPendingReviewData?.slice() || [];
    }
  }

  get loadingData() {
    return this.skPendingReview.isFetchingData;
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

  @action approveMultipleApp() {
    this.skPendingReview.approveRejectMultipleApp.perform(true);
  }

  @action rejectMultipleApp() {
    this.skPendingReview.approveRejectMultipleApp.perform(false);
  }

  get limit() {
    return Number(this.args.queryParams.app_limit);
  }

  get offset() {
    return Number(this.args.queryParams.app_offset);
  }

  get totalCount() {
    return this.skPendingReview.totalCount;
  }

  get showButtons() {
    return this.skPendingReview.selectedApps.length > 0;
  }

  get showTable() {
    return this.totalCount > 0 || this.loadingData;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::PendingReview': typeof StoreknoxDiscoverPendingReviewComponent;
  }
}
