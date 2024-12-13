import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';

export default class StoreknoxInventoryPendingReviewTableFoundByHeaderComponent extends Component {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked selectedDiscovery: number = -1;
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
  selectDiscovery(value: number) {
    this.selectedDiscovery = value;

    this.filterApplied = value > -1;

    this.anchorRef = null;
  }

  @action
  clearFilter() {
    this.selectedDiscovery = -1;

    this.filterApplied = false;

    this.anchorRef = null;
  }

  get discoveryObject() {
    return [
      {
        key: this.intl.t('all'),
        value: -1,
      },
      {
        key: this.intl.t('storeknox.autoDiscovery'),
        value: ENUMS.SK_DISCOVERY.AUTO,
      },
      {
        key: this.intl.t('storeknox.manualDiscovery'),
        value: ENUMS.SK_DISCOVERY.MANUAL,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::PendingReview::Table::FoundByHeader': typeof StoreknoxInventoryPendingReviewTableFoundByHeaderComponent;
  }
}
