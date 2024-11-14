import Controller from '@ember/controller';
import type SecurityFileModel from 'irene/models/security/file';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedSecurityAnalysisController extends Controller {
  declare model: SecurityFileModel;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const analysisFile = this.model;
    const analysisProjectID = analysisFile.get('project')?.get('id') as string;

    const crumb: AkBreadcrumbsItemProps = {
      route: 'authenticated.security.file',
      title: 'File Details',
      models: [analysisFile?.get('id')],
      routeGroup: 'sec-dashboard',
    };

    const parentCrumb: AkBreadcrumbsItemProps = {
      route: 'authenticated.security.files',
      title: 'List of Files',
      models: [analysisProjectID],
      routeGroup: 'sec-dashboard',
    };

    return {
      ...crumb,
      parentCrumb,

      fallbackCrumbs: [
        {
          route: 'authenticated.security.projects',
          title: 'All Projects',
        },
        parentCrumb,
        crumb,
      ],
    };
  }
}
