import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { StoreknoxFakeAppListRouteModel } from 'irene/routes/authenticated/storeknox/fake-apps/fake-app-list';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxInventoryDetailsFakeAppsListIndexController extends Controller {
  @service declare intl: IntlService;

  declare model: StoreknoxFakeAppListRouteModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const models = [this.model.skInventoryApp?.id];

    const crumb: AkBreadcrumbsItemProps = {
      title: this.model.skInventoryApp?.appMetadata?.packageName,
      route: 'authenticated.storeknox.fake-apps.fake-app-list.index',
      models,
      routeGroup: 'storeknox/fake-apps',
      siblingRoutes: [
        'authenticated.storeknox.fake-apps.fake-app-list.fake-apps',
        'authenticated.storeknox.fake-apps.fake-app-list.ignored',
      ],
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.intl.t('storeknox.fakeAppsTitle'),
      route: 'authenticated.storeknox.fake-apps.index',
      routeGroup: 'storeknox/fake-apps',
    };

    return {
      ...crumb,
      parentCrumb,
      fallbackCrumbs: [parentCrumb, crumb],
    };
  }
}
