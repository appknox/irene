import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';

interface LimitOffset {
  limit: number;
  offset: number;
}

export interface StoreknoxDiscoverPendingReviewTableSignature {
  Args: {
    data: any;
    router: string;
  };
}

export default class StoreknoxDiscoverPendingReviewTableComponent extends Component<StoreknoxDiscoverPendingReviewTableSignature> {
  @service declare router: RouterService;

  get reviewApps() {
    return this.args?.data;
  }

  // Table Actions
  @action goToPage(args: LimitOffset) {
    const { limit, offset } = args;
    this.router.transitionTo(this.args.router, {
      queryParams: { app_limit: limit, app_offset: offset },
    });
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { limit } = args;
    const offset = 0;

    this.router.transitionTo(this.args.router, {
      queryParams: { app_limit: limit, app_offset: offset },
    });
  }

  get totalCount() {
    return this.reviewApps.length || 0;
  }

  get tableData() {
    return this.reviewApps;
  }

  get itemPerPageOptions() {
    return [10, 25, 50];
  }

  get limit() {
    return 10;
  }

  get offset() {
    return 0;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::PendingReview::Table': typeof StoreknoxDiscoverPendingReviewTableComponent;
  }
}
