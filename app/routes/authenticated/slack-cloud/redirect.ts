import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import Transition from '@ember/routing/transition';

import OrganizationService from 'irene/services/organization';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

type SlackResponse = {
  api_token: string;
  channel_id: string;
};

export default class AuthenticatedSlackRedirectRoute extends Route {
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  async beforeModel(transition: Transition) {
    const token = encodeURIComponent(
      transition.to?.queryParams['token'] as string
    );

    const url = `/api/organizations/${this.organization.selected?.id}/slack`;

    try {
      await this.ajax.post<SlackResponse>(url, {
        data: { token },
      });

      this.notify.success(`Successfully Integrated with organization`);
    } catch (err) {
      const error = (err as AjaxError).payload.message;
      // If the error is a 400, it means the token is invalid or the user has no access
      if ((err as AjaxError).status === 400) {
        this.notify.error(
          'Invalid token or no access to the Slack organization'
        );
      }

      this.notify.error(
        error ? `Error occurred: ${error}` : 'Please try again'
      );
    }
  }

  async afterModel() {
    return this.router.transitionTo(
      'authenticated.dashboard.organization-settings'
    );
  }
}
