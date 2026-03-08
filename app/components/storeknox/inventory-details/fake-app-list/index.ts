import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface StoreknoxInventoryDetailsFakeAppListSignature {
  Element: HTMLElement;
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsFakeAppListComponent extends Component<StoreknoxInventoryDetailsFakeAppListSignature> {
  @service declare intl: IntlService;

  get isInitializing() {
    return this.args.skInventoryApp?.fakeAppDetectionIsInitializing;
  }

  get fakeAppCounts() {
    return this.args.skInventoryApp?.fakeAppCounts;
  }

  get allCountsZero() {
    return this.args.skInventoryApp?.allFakeAppsCountsAreZero;
  }

  get showSuccessState() {
    return !this.isInitializing && this.allCountsZero;
  }

  get showTabs() {
    return !this.isInitializing && !this.allCountsZero;
  }

  get tabItems() {
    return [
      {
        id: 'brand-abuse',
        route: 'authenticated.storeknox.inventory-details.fake-app-list.index',
        models: [this.args.skInventoryApp?.id],
        label: this.intl.t('storeknox.brandAbuse'),
        count: this.fakeAppCounts?.brand_abuse,
      },
      {
        id: 'fake-app',
        route:
          'authenticated.storeknox.inventory-details.fake-app-list.fake-apps',
        models: [this.args.skInventoryApp?.id],
        label: this.intl.t('storeknox.fakeApps.fakeApp'),
        count: this.fakeAppCounts?.fake_app,
      },
      {
        id: 'ignored',
        route:
          'authenticated.storeknox.inventory-details.fake-app-list.ignored',
        models: [this.args.skInventoryApp?.id],
        label: this.intl.t('storeknox.fakeApps.ignored'),
        count: this.fakeAppCounts?.ignored,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::FakeAppList': typeof StoreknoxInventoryDetailsFakeAppListComponent;
  }
}
