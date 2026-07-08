import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type SkThirdPartyAppModel from 'irene/models/sk-third-party-app';

export default class AuthenticatedStoreknoxThirdPartyScansAppDetailsController extends Controller {
  @service declare intl: IntlService;

  declare model: SkThirdPartyAppModel;

  queryParams = ['tp_store', 'tp_region', 'tp_version'];

  tp_store = 'appstore';
  tp_region = '';
  tp_version = '';

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.intl.t('storeknox.thirdPartyScansTitle'),
      route: 'authenticated.storeknox.third-party-scans.index',
      routeGroup: 'storeknox/third-party-scans',
    };

    const crumb: AkBreadcrumbsItemProps = {
      title: this.model?.title ?? this.model?.packageName,
      route: 'authenticated.storeknox.third-party-scans.app-details',
      models: [this.model?.packageName],
      routeGroup: 'storeknox/third-party-scans',
    };

    return {
      ...crumb,
      parentCrumb,
      fallbackCrumbs: [parentCrumb, crumb],
    };
  }
}
