import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxFakeAppsFakeAppDetailsFakeAppController extends Controller {
  @service declare intl: IntlService;

  declare model: { skInventoryApp: SkInventoryAppModel };

  get showList() {
    const app = this.model.skInventoryApp;
    const counts = app?.fakeAppCounts;
    const allCountsZero =
      !counts ||
      (counts.brand_abuse === 0 &&
        counts.fake_app === 0 &&
        counts.ignored === 0);

    return !app?.fakeAppDetectionIsInitializing && !allCountsZero;
  }

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const id = this.model.skInventoryApp.id;
    const pkg = this.model.skInventoryApp?.appMetadata?.packageName;

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('storeknox.fakeApps.fakeApp'),
      route: 'authenticated.storeknox.fake-apps.fake-app-details.fake-app',
      models: [id],
      routeGroup: 'storeknox/fake-apps',
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: `${this.intl.t('storeknox.fakeAppDetails')} (${pkg})`,
      route: 'authenticated.storeknox.fake-apps.fake-app-details.index',
      models: [id],
      routeGroup: 'storeknox/fake-apps',
    };

    return {
      ...crumb,
      parentCrumb,
      siblingRoutes: [
        'authenticated.storeknox.fake-apps.fake-app-details.index',
        'authenticated.storeknox.fake-apps.fake-app-details.ignored',
      ],
      fallbackCrumbs: [
        {
          title: this.intl.t('storeknox.fakeAppsTitle'),
          routeGroup: 'storeknox/fake-apps',
          route: 'authenticated.storeknox.fake-apps.index',
        },
        parentCrumb,
        crumb,
      ],
    };
  }
}
