import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type { SbomComponentInventoryQueryParam } from 'irene/routes/authenticated/dashboard/sbom/component-inventory';

export default class AuthenticatedDashboardSbomComponentInventoryController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    queryParams: SbomComponentInventoryQueryParam;
  };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('sbomModule.allComponents'),
      route: 'authenticated.dashboard.sbom.component-inventory',
      routeGroup: 'sbom',

      parentCrumb: {
        title: this.intl.t('sbomModule.softwareCompositionAnalysis'),
        route: 'authenticated.dashboard.sbom.apps',
        routeGroup: 'sbom',
      },
    };
  }
}
