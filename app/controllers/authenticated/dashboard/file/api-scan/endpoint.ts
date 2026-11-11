import Controller from '@ember/controller';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type FileModel from 'irene/models/file';
import { type AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedDashboardFileApiScanEndpointController extends Controller {
  @service declare intl: IntlService;

  declare model: { file: FileModel; urlId: string };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const fileModels = [this.model?.file?.id];

    const crumb: AkBreadcrumbsItemProps = {
      title: this.intl.t('apiScanModule.endpointVulnerabilities'),
      route: 'authenticated.dashboard.file.api-scan.endpoint',
      models: [this.model?.file?.id, this.model?.urlId],
      routeGroup: 'project/files',
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      title: this.intl.t('apiScan'),
      route: 'authenticated.dashboard.file.api-scan.index',
      models: fileModels,
      routeGroup: 'project/files',
    };

    return {
      ...crumb,
      parentCrumb,

      fallbackCrumbs: [
        {
          title: this.intl.t('allProjects'),
          route: 'authenticated.dashboard.projects',
        },
        {
          title: this.intl.t('scanDetails'),
          route: 'authenticated.dashboard.file',
          models: fileModels,
          routeGroup: 'project/files',
        },
        parentCrumb,
        crumb,
      ],
    };
  }
}
