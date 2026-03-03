import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

export interface StoreknoxFakeAppsFakeAppDetailsSignature {
  Element: HTMLElement;
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxFakeAppsFakeAppDetailsComponent extends Component<StoreknoxFakeAppsFakeAppDetailsSignature> {
  @service declare intl: IntlService;

  get tabItems() {
    const counts = this.args.skInventoryApp?.fakeAppCounts;

    return [
      {
        id: 'brand-abuse',
        route: 'authenticated.storeknox.fake-apps.fake-app-details.index',
        label: this.intl.t('storeknox.brandAbuse'),
        count: counts?.brand_abuse,
      },
      {
        id: 'fake-app',
        route: 'authenticated.storeknox.fake-apps.fake-app-details.fake-app',
        label: this.intl.t('storeknox.fakeApps.fakeApp'),
        count: counts?.fake_app,
      },
      {
        id: 'ignored',
        route: 'authenticated.storeknox.fake-apps.fake-app-details.ignored',
        label: this.intl.t('storeknox.fakeApps.ignored'),
        count: counts?.ignored,
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FakeAppDetails': typeof StoreknoxFakeAppsFakeAppDetailsComponent;
  }
}
