import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

export default class StoreknoxDiscoverPendingReviewTableAvailabilityHeaderComponent extends Component {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked selectedAvailability: number = -1;
  @tracked filterApplied: boolean = false;

  @action
  handleClick(event: FocusEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleOptionsClose() {
    this.anchorRef = null;
  }

  @action
  selectAvailability(value: number) {
    this.selectedAvailability = value;

    if (value > -1) {
      this.filterApplied = true;
    } else {
      this.filterApplied = false;
    }

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
        value: 0,
      },
      {
        key: this.intl.t('appMonitoring'),
        value: 1,
      },
      {
        key: this.intl.t('none'),
        value: 2,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::PendingReview::Table::AvailabilityHeader': typeof StoreknoxDiscoverPendingReviewTableAvailabilityHeaderComponent;
  }
}
