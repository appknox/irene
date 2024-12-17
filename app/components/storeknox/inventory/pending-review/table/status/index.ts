import Component from '@glimmer/component';
import { action } from '@ember/object';
import dayjs from 'dayjs';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

import parseError from 'irene/utils/parse-error';
import type IntlService from 'ember-intl/services/intl';

import type SkAppModel from 'irene/models/sk-app';
import type { StoreknoxInventoryPendingReviewsQueryParam } from 'irene/routes/authenticated/storeknox/inventory/pending-reviews';
import type SkPendingReviewService from 'irene/services/sk-pending-review';
import ENUMS from 'irene/enums';

interface StoreknoxInventoryPendingReviewTableStatusSignature {
  Args: {
    data: SkAppModel;
    loading: boolean;
    queryParams: StoreknoxInventoryPendingReviewsQueryParam;
  };
}

export default class StoreknoxInventoryPendingReviewTableStatusComponent extends Component<StoreknoxInventoryPendingReviewTableStatusSignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare skPendingReview: SkPendingReviewService;
  @service declare intl: IntlService;

  get buttonsLoading() {
    return this.rejectApp.isRunning || this.approveApp.isRunning;
  }

  get approvedOn() {
    return dayjs(this.args.data.approvedOn).format('MMMM D, YYYY, HH:mm');
  }

  get rejectedOn() {
    return dayjs(this.args.data.rejectedOn).format('MMMM D, YYYY, HH:mm');
  }

  get isPending() {
    return (
      this.args.data.approvalStatus ===
      ENUMS.SK_APPROVAL_STATUS.PENDING_APPROVAL
    );
  }

  get isApproved() {
    return this.args.data.approvalStatus === ENUMS.SK_APPROVAL_STATUS.APPROVED;
  }

  get isRejected() {
    return this.args.data.approvalStatus === ENUMS.SK_APPROVAL_STATUS.REJECTED;
  }

  get statusDetails() {
    if (this.isApproved) {
      return {
        color: 'success',
        text: this.intl.t('storeknox.approved'),
        by: this.args.data.approvedBy,
        date: this.approvedOn,
      };
    } else {
      return {
        color: 'error',
        text: this.intl.t('rejected'),
        by: this.args.data.rejectedBy,
        date: this.rejectedOn,
      };
    }
  }

  @action
  handleApproveApp() {
    this.approveApp.perform();
  }

  @action
  handleRejectApp() {
    this.rejectApp.perform();
  }

  approveApp = task(async () => {
    try {
      const skApp = this.args.data;

      await skApp.approveApp(skApp.id);

      const { app_limit, app_offset } = this.args.queryParams;

      this.skPendingReview.fetchPendingReviewApps.perform(
        app_limit,
        app_offset
      );

      this.notify.success(
        this.intl.t('storeknox.appAddedToInventory', {
          appName: skApp.title,
        })
      );

      this.skPendingReview.singleUpdate = true;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  rejectApp = task(async () => {
    try {
      const skApp = this.args.data;

      await skApp.rejectApp(skApp.id);

      const { app_limit, app_offset } = this.args.queryParams;

      this.skPendingReview.fetchPendingReviewApps.perform(
        app_limit,
        app_offset
      );

      this.notify.success(
        this.intl.t('storeknox.appRejected', {
          appName: skApp.title,
        })
      );

      this.skPendingReview.singleUpdate = true;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::PendingReview::Table::Status': typeof StoreknoxInventoryPendingReviewTableStatusComponent;
  }
}
