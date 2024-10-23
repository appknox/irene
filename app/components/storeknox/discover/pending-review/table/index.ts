import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';

import SkAppModel from 'irene/models/sk-app';
import SkPendingReviewService from 'irene/services/sk-pending-review';

interface LimitOffset {
  limit: number;
  offset: number;
}

export interface StoreknoxDiscoverPendingReviewTableSignature {
  Args: {
    data: any;
    limit: number;
    offset: number;
    loadingData: boolean;
    totalCount: number;
    goToPage: (args: LimitOffset) => void;
    onItemPerPageChange: (args: LimitOffset) => void;
  };
}

export default class StoreknoxDiscoverPendingReviewTableComponent extends Component<StoreknoxDiscoverPendingReviewTableSignature> {
  @service declare router: RouterService;
  @service declare skPendingReview: SkPendingReviewService;

  get tableData() {
    return this.args.data;
  }

  get limit() {
    return this.args.limit;
  }

  get offset() {
    return this.args.offset;
  }

  get loadingData() {
    return this.args.loadingData;
  }

  get totalCount() {
    return this.args.totalCount;
  }

  // Table Actions
  @action goToPage(args: LimitOffset) {
    this.args.goToPage(args);
  }

  @action onItemPerPageChange(args: LimitOffset) {
    this.args.onItemPerPageChange(args);
  }

  @action selectRow(data: SkAppModel, value: boolean) {
    this.skPendingReview.selectRow(data.id, value);
  }

  get itemPerPageOptions() {
    return [10, 25, 50];
  }

  @action selectAllRow(value: boolean) {
    this.skPendingReview.selectAllRow(value);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::PendingReview::Table': typeof StoreknoxDiscoverPendingReviewTableComponent;
  }
}
