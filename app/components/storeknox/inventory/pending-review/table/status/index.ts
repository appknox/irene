import Component from '@glimmer/component';
import { action } from '@ember/object';
import dayjs from 'dayjs';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';
import type SkAppModel from 'irene/models/sk-app';
import type SkPendingReviewService from 'irene/services/sk-pending-review';

interface StoreknoxInventoryPendingReviewTableStatusSignature {
  Args: {
    data: SkAppModel;
    loading: boolean;
  };
}

export default class StoreknoxInventoryPendingReviewTableStatusComponent extends Component<StoreknoxInventoryPendingReviewTableStatusSignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare skPendingReview: SkPendingReviewService;
  @service declare intl: IntlService;

  get buttonsLoading() {
    return this.rejectApp.isRunning || this.approveApp.isRunning;
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

  // TODO: Review when feature is to be worked on
  // Intended for Review Logs table
  get approvedOn() {
    return dayjs(this.args.data.approvedOn).format('MMMM D, YYYY, HH:mm');
  }

  get rejectedOn() {
    return dayjs(this.args.data.rejectedOn).format('MMMM D, YYYY, HH:mm');
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

      await waitForPromise(skApp.approveApp(skApp.id));

      this.skPendingReview.reload();

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

      await waitForPromise(skApp.rejectApp(skApp.id));

      this.skPendingReview.reload();

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
