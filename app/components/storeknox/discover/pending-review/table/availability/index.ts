import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import SkAppModel from 'irene/models/sk-app';

interface StoreknoxDiscoverPendingReviewTableAvailabilitySignature {
  Args: {
    data: SkAppModel;
    loading: boolean;
  };
}

export default class StoreknoxDiscoverPendingReviewTableAvailabilityComponent extends Component<StoreknoxDiscoverPendingReviewTableAvailabilitySignature> {
  @service declare intl: IntlService;

  get appAvailability() {
    const available = this.args.data.available;
    if (available === 'VAPT') {
      return {
        svgComponent: 'ak-svg/vapt-indicator',
        indicatorInfo: this.intl.t('storeknox.vaptIndicatorText', {
          htmlSafe: true,
        }),
      };
    } else if (available) {
      return {
        svgComponent: 'ak-svg/sm-indicator',
        indicatorInfo: this.intl.t('storeknox.smIndicatorText', {
          htmlSafe: true,
        }),
      };
    }
    return {
      svgComponent: 'ak-svg/info-indicator',
      indicatorInfo: this.intl.t('storeknox.infoIndicatorWhitelabelText', {
        htmlSafe: true,
      }),
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::PendingReview::Table::Availability': typeof StoreknoxDiscoverPendingReviewTableAvailabilityComponent;
  }
}
