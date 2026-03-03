import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxFakeAppsFakeAppDetailsController extends Controller {
  @service declare intl: IntlService;

  declare model: { skInventoryApp: SkInventoryAppModel };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const pkg = this.model?.skInventoryApp?.appMetadata?.packageName;

    return {
      title: `${this.intl.t('storeknox.fakeAppDetails')} (${pkg})`,
      route: 'authenticated.storeknox.fake-apps.fake-app-details.index',
      models: [this.model?.skInventoryApp?.id],
      routeGroup: 'storeknox/fake-apps',

      parentCrumb: {
        title: this.intl.t('storeknox.fakeAppsTitle'),
        routeGroup: 'storeknox/fake-apps',
        route: 'authenticated.storeknox.fake-apps.index',
      },
    };
  }
}
