import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxThirdPartyScansIndexController extends Controller {
  @service declare intl: IntlService;

  queryParams = [
    'tp_limit',
    'tp_offset',
    'tp_store',
    'tp_region',
    'tp_risk_status',
    'tp_filter',
  ];

  tp_limit = 10;
  tp_offset = 0;
  tp_store = 'appstore';
  tp_region = '';
  tp_risk_status = -1;
  tp_filter = '';

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('storeknox.thirdPartyScansTitle'),
      route: 'authenticated.storeknox.third-party-scans.index',
      routeGroup: 'storeknox/third-party-scans',
      isRootCrumb: true,
      stopCrumbGeneration: true,
    };
  }
}
