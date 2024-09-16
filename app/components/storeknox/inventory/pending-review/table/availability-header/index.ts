import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';

export default class StoreknoxInventoryPendingReviewTableAvailabilityHeaderComponent extends Component {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked selectedAvailability: number = -1;
  @tracked filterApplied: boolean = false;

  @action
  handleClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleOptionsClose() {
    this.anchorRef = null;
  }

  @action
  selectAvailability(value: number) {
    this.selectedAvailability = value;

    this.filterApplied = value > -1;

    this.anchorRef = null;
  }

  @action
  clearFilter() {
    this.selectedAvailability = -1;

    this.filterApplied = false;

    this.anchorRef = null;
  }

  get availabilityObject() {
    return [
      {
        key: this.intl.t('all'),
        value: -1,
      },
      {
        key: this.intl.t('storeknox.vapt'),
        value: ENUMS.SK_AVAILABILITY.VAPT,
      },
      {
        key: this.intl.t('appMonitoring'),
        value: ENUMS.SK_AVAILABILITY.APP_MONITORING,
      },
      {
        key: this.intl.t('none'),
        value: ENUMS.SK_AVAILABILITY.NONE,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::PendingReview::Table::AvailabilityHeader': typeof StoreknoxInventoryPendingReviewTableAvailabilityHeaderComponent;
  }
}
