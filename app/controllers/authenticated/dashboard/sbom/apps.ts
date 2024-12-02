import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardSbomAppsController extends Controller {
  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('SBOM'),
      route: 'authenticated.dashboard.sbom.apps',
      routeGroup: 'sbom',
      isRootCrumb: true,
      stopCrumbGeneration: true,
    };
  }
}
