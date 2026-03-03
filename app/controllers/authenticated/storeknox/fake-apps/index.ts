import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxFakeAppsIndexController extends Controller {
  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('storeknox.fakeAppsTitle'),
      route: 'authenticated.storeknox.fake-apps.index',
      routeGroup: 'storeknox/fake-apps',
      stopCrumbGeneration: true,
      isRootCrumb: true,
    };
  }
}
