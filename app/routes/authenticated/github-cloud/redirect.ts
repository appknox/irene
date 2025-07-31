import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import Transition from '@ember/routing/transition';

import OrganizationService from 'irene/services/organization';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

type GithubResponse = {
  login: string;
  html_url: string;
};

export default class AuthenticatedGithubRedirectRoute extends Route {
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  async beforeModel(transition: Transition) {
    const token = encodeURIComponent(
      transition.to?.queryParams['token'] as string
    );

    const url = `/api/organizations/${this.organization.selected?.id}/github`;

    try {
      const data = await this.ajax.post<GithubResponse>(url, {
        data: { token },
      });

      this.notify.success(`Successfully Integrated with user ${data.login}`);
    } catch (err) {
      this.notify.error(`Error Occured: ${(err as AjaxError).payload.message}`);
    }
  }

  async afterModel() {
    return this.router.transitionTo(
      'authenticated.dashboard.organization-settings.integrations'
    );
  }
}
