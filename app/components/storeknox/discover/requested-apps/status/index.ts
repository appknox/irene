import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SkRequestedAppModel from 'irene/models/sk-requested-app';
import ENUMS from 'irene/enums';

export interface StoreknoxDiscoverRequestedAppsStatusSignature {
  Args: {
    data: SkRequestedAppModel;
    loading: boolean;
  };
}

export default class StoreknoxDiscoverRequestedAppsStatusComponent extends Component<StoreknoxDiscoverRequestedAppsStatusSignature> {
  @service declare intl: IntlService;

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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::RequestedApps::Status': typeof StoreknoxDiscoverRequestedAppsStatusComponent;
  }
}
