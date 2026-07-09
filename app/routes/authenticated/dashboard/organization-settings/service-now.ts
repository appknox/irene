import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type { ModelFrom } from 'irene/utils/types';
import type AuthenticatedOrganizationSettingsRoute from 'irene/routes/authenticated/dashboard/organization-settings';

export default class AuthenticatedDashboardOrganizationSettingsServiceNowRoute extends AkBreadcrumbsRoute {
  async model() {
    const { user } = this.modelFor(
      'authenticated.dashboard.organization-settings'
    ) as ModelFrom<AuthenticatedOrganizationSettingsRoute>;

    return { user };
  }
}
