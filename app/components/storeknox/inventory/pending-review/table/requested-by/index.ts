import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type SkAppModel from 'irene/models/sk-app';

interface StoreknoxInventoryPendingReviewTableRequestedBySignature {
  Args: {
    data: SkAppModel;
    loading: boolean;
  };
}

export default class StoreknoxInventoryPendingReviewTableRequestedByComponent extends Component<StoreknoxInventoryPendingReviewTableRequestedBySignature> {
  @service declare intl: IntlService;

  get addedOn() {
    return dayjs(this.args.data.addedOn).format('MMMM D, YYYY, HH:mm');
  }

  get appSource() {
    return this.args.data.appSource;
  }

  get foundBy() {
    if (this.appSource === ENUMS.SK_DISCOVERY.MANUAL) {
      return this.intl.t('storeknox.manualDiscovery');
    } else {
      return this.intl.t('storeknox.autoDiscovery');
    }
  }

  get isManual() {
    return this.appSource === ENUMS.SK_DISCOVERY.MANUAL;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::PendingReview::Table::RequestedBy': typeof StoreknoxInventoryPendingReviewTableRequestedByComponent;
  }
}
