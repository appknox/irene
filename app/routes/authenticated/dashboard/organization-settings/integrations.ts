import { service } from '@ember/service';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

import type { AjaxError } from 'irene/services/ajax';
import type { ModelFrom } from 'irene/utils/types';
import type MeService from 'irene/services/me';
import type IreneAjaxService from 'irene/services/ajax';
import type AuthenticatedOrganizationSettingsRoute from 'irene/routes/authenticated/dashboard/organization-settings';
import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';

type IntegratedUser = {
  avatar_url: string;
  created_on: string;
  html_url: string;
  login: string;
  name: string | null;
  updated_on: string;
};

export type OrganizationSettingsIntegrationsRouteModel = {
  integratedUser: IntegratedUser | null;
  reconnect: boolean;
  user: UserModel;
  organization: OrganizationModel;
};

export default class AuthenticatedDashboardOrganizationSettingsIntegrationsRoute extends AkBreadcrumbsRoute {
  @service declare me: MeService;
  @service declare ajax: IreneAjaxService;

  async model(): Promise<OrganizationSettingsIntegrationsRouteModel> {
    const { organization, user } = this.modelFor(
      'authenticated.dashboard.organization-settings'
    ) as ModelFrom<AuthenticatedOrganizationSettingsRoute>;

    const url = `/api/organizations/${organization.get('id')}/github`;
    let integratedUser: IntegratedUser | null = null;
    let reconnect = false;

    try {
      const data = (await this.ajax.request(url)) as IntegratedUser;

      if (data) {
        integratedUser = data;
      }
    } catch (err) {
      if ((err as AjaxError).status === 400) {
        reconnect = true;
      }
    }

    return {
      integratedUser,
      reconnect,
      user,
      organization,
    };
  }
}
