import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { StoreknoxFakeAppsDetailsModel } from 'irene/routes/authenticated/storeknox/fake-apps/details';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxFakeAppsDetailsController extends Controller {
  @service declare intl: IntlService;

  declare model: StoreknoxFakeAppsDetailsModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: `${this.intl.t('storeknox.fakeAppsTitle')} (${this.model?.title})`,
      route: 'authenticated.storeknox.fake-apps.details',
      models: [String(this.model?.id)],
      routeGroup: 'storeknox/fake-apps',

      parentCrumb: {
        title: this.intl.t('storeknox.fakeAppsTitle'),
        routeGroup: 'storeknox/fake-apps',
        route: 'authenticated.storeknox.fake-apps.index',
      },
    };
  }
}
