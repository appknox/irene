import { service } from '@ember/service';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

import type { ModelFrom } from 'irene/utils/types';
import type MeService from 'irene/services/me';
import type IreneAjaxService from 'irene/services/ajax';
import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';
import type AuthenticatedOrganizationSettingsRoute from 'irene/routes/authenticated/dashboard/organization-settings';

export type OrganizationSettingsRouteModel = {
  user: UserModel;
  organization: OrganizationModel;
  me: MeService;
};

export default class AuthenticatedDashboardOrganizationSettingsIndexRoute extends AkBreadcrumbsRoute {
  @service declare me: MeService;
  @service declare ajax: IreneAjaxService;

  async model(): Promise<OrganizationSettingsRouteModel> {
    const { organization, user } = this.modelFor(
      'authenticated.dashboard.organization-settings'
    ) as ModelFrom<AuthenticatedOrganizationSettingsRoute>;

    return {
      user,
      organization,
      me: this.me,
    };
  }
}
