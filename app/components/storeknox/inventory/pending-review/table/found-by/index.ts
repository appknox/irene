import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';
import { inject as service } from '@ember/service';

import type SkAppModel from 'irene/models/sk-app';
import ENUMS from 'irene/enums';

interface StoreknoxInventoryPendingReviewTableFoundBySignature {
  Args: {
    data: SkAppModel;
    loading: boolean;
  };
}

export default class StoreknoxInventoryPendingReviewTableFoundByComponent extends Component<StoreknoxInventoryPendingReviewTableFoundBySignature> {
  @service declare intl: IntlService;

  get addedOn() {
    return dayjs(this.args.data.addedOn).format('MMMM D, YYYY, HH:mm');
  }

  get foundBy() {
    const appSource = this.args.data.appSource;

    if (appSource === ENUMS.SK_DISCOVERY.MANUAL) {
      return this.intl.t('storeknox.manualDiscovery');
    } else {
      return this.intl.t('storeknox.autoDiscovery');
    }
  }

  get isManual() {
    const appSource = this.args.data.appSource;

    return appSource === ENUMS.SK_DISCOVERY.MANUAL;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::PendingReview::Table::FoundBy': typeof StoreknoxInventoryPendingReviewTableFoundByComponent;
  }
}
