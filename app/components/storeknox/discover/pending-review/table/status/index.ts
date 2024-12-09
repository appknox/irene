import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import dayjs from 'dayjs';

import type SkAppModel from 'irene/models/sk-app';
import type SkPendingReviewService from 'irene/services/sk-pending-review';

interface StoreknoxDiscoverPendingReviewTableStatusSignature {
  Args: {
    data: SkAppModel;
    loading: boolean;
  };
}

export default class StoreknoxDiscoverPendingReviewTableStatusComponent extends Component<StoreknoxDiscoverPendingReviewTableStatusSignature> {
  @service declare skPendingReview: SkPendingReviewService;

  @action
  approveApp(id: string) {
    this.skPendingReview.approveRejectApp.perform(id, true);
  }

  @action
  rejectApp(id: string) {
    this.skPendingReview.approveRejectApp.perform(id, false);
  }

  get approvedOn() {
    return dayjs(this.args.data.approvedOn).format('MMMM D, YYYY, HH:mm');
  }

  get rejectedOn() {
    return dayjs(this.args.data.rejectedOn).format('MMMM D, YYYY, HH:mm');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::PendingReview::Table::Status': typeof StoreknoxDiscoverPendingReviewTableStatusComponent;
  }
}
