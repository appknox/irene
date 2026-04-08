import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { StoreknoxFakeAppDetailsRouteModel } from 'irene/routes/authenticated/storeknox/fake-apps/fake-app-details';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxFakeAppsFakeAppDetailsController extends Controller {
  @service declare intl: IntlService;

  declare model: StoreknoxFakeAppDetailsRouteModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.model?.skInventoryApp?.appMetadata?.packageName,
      route: 'authenticated.storeknox.fake-apps.fake-app-list.index',
      models: [this.model?.skInventoryApp.id],
      routeGroup: 'storeknox/fake-apps',
    };

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('details'),
      route: 'authenticated.storeknox.fake-apps.fake-app-details',
      models: [this.model?.skInventoryApp.id, this.model?.fakeApp.id],
      routeGroup: 'storeknox/fake-apps',
    };

    return {
      ...crumb,
      parentCrumb,

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
