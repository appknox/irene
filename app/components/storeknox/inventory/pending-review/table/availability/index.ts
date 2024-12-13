import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SkAppModel from 'irene/models/sk-app';

interface StoreknoxInventoryPendingReviewTableAvailabilitySignature {
  Args: {
    data: SkAppModel;
    loading: boolean;
  };
}

export default class StoreknoxInventoryPendingReviewTableAvailabilityComponent extends Component<StoreknoxInventoryPendingReviewTableAvailabilitySignature> {
  @service declare intl: IntlService;

  get appAvailability() {
    const data = this.args.data;

    if (data.availability.appknox) {
      return {
        svgComponent: 'ak-svg/vapt-indicator',
        indicatorInfo: this.intl.t('storeknox.vaptIndicatorText', {
          htmlSafe: true,
        }),
      };
    } else if (data.availability.storeknox) {
      return {
        svgComponent: 'ak-svg/sm-indicator',
        indicatorInfo: this.intl.t('storeknox.smIndicatorText', {
          htmlSafe: true,
        }),
      };
    } else {
      return {
        svgComponent: 'ak-svg/info-indicator',
        indicatorInfo: this.intl.t('storeknox.infoIndicatorWhitelabelText', {
          htmlSafe: true,
        }),
      };
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::PendingReview::Table::Availability': typeof StoreknoxInventoryPendingReviewTableAvailabilityComponent;
  }
}
