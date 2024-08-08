import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type MeService from 'irene/services/me';
import type { ModelFrom } from 'irene/utils/types';
import type AuthenticatedOrganizationSettingsRoute from '../organization-settings';

export default class AuthenticatedDashboardOrganizationSettingsIndexRoute extends Route {
  @service declare me: MeService;
  @service declare ajax: any;

  async model() {
    const { organization, user } = this.modelFor(
      'authenticated.dashboard.organization-settings'
    ) as ModelFrom<AuthenticatedOrganizationSettingsRoute>;

    const url = `/api/organizations/${organization.get('id')}/github`;
    let integratedUser: unknown | null = null;
    let reconnect = false;

    try {
      const data = await this.ajax.request(url);

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
      me: this.me,
    };
  }
}
