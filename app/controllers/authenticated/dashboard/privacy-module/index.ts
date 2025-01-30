import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardPrivacyModuleIndexController extends Controller {
  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('privacyModule.title'),
      routeGroup: 'privacy-module',
      route: 'authenticated.dashboard.privacy-module.index',
      isRootCrumb: true,
      stopCrumbGeneration: true,
    };
  }
}
