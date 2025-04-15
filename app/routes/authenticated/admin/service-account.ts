import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedAdminServiceAccountRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare router: RouterService;
  @service declare organization: OrganizationService;

  get isPublicApiEnabled() {
    return this.organization.selected?.features?.public_apis;
  }

  activate() {
    if (this.isPublicApiEnabled) {
      return;
    }

    this.router.transitionTo('authenticated.admin.user-management');
  }
}
