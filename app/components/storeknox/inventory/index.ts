// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';

import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import ENUMS from 'irene/enums';
import type SkAppModel from 'irene/models/sk-app';

type SkAppsQueryResponse = DS.AdapterPopulatedRecordArray<SkAppModel> & {
  meta: { count: number };
};

export default class StoreknoxInventoryComponent extends Component {
  @service declare intl: IntlService;
  @service declare store: Store;

  @tracked showWelcomeModal = false;
  @tracked totalInventoryAppsCount = 0;
  @tracked totalDisabledAppsCount = 0;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.getTabItemsCount.perform();
  }

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.storeknox.discover.result',
        linkTitle: this.intl.t('storeknox.homeTitle'),
      },
      {
        route: 'authenticated.storeknox.inventory.app-list',
        linkTitle: this.intl.t('storeknox.inventory'),
      },
    ];
  }

  get tabItems() {
    return [
      {
        id: 'app-inventory',
        route: 'authenticated.storeknox.inventory.app-list',
        label: this.intl.t('storeknox.appInventory'),
        hasBadge: this.totalInventoryAppsCount > 0,
        badgeCount: this.totalInventoryAppsCount,
      },
      // {
      //   id: 'disabled-apps',
      //   route: 'authenticated.storeknox.inventory.disabled-apps',
      //   label: this.intl.t('storeknox.disabledApps'),
      //   activeRoutes: 'authenticated.storeknox.inventory.disabled-apps',
      //   hasBadge: this.totalDisabledAppsCount > 0,
      //   badgeCount: this.totalDisabledAppsCount,
      // },
    ];
  }

  @action closeWelcomeModal() {
    this.showWelcomeModal = false;
  }

  getTabItemsCount = task(async () => {
    this.totalInventoryAppsCount = (
      (await this.store.query('sk-app', {
        approval_status: ENUMS.SK_APP_APPROVAL_STATUS.APPROVED,
        app_status: ENUMS.SK_APP_STATUS.ACTIVE,
      })) as SkAppsQueryResponse
    ).meta.count;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory': typeof StoreknoxInventoryComponent;
  }
}
