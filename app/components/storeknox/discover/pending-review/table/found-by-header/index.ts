import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

export default class StoreknoxDiscoverPendingReviewTableFoundByHeaderComponent extends Component {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked selectedDiscovery: number = -1;
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
  selectDiscovery(value: number) {
    this.selectedDiscovery = value;

    if (value > -1) {
      this.filterApplied = true;
    } else {
      this.filterApplied = false;
    }

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
        value: 0,
      },
      {
        key: this.intl.t('storeknox.manualDiscovery'),
        value: 1,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::PendingReview::Table::FoundByHeader': typeof StoreknoxDiscoverPendingReviewTableFoundByHeaderComponent;
  }
}
