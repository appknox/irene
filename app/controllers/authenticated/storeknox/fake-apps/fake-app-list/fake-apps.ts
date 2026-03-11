import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { StoreknoxFakeAppListRouteModel } from 'irene/routes/authenticated/storeknox/fake-apps/fake-app-list';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxInventoryDetailsFakeAppListFakeAppsController extends Controller {
  @service declare intl: IntlService;

  declare model: StoreknoxFakeAppListRouteModel;

  get skInventoryApp() {
    return this.model.skInventoryApp;
  }

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const models = [this.model.skInventoryApp?.id];

    const crumb: AkBreadcrumbsItemProps = {
      title: this.model.skInventoryApp?.appMetadata?.packageName,
      routeGroup: 'storeknox/fake-apps',
      models,
      route: 'authenticated.storeknox.fake-apps.fake-app-list.fake-apps',
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.intl.t('storeknox.fakeAppsTitle'),
      route: 'authenticated.storeknox.fake-apps.index',
      routeGroup: 'storeknox/fake-apps',
    };

    return {
      ...crumb,
      parentCrumb,
      siblingRoutes: [
        'authenticated.storeknox.fake-apps.fake-app-list.index',
        'authenticated.storeknox.fake-apps.fake-app-list.ignored',
      ],
      fallbackCrumbs: [parentCrumb, crumb],
    };
  }
}
