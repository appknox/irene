import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { ComponentInsightsModel } from 'irene/routes/authenticated/dashboard/sbom/component-insights';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardSbomComponentInsightsController extends Controller {
  @service declare intl: IntlService;

  declare model: ComponentInsightsModel;

  /** Display id of the vulnerability shown; empty selects the first. */
  queryParams = ['vuln'];

  vuln = '';

  /**
   * SBOM / All Components and Vulnerabilities (<app>) / Component Details.
   * The middle crumb returns to the Reachability insights tab.
   */
  get breadcrumbs(): AkBreadcrumbsItemProps {
    const { sbomProject, sbomFile, sbomComponent, projectLastFile } =
      this.model;

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('sbomModule.componentInsights.title'),
      route: 'authenticated.dashboard.sbom.component-insights',
      routeGroup: 'sbom',
      models: [
        sbomProject.id,
        sbomFile.id,
        sbomComponent.id,
        this.model.queryParams.sbom_component_parent_id,
      ],
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: `${this.intl.t('sbomModule.allComponentsAndVulnerabilities')} (${projectLastFile?.get('name')})`,
      route: 'authenticated.dashboard.sbom.scan-details',
      models: [sbomProject.id, sbomFile.id],
      routeGroup: 'sbom',
    };

    return {
      ...crumb,
      parentCrumb,
      fallbackCrumbs: [
        {
          title: this.intl.t('SBOM'),
          route: 'authenticated.dashboard.sbom.apps',
          isRootCrumb: true,
          stopCrumbGeneration: true,
        },
        parentCrumb,
        crumb,
      ],
    };
  }
}
