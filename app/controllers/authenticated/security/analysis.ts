import Controller from '@ember/controller';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';
import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type SecurityFileModel from 'irene/models/security/file';

export default class AuthenticatedSecurityAnalysisController extends Controller {
  declare model: {
    analysisDetails: SecurityAnalysisModel;
    analysisFile: SecurityFileModel;
    analysisProjectID: string;
    analysisId: string;
  };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    const analysisDetails = this.model.analysisDetails;
    const analysisFile = this.model.analysisFile;

    const crumb: AkBreadcrumbsItemProps = {
      route: 'authenticated.security.analysis',
      title: 'Analysis Details',
      models: [analysisDetails?.get('id')],
      routeGroup: 'sec-dashboard',
    };

    const parentCrumb: AkBreadcrumbsItemProps['parentCrumb'] = {
      route: 'authenticated.security.file',
      title: 'File Details',
      models: [analysisFile?.get('id')],
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
        {
          route: 'authenticated.security.files',
          title: 'List of Files',
          models: [this.model.analysisProjectID],
        },
        parentCrumb,
        crumb,
      ],
    };
  }
}
