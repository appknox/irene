import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import type SkPendingReviewService from 'irene/services/sk-pending-review';
import type SkAppModel from 'irene/models/sk-app';

interface LimitOffset {
  limit: number;
  offset: number;
}

export default class StoreknoxInventoryPendingReviewComponent extends Component {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare skPendingReview: SkPendingReviewService;

  get reviewAppsData() {
    if (this.isFetchingData) {
      return Array.from({ length: 5 }, () => ({})) as SkAppModel[];
    } else {
      return this.skPendingReview.skPendingReviewData?.slice() || [];
    }
  }

  // Table Actions
  @action goToPage({ limit, offset }: LimitOffset) {
    // Route model reloads and fetches apps in service
    this.router.transitionTo({
      queryParams: {
        app_limit: limit,
        app_offset: offset,
      },
    });
  }

  @action changePerPageItem(args: LimitOffset) {
    this.router.transitionTo({
      queryParams: {
        app_limit: args.limit,
        app_offset: 0,
      },
    });
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
      this.skPendingReview.isFetchingSkPendingReviewApps &&
      !this.skPendingReview.singleUpdate
    );
  }

  get totalCount() {
    return this.skPendingReview.skPendingReviewAppsCount;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::PendingReview': typeof StoreknoxInventoryPendingReviewComponent;
  }
}
