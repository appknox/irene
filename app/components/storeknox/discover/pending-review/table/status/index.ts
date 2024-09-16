import Component from '@glimmer/component';
import Store from '@ember-data/store';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import MeService from 'irene/services/me';
import SkAppModel from 'irene/models/sk-app';
import SkPendingReviewService from 'irene/services/sk-pending-review';

interface StoreknoxDiscoverPendingReviewTableStatusSignature {
  Args: {
    data: SkAppModel;
    loading: boolean;
  };
}

export default class StoreknoxDiscoverPendingReviewTableStatusComponent extends Component<StoreknoxDiscoverPendingReviewTableStatusSignature> {
  @service declare me: MeService;
  @service declare store: Store;
  @service declare skPendingReview: SkPendingReviewService;

  @action
  approveApp(id: string) {
    this.skPendingReview.approveRejectApp.perform(id, true);
  }

  @action
  rejectApp(id: string) {
    this.skPendingReview.approveRejectApp.perform(id, false);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::PendingReview::Table::Status': typeof StoreknoxDiscoverPendingReviewTableStatusComponent;
  }
}
