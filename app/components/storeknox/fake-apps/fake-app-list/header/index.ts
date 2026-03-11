import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface StoreknoxFakeAppsFakeAppListHeaderSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxFakeAppsFakeAppListHeaderComponent extends Component<StoreknoxFakeAppsFakeAppListHeaderSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @tracked anchorRef: HTMLElement | null = null;

  get menuItems() {
    return [
      {
        label: this.intl.t('storeknox.viewInInventory'),
        link: true,
        route: 'authenticated.storeknox.inventory-details.index',
        model: this.args.skInventoryApp.id,
      },
    ];
  }

  get lastFakeDetectionDate() {
    return dayjs(this.args.skInventoryApp?.lastFakeDetectionOn).format(
      'MMM DD, YYYY'
    );
  }

  @action
  handleCloseMenu() {
    this.anchorRef = null;
  }

  @action
  handleOpenMenu(event: MouseEvent) {
    event.stopPropagation();
    this.anchorRef = event.currentTarget as HTMLElement;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FakeAppList::Header': typeof StoreknoxFakeAppsFakeAppListHeaderComponent;
  }
}
