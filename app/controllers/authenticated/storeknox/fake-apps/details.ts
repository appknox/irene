import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type SkFakeAppModel from 'irene/models/sk-fake-app';

export default class AuthenticatedStoreknoxFakeAppsDetailsController extends Controller {
  @service declare intl: IntlService;

  declare model: SkFakeAppModel;

  queryParams = ['app_limit', 'app_offset', 'fake_app_detection_enabled'];

  app_limit = 10;
  app_offset = 0;
  fake_app_detection_enabled = true;

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
