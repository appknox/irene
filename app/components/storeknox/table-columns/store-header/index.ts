import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';

export default class StoreknoxDiscoverTableColumnsStoreHeaderComponent extends Component {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked selectedPlatform: number = -1;
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
  selectPlatform(value: number) {
    this.selectedPlatform = value;

    this.filterApplied = value > -1;

    this.anchorRef = null;
  }

  @action
  clearFilter() {
    this.selectedPlatform = -1;

    this.filterApplied = false;

    this.anchorRef = null;
  }

  get platformObject() {
    return [
      {
        key: this.intl.t('all'),
        value: -1,
      },
      {
        key: this.intl.t('android'),
        value: ENUMS.PLATFORM.ANDROID,
      },
      {
        key: this.intl.t('ios'),
        value: ENUMS.PLATFORM.IOS,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::TableColumns::StoreHeader': typeof StoreknoxDiscoverTableColumnsStoreHeaderComponent;
  }
}
