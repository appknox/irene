import Controller from '@ember/controller';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedSecurityProjectsController extends Controller {
  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      route: 'authenticated.security.projects',
      title: 'All Projects',
      isRootCrumb: true,
      stopCrumbGeneration: true,
      routeGroup: 'sec-dashboard',
    };
  }
}
