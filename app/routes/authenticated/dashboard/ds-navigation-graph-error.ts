import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

interface NavigationGraphRouteErrorOptions {
  isFileValid: boolean;
  fileId: string;
}

export class NavigationGraphRouteError extends Error {
  isFileValid: boolean;
  fileId: string;

  constructor(opts: NavigationGraphRouteErrorOptions) {
    super();
    this.isFileValid = opts.isFileValid;
    this.fileId = opts.fileId;
  }
}

export default class AuthenticatedDashboardDsNavigationGraphErrorRoute extends AkBreadcrumbsRoute {}
