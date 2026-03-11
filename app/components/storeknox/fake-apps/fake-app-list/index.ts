import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SkFakeAppsListService from 'irene/services/sk-fake-apps-list';

export interface StoreknoxFakeAppsFakeAppListSignature {
  Element: HTMLElement;
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxFakeAppsFakeAppListComponent extends Component<StoreknoxFakeAppsFakeAppListSignature> {
  @service declare intl: IntlService;
  @service('sk-fake-apps-list')
  declare skFakeAppsListService: SkFakeAppsListService;

  get isInitializing() {
    return this.args.skInventoryApp?.fakeAppDetectionIsInitializing;
  }

  get fakeAppCounts() {
    return (
      this.skFakeAppsListService.fakeAppCounts ??
      this.args.skInventoryApp?.fakeAppCounts
    );
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
        route: 'authenticated.storeknox.fake-apps.fake-app-list.index',
        models: [this.args.skInventoryApp?.id],
        label: this.intl.t('storeknox.brandAbuse'),
        count: this.fakeAppCounts?.brand_abuse,
        iconClass: 'brand-abuse',
      },
      {
        id: 'fake-app',
        route: 'authenticated.storeknox.fake-apps.fake-app-list.fake-apps',
        models: [this.args.skInventoryApp?.id],
        label: this.intl.t('storeknox.fakeApps.fakeApp'),
        count: this.fakeAppCounts?.fake_app,
        iconClass: 'fake-app',
      },
      {
        id: 'ignored',
        route: 'authenticated.storeknox.fake-apps.fake-app-list.ignored',
        models: [this.args.skInventoryApp?.id],
        label: this.intl.t('storeknox.fakeApps.ignored'),
        count: this.fakeAppCounts?.ignored,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FakeAppList': typeof StoreknoxFakeAppsFakeAppListComponent;
  }
}
