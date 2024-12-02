import Controller from '@ember/controller';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedSecurityFilesController extends Controller {
  declare model: {
    projectid: string;
  };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      route: 'authenticated.security.files',
      title: 'List of Files',
      models: [this.model.projectid],
      routeGroup: 'sec-dashboard',

      parentCrumb: {
        route: 'authenticated.security.projects',
        title: 'All Projects',
        routeGroup: 'sec-dashboard',
      },
    };
  }
}
