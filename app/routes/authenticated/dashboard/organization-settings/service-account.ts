import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { ScrollToTop } from 'irene/utils/scroll-to-top';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

export interface OrganizationSettingsServiceAccountRouteQueryParams {
  sa_limit: number;
  sa_offset: number;
  show_system_created: boolean;
}

export default class AuthenticatedDashboardOrganizationSettingsServiceAccountRoute extends ScrollToTop(
  AkBreadcrumbsRoute
) {
  @service declare router: RouterService;
  @service declare me: MeService;
  @service declare organization: OrganizationService;

  queryParams = {
    sa_limit: {
      refreshModel: true,
    },
    sa_offset: {
      refreshModel: true,
    },
    show_system_created: {
      refreshModel: true,
    },
  };

  get isPublicApiEnabled() {
    return this.organization.selected?.features?.public_apis;
  }

  get isOwnerOrAdmin() {
    return this.me.org?.get('is_owner') || this.me.org?.get('is_admin');
  }

  activate() {
    if (this.isPublicApiEnabled && this.isOwnerOrAdmin) {
      return;
    }

    this.router.transitionTo('authenticated.dashboard.projects');
  }

  model(
    queryParams: Partial<OrganizationSettingsServiceAccountRouteQueryParams>
  ) {
    return {
      queryParams,
    };
  }
}
